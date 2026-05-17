"""
Voice Lab – Local Inference Server
Run:  python app.py
Open: http://localhost:5000

The server serves index.html at / AND handles /health and /analyze.
This means the page and API share the same origin — no CORS or
mixed-content issues, regardless of browser security settings.

Place these files alongside app.py:
  danger_model.keras  emotion_model.keras  le_dg.pkl  le_em.pkl  scaler.pkl
"""

import os, io, warnings, webbrowser, threading, time
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
warnings.filterwarnings("ignore")

import pickle
import numpy as np
import librosa
from flask import Flask, request, jsonify, send_from_directory
import tensorflow as tf

BASE = os.path.dirname(os.path.abspath(__file__))
app  = Flask(__name__, static_folder=BASE, static_url_path="")

# ── Load models ──────────────────────────────────────────────────────────────
def load_artifact(name):
    path = os.path.join(BASE, name)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"\n❌  Missing: {path}\n"
            f"    Copy all 5 model files next to app.py and try again.\n"
        )
    return path

print("Loading models…")
le_em    = pickle.load(open(load_artifact("le_em.pkl"),  "rb"))
le_dg    = pickle.load(open(load_artifact("le_dg.pkl"),  "rb"))
scaler   = pickle.load(open(load_artifact("scaler.pkl"), "rb"))
em_model = tf.keras.models.load_model(load_artifact("emotion_model.keras"))
dg_model = tf.keras.models.load_model(load_artifact("danger_model.keras"))
print("Models ready ✓")

# ── Serve the frontend ────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(BASE, "index.html")


def extract_features(y: np.ndarray, sr: int) -> np.ndarray:
    """Returns a 84-dim feature vector matching the training pipeline."""
    mfcc  = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    zcr   = librosa.feature.zero_crossing_rate(y)
    rms   = librosa.feature.rms(y=y)
    return np.concatenate([
        np.mean(mfcc, axis=1), np.std(mfcc, axis=1),
        [np.mean(zcr)], [np.std(zcr)],
        [np.mean(rms)], [np.std(rms)],
    ])

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({"status": "ok", "emotions": list(le_em.classes_),
                    "danger_classes": list(le_dg.classes_)})

@app.route("/analyze", methods=["POST"])
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file in request"}), 400

    audio_file = request.files["audio"]
    audio_bytes = audio_file.read()

    try:
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=None, mono=True)
    except Exception as e:
        return jsonify({"error": f"Could not decode audio: {e}"}), 422

    # ── per-segment analysis (1-second windows) ──────────────────────────────
    duration_s  = librosa.get_duration(y=y, sr=sr)
    segment_len = sr  # 1 second
    segments    = max(1, int(len(y) // segment_len))

    emotion_timeline = []   # list of {t, emotion, confidence}
    danger_timeline  = []

    for i in range(segments):
        chunk = y[i * segment_len : (i + 1) * segment_len]
        if len(chunk) < sr // 4:
            continue
        feat   = extract_features(chunk, sr).reshape(1, -1)
        scaled = scaler.transform(feat)

        em_prob = em_model.predict(scaled, verbose=0)[0]
        dg_prob = dg_model.predict(scaled, verbose=0)[0]

        emotion_timeline.append({
            "t": round(i * (duration_s / segments), 2),
            "emotion": le_em.classes_[int(np.argmax(em_prob))],
            "confidence": float(np.max(em_prob)),
        })
        danger_timeline.append({
            "t": round(i * (duration_s / segments), 2),
            "label": le_dg.classes_[int(np.argmax(dg_prob))],
            "confidence": float(np.max(dg_prob)),
        })

    # ── aggregate stats ───────────────────────────────────────────────────────
    all_feat   = extract_features(y, sr).reshape(1, -1)
    all_scaled = scaler.transform(all_feat)
    em_global  = em_model.predict(all_scaled, verbose=0)[0]
    dg_global  = dg_model.predict(all_scaled, verbose=0)[0]

    emotion_scores = {k: round(float(v) * 100, 1)
                      for k, v in zip(le_em.classes_, em_global)}
    danger_scores  = {k: round(float(v) * 100, 1)
                      for k, v in zip(le_dg.classes_, dg_global)}

    dominant_emotion  = le_em.classes_[int(np.argmax(em_global))]
    dominant_danger   = le_dg.classes_[int(np.argmax(dg_global))]

    # ── audio quality meta ────────────────────────────────────────────────────
    # Estimate articulation clarity via spectral flatness (lower = more tonal/clear)
    spec_flat  = float(np.mean(librosa.feature.spectral_flatness(y=y)))
    clarity    = round(max(0, min(100, (1 - spec_flat * 50) * 100)), 1)
    # Stress indicator: high-frequency energy ratio
    D          = np.abs(librosa.stft(y))
    freqs      = librosa.fft_frequencies(sr=sr)
    hi_mask    = freqs > 3000
    stress     = round(float(np.mean(D[hi_mask])) / float(np.mean(D) + 1e-9) * 15, 1)
    stress     = min(stress, 100)

    match_conf = round(float(np.max(em_global)) * 100, 1)

    return jsonify({
        "duration_s":        round(duration_s, 2),
        "sample_rate":       sr,
        "match_confidence":  match_conf,
        "dominant_emotion":  dominant_emotion,
        "dominant_danger":   dominant_danger,
        "emotion_scores":    emotion_scores,
        "danger_scores":     danger_scores,
        "articulation_clarity": clarity,
        "stress_indicator":  stress,
        "emotion_timeline":  emotion_timeline,
        "danger_timeline":   danger_timeline,
    })

if __name__ == "__main__":
    url = "http://localhost:5000"
    def _open():
        time.sleep(1.2)
        webbrowser.open(url)
    threading.Thread(target=_open, daemon=True).start()
    print(f"\n✅  Voice Lab running → {url}\n   (opening in your browser…)\n")
    app.run(host="0.0.0.0", port=5000, debug=False)
