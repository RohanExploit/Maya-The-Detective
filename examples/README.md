# Example Images for DeepShield AI

This directory contains example images you can use to test the DeepShield AI detector.

## Getting Example Images

### Real Face
Download a real human photo from a royalty-free source:
- [Unsplash — faces](https://unsplash.com/s/photos/face) (free, Unsplash License)
- [Pexels — portraits](https://www.pexels.com/search/portrait/) (free, Pexels License)

Save as `real_face.jpg`.

### Deepfake / AI-Generated Face
Get a GAN-generated face from:
- [ThisPersonDoesNotExist.com](https://thispersondoesnotexist.com/) — each reload gives a new StyleGAN face

Save as `fake_face.jpg`.

## Acceptance Tests

| Test | File | Expected Result |
|------|------|-----------------|
| Real face | real_face.jpg | `Real` or `Suspicious` |
| GAN face | fake_face.jpg | `Fake` or `Suspicious` with confidence > 60 |
| No API key | any image | `Suspicious` (heuristic fallback) |
| Text file | test.txt | 400 error |
