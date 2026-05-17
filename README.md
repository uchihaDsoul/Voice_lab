# 🎙️ Voice Lab — Acoustic Verification

A forensic audio analysis dashboard that classifies **emotion** (angry, calm, disgust, fear, happy, neutral, sad, surprised) and **danger level** (CALM / DANGER) from uploaded audio files using pre-trained Keras models.

---

## Project Structure

```
voicelab/
├── index.html              ← Frontend dashboard (host on GitHub Pages)
├── app.py                  ← Local Python inference server
├── requirements.txt        ← Python dependencies
│
│  Place these model files alongside app.py:
├── danger_model.keras
├── emotion_model.keras
├── le_dg.pkl
├── le_em.pkl
└── scaler.pkl
```

---

## Quick Start

### 1 — Install Python dependencies

```bash
pip install -r requirements.txt
```

### 2 — Copy your model files

Place all five model files next to `app.py`:
```
danger_model.keras   emotion_model.keras
le_dg.pkl            le_em.pkl            scaler.pkl
```

### 3 — Start the local inference server

```bash
python app.py
```

You should see:
```
Loading models…
Models ready ✓
 * Running on http://0.0.0.0:5000
```

### 4 — Open the dashboard

**Option A — directly from disk:**
Open `index.html` in your browser (double-click or drag into Chrome/Firefox).

**Option B — from GitHub Pages:**
The frontend is already deployed at your GitHub Pages URL. As long as `app.py` is running locally on port 5000, the page will connect automatically.

> ⚠️ The server status indicator in the top bar shows ● **Server online** when connected.

---

## Hosting on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages → Source: Deploy from a branch → main / root**.
3. Your dashboard will be live at `https://<your-username>.github.io/<repo>/`.
4. Every time you want to analyse audio, run `python app.py` locally first.

No backend hosting is required — the heavy lifting is done on your own machine.

---

## How It Works

| Step | Detail |
|------|--------|
| Feature extraction | 40 MFCC mean + 40 MFCC std + ZCR mean/std + RMS mean/std = **84 features** |
| Scaler | StandardScaler (`scaler.pkl`) normalises the features |
| Emotion model | Keras CNN → 8-class softmax (`emotion_model.keras`) |
| Danger model | Keras CNN → 2-class softmax (`danger_model.keras`) |
| Segment analysis | Audio is split into 1-second windows for the timeline |

### Supported formats
`WAV · MP3 · FLAC · OGG · M4A` — all decoded via librosa.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /health` | GET | Returns server status + class names |
| `POST /analyze` | POST | Accepts `multipart/form-data` with an `audio` field |

### Example `/analyze` response

```json
{
  "duration_s": 5.23,
  "sample_rate": 22050,
  "match_confidence": 94.1,
  "dominant_emotion": "happy",
  "dominant_danger": "CALM",
  "emotion_scores": { "happy": 94.1, "neutral": 3.2, ... },
  "danger_scores":  { "CALM": 99.9, "DANGER": 0.1 },
  "articulation_clarity": 72.3,
  "stress_indicator": 8.4,
  "emotion_timeline": [
    { "t": 0.0, "emotion": "happy", "confidence": 0.94 },
    ...
  ],
  "danger_timeline": [ ... ]
}
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **Server offline** badge | Make sure `python app.py` is running |
| `FileNotFoundError` | Check all 5 model files are in the same folder as `app.py` |
| CORS error in browser console | The `flask-cors` package must be installed |
| `librosa` not found | Run `pip install librosa` |
| Slow first prediction | TensorFlow cold-start; subsequent calls are fast |
