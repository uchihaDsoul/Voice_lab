import io
import os
import time
import subprocess
import tempfile
import webbrowser
import threading
import numpy as np
import librosa
import pickle
from flask import Flask, request, jsonify, send_from_directory
from tensorflow.keras.models import load_model

# ── Load models & artefacts ───────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))

emotion_model = load_model(os.path.join(BASE, "emotion_model.keras"))
danger_model  = load_model(os.path.join(BASE, "danger_model.keras"))

with open(os.path.join(BASE, "scaler.pkl"), "rb") as f:
    scaler = pickle.load(f)

with open(os.path.join(BASE, "le_em.pkl"), "rb") as f:
    le_em = pickle.load(f)

with open(os.path.join(BASE, "le_dg.pkl"), "rb") as f:
    le_dg = pickle.load(f)

app = Flask(__name__, static_folder=BASE)

# ── Check what converters are available at startup ────────────────────────────

def _ffmpeg_available():
    try:
        subprocess.run(["ffmpeg", "-version"],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except Exception:
        return False

def _pydub_available():
    try:
        import pydub  # noqa
        return True
    except ImportError:
        return False

FFMPEG_OK = _ffmpeg_available()
PYDUB_OK  = _pydub_available()

print(f"[startup] ffmpeg={'yes' if FFMPEG_OK else 'no'}  pydub={'yes' if PYDUB_OK else 'no'}")

# ── Audio loading (multi-strategy) ────────────────────────────────────────────

def _convert_via_ffmpeg(audio_bytes: bytes) -> bytes:
    """Use ffmpeg CLI to convert any format → WAV bytes."""
    with tempfile.NamedTemporaryFile(suffix=".input", delete=False) as fin:
        fin.write(audio_bytes)
        fin_path = fin.name
    fout_path = fin_path + ".wav"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", fin_path,
             "-ar", "22050", "-ac", "1", "-f", "wav", fout_path],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True
        )
        with open(fout_path, "rb") as f:
            return f.read()
    finally:
        for p in (fin_path, fout_path):
            if os.path.exists(p):
                os.unlink(p)


def _convert_via_pydub(audio_bytes: bytes) -> bytes:
    """Use pydub (needs ffmpeg OR avconv underneath, but tries anyway)."""
    from pydub import AudioSegment
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
    audio = audio.set_channels(1).set_frame_rate(22050)
    buf = io.BytesIO()
    audio.export(buf, format="wav")
    return buf.getvalue()


def _convert_via_scipy(audio_bytes: bytes) -> bytes:
    """
    Pure-Python fallback for WebM/OGG recorded by Chrome/Firefox.
    Uses the 'av' (PyAV) library which ships its own demuxers – no ffmpeg binary needed.
    """
    import av  # pip install av
    buf_in = io.BytesIO(audio_bytes)
    buf_out = io.BytesIO()

    in_container  = av.open(buf_in)
    out_container = av.open(buf_out, mode="w", format="wav")

    in_stream  = in_container.streams.audio[0]
    out_stream = out_container.add_stream("pcm_s16le", rate=22050, layout="mono")

    resampler = av.AudioResampler(format="s16", layout="mono", rate=22050)

    for frame in in_container.decode(in_stream):
        frame.pts = None
        resampled = resampler.resample(frame)
        for rf in resampled:
            for packet in out_stream.encode(rf):
                out_container.mux(packet)

    for packet in out_stream.encode(None):
        out_container.mux(packet)

    out_container.close()
    in_container.close()
    return buf_out.getvalue()


def load_audio_safe(audio_bytes: bytes):
    """
    Try multiple strategies in order until one works:
      1. librosa direct  (WAV, FLAC, MP3 — always works)
      2. ffmpeg CLI      (if installed)
      3. pydub           (if installed)
      4. PyAV            (pure-Python, no binary needed)
    """
    errors = []

    # ── Strategy 1: librosa direct ────────────────────────────────────────────
    try:
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=None, mono=True)
        return y, sr
    except Exception as e:
        errors.append(f"librosa-direct: {e}")

    # ── Strategy 2: ffmpeg CLI ────────────────────────────────────────────────
    if FFMPEG_OK:
        try:
            wav_bytes = _convert_via_ffmpeg(audio_bytes)
            y, sr = librosa.load(io.BytesIO(wav_bytes), sr=None, mono=True)
            return y, sr
        except Exception as e:
            errors.append(f"ffmpeg-cli: {e}")

    # ── Strategy 3: pydub ─────────────────────────────────────────────────────
    if PYDUB_OK:
        try:
            wav_bytes = _convert_via_pydub(audio_bytes)
            y, sr = librosa.load(io.BytesIO(wav_bytes), sr=None, mono=True)
            return y, sr
        except Exception as e:
            errors.append(f"pydub: {e}")

    # ── Strategy 4: PyAV (no binary required) ────────────────────────────────
    try:
        wav_bytes = _convert_via_scipy(audio_bytes)
        y, sr = librosa.load(io.BytesIO(wav_bytes), sr=None, mono=True)
        return y, sr
    except Exception as e:
        errors.append(f"pyav: {e}")

    raise RuntimeError(" | ".join(errors))


# ── Feature extraction ────────────────────────────────────────────────────────

def extract_features(y: np.ndarray, sr: int) -> np.ndarray:
    """84-dim vector: 40 MFCC mean+std, ZCR mean+std, RMS mean+std."""
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    zcr  = librosa.feature.zero_crossing_rate(y)
    rms  = librosa.feature.rms(y=y)
    return np.concatenate([
        np.mean(mfcc, axis=1), np.std(mfcc, axis=1),
        [np.mean(zcr), np.std(zcr)],
        [np.mean(rms), np.std(rms)],
    ])


def predict_segment(y: np.ndarray, sr: int):
    feat   = extract_features(y, sr).reshape(1, -1)
    feat_s = scaler.transform(feat)
    feat_s = feat_s.reshape(feat_s.shape[0], feat_s.shape[1], 1)

    em_probs = emotion_model.predict(feat_s, verbose=0)[0]
    dg_probs = danger_model.predict(feat_s, verbose=0)[0]

    em_label = le_em.inverse_transform([np.argmax(em_probs)])[0]
    dg_label = le_dg.inverse_transform([np.argmax(dg_probs)])[0]
    return em_label, em_probs, dg_label, dg_probs


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(BASE, "index.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_bytes = request.files["audio"].read()
    if not audio_bytes:
        return jsonify({"error": "Empty audio file"}), 400

    try:
        y, sr = load_audio_safe(audio_bytes)
    except Exception as e:
        return jsonify({"error": f"Could not decode audio: {e}"}), 422

    duration_s = librosa.get_duration(y=y, sr=sr)

    # Full-file prediction
    em_label, em_probs, dg_label, dg_probs = predict_segment(y, sr)

    emotion_scores = {
        lbl: float(round(p * 100, 2))
        for lbl, p in zip(le_em.classes_, em_probs)
    }
    danger_scores = {
        lbl: float(round(p * 100, 2))
        for lbl, p in zip(le_dg.classes_, dg_probs)
    }
    match_confidence = float(round(np.max(em_probs) * 100, 2))

    # Per-second emotion timeline
    seg_samples = int(sr * 1)
    timeline = []
    for start in range(0, len(y), seg_samples):
        seg = y[start: start + seg_samples]
        if len(seg) < sr * 0.1:
            continue
        try:
            s_em, s_em_probs, _, _ = predict_segment(seg, sr)
            timeline.append({
                "t":          round(start / sr, 2),
                "emotion":    s_em,
                "confidence": float(round(np.max(s_em_probs), 4)),
            })
        except Exception:
            pass

    # Audio quality metrics
    spec_flat = librosa.feature.spectral_flatness(y=y)
    clarity   = float(round((1 - float(np.mean(spec_flat))) * 100, 2))

    stft         = np.abs(librosa.stft(y))
    freqs        = librosa.fft_frequencies(sr=sr)
    high_mask    = freqs >= 3000
    total_energy = float(np.sum(stft ** 2))
    high_energy  = float(np.sum(stft[high_mask] ** 2))
    stress       = float(round((high_energy / total_energy) * 100, 2)) if total_energy > 0 else 0.0

    return jsonify({
        "dominant_emotion":     em_label,
        "dominant_danger":      dg_label,
        "emotion_scores":       emotion_scores,
        "danger_scores":        danger_scores,
        "match_confidence":     match_confidence,
        "emotion_timeline":     timeline,
        "duration_s":           round(duration_s, 3),
        "sample_rate":          int(sr),
        "articulation_clarity": clarity,
        "stress_indicator":     stress,
    })


# ── Auto-open browser ─────────────────────────────────────────────────────────

def open_browser():
    time.sleep(1.2)
    webbrowser.open("http://localhost:5000")


if __name__ == "__main__":
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host="0.0.0.0", port=5000, debug=False)