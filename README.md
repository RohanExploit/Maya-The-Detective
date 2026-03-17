# DeepShield AI — Deepfake Detector

> **Hackathon pitch:** DeepShield AI is a production-ready, zero-infrastructure deepfake detector that analyzes images and audio in seconds. Built on HuggingFace's state-of-the-art Vision Transformer models with a bulletproof 3-tier fallback architecture, it *never crashes in a demo*. Upload → Analyze → Know the truth — all from a polished Next.js UI that runs 100% on Vercel's free tier.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRohanExploit%2FMaya-The-Detective)

---

## ✨ Features

- 🖼️ **Image deepfake detection** — drag & drop JPEG / PNG / WEBP
- 🎵 **Audio analysis** — upload WAV / MP3 / OGG
- 🤖 **3-tier fallback** — Primary HF API → Secondary HF model → Deterministic heuristic
- 📊 **Confidence bar** — 0–100% with color-coded result (🚨 Fake / ⚠️ Suspicious / ✅ Real)
- 💡 **Explainability bullets** — human-friendly reasoning for every result
- 🔒 **Never crashes** — heuristic final fallback always returns a safe response

---

## 🏗️ Architecture

```
Frontend (Next.js App Router)  →  /api/detect  →  HuggingFace Inference API
                                                        ↓ (on failure)
                                                  Secondary HF model
                                                        ↓ (on failure)
                                              Deterministic heuristic
```

**API contract — `POST /api/detect`**

Request: `multipart/form-data` with `file` (required) field.

Response:
```json
{
  "result": "Fake" | "Real" | "Suspicious",
  "confidence": 0-100,
  "explanation": ["reason 1", "reason 2"],
  "source": "primary-api" | "fallback-hf" | "fallback-heuristic"
}
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- A free HuggingFace account

### 1. Clone & install

```bash
git clone https://github.com/RohanExploit/Maya-The-Detective.git
cd Maya-The-Detective
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local and add your HuggingFace token:
# HF_API_KEY=hf_your_token_here
```

Get a free HuggingFace token at: https://huggingface.co/settings/tokens

### 3. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Test the API

```bash
# Smoke tests (no server required)
node scripts/smoke-test.js

# Manual API test (with server running)
curl -X POST http://localhost:3000/api/detect \
  -F "file=@examples/real_face.jpg"
```

---

## ☁️ Deploy to Vercel

See [deployment.md](deployment.md) for full instructions.

Quick deploy:
1. Fork this repo
2. Import to [Vercel](https://vercel.com/new)
3. Set `HF_API_KEY` in Environment Variables
4. Deploy!

---

## 📂 Project Structure

```
├── app/
│   ├── layout.js              # Root layout (Tailwind, metadata)
│   ├── page.js                # Main upload & results UI
│   ├── globals.css            # Tailwind + dot-loader animation
│   └── api/detect/route.js    # Detection API endpoint
├── lib/
│   ├── apiClient.js           # Primary HuggingFace API (retry + backoff)
│   ├── fallbackImage.js       # Image fallback (secondary HF + heuristic)
│   └── fallbackAudio.js       # Audio fallback (wav2vec2 + heuristic)
├── components/
│   ├── DropZone.js            # Drag-and-drop file upload
│   └── ResultCard.js          # Color-coded result display
├── scripts/
│   └── smoke-test.js          # Basic acceptance tests
├── examples/
│   ├── real_face.jpg          # Example real image (placeholder)
│   ├── fake_face.jpg          # Example GAN image (placeholder)
│   └── README.md              # Instructions for getting example images
├── .github/workflows/ci.yml   # GitHub Actions CI (lint + build + test)
├── .env.example               # Environment variable template
├── deployment.md              # Vercel deployment guide
└── dev-prompt.txt             # Developer continuation prompt
```

---

## 🔍 Open-Source Attribution

### Image Detection Models (Apache 2.0 / MIT)

| Model | Source | License | Use |
|-------|--------|---------|-----|
| `dima806/deepfake_vs_real_image_detection` | [HuggingFace](https://huggingface.co/dima806/deepfake_vs_real_image_detection) | Apache 2.0 | Primary |
| `Wvolf/ViT_Deepfake_Detection` | [HuggingFace](https://huggingface.co/Wvolf/ViT_Deepfake_Detection) | MIT | Fallback 1 |
| `prithivMLmods/Deep-Fake-Detector-Model` | [HuggingFace](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-Model) | Apache 2.0 | Fallback 2 |

### Audio Model (Apache 2.0)

| Model | Source | License | Use |
|-------|--------|---------|-----|
| `facebook/wav2vec2-base` | [HuggingFace](https://huggingface.co/facebook/wav2vec2-base) | Apache 2.0 | Audio fallback |

### Candidate Repos Vetted

| Repo | License | Complexity | Decision |
|------|---------|------------|----------|
| [namandhakad712/Deepfake-detector](https://github.com/namandhakad712/Deepfake-detector) | MIT | Medium (Python Flask) | Optional via `RENDER_SERVICE_URL` |
| [dima806 HF model](https://huggingface.co/dima806/deepfake_vs_real_image_detection) | Apache 2.0 | Low (REST API) | ✅ Primary |
| [Wvolf ViT model](https://huggingface.co/Wvolf/ViT_Deepfake_Detection) | MIT | Low (REST API) | ✅ Fallback 1 |

> **Note:** If you want stricter accuracy, we can swap the HF model with an on-device GPU model — not recommended for this hackathon.

---

## ✅ Acceptance Tests

| Test | Method | Expected |
|------|--------|----------|
| Real face image | Upload `examples/real_face.jpg` | `Real` or `Suspicious` with explanation |
| GAN face image | Upload `examples/fake_face.jpg` | `Fake` or `Suspicious`, confidence > 60 |
| No API key | Remove `HF_API_KEY`, upload any image | `Suspicious` (heuristic fallback) |
| Unsupported type | Upload `.txt` file | 400 error with friendly message |

Run locally:
```bash
node scripts/smoke-test.js
```

---

## 🤝 Integrating namandhakad712/Deepfake-detector

The [Deepfake-detector](https://github.com/namandhakad712/Deepfake-detector) backend can be self-hosted on Render:
1. Fork the repo and deploy to [Render.com](https://render.com) as a Web Service
2. Set `RENDER_SERVICE_URL=https://your-service.onrender.com` in your Vercel env vars
3. The `/api/detect` route will optionally call this service for enhanced detection

---

## 📄 License

MIT
