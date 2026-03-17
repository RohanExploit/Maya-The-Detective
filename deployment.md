# Vercel Deployment Guide

## Prerequisites

- Vercel account (free tier works)
- GitHub repository with this code
- HuggingFace API token (free at https://huggingface.co/settings/tokens)

---

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `RohanExploit/Maya-The-Detective`
4. Keep all defaults (Framework: Next.js is auto-detected)

### 3. Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Variable | Value | Required |
|----------|-------|----------|
| `HF_API_KEY` | `hf_your_huggingface_token` | ✅ Yes |
| `RENDER_SERVICE_URL` | `https://your-render-service.onrender.com` | ❌ Optional |

### 4. Deploy

Click **Deploy**. Vercel will:
1. Install dependencies (`npm install`)
2. Build the app (`next build`)
3. Deploy serverless functions for `/api/detect`

### 5. Verify

Once deployed, your URL will be:
```
https://maya-the-detective.vercel.app
```
(or a custom domain you configure)

Test the API:
```bash
curl -X POST https://your-app.vercel.app/api/detect \
  -F "file=@examples/real_face.jpg"
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `HF_API_KEY` | HuggingFace Inference API token. Get one at https://huggingface.co/settings/tokens | `hf_xxxxxxxxxxxx` |
| `RENDER_SERVICE_URL` | Optional URL of a self-hosted Deepfake-detector backend on Render.com | `https://deepfake-detector.onrender.com` |

---

## Vercel Function Limits

- **Execution timeout**: 30 seconds (configured via `maxDuration` in route.js)
- **Body size**: 4.5 MB (Vercel default; sufficient for most images)
- **Regions**: All (Edge Network)

---

## CI/CD

GitHub Actions automatically runs on every push:
- `npm run lint` — ESLint
- `npm run build` — Next.js production build
- `node scripts/smoke-test.js` — Library smoke tests

See `.github/workflows/ci.yml` for details.

---

## Custom Domain

In Vercel dashboard → Project → Settings → Domains:
```
deepshield.yourdomain.com  →  CNAME  →  cname.vercel-dns.com
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `HF_API_KEY is not set` | Add env var in Vercel project settings |
| 503 from HuggingFace | Model is loading; retry in 30s. App auto-retries 3x. |
| Build fails | Check Node.js version (18+) in Vercel settings |
| File too large | Compress image below 4.5 MB |
