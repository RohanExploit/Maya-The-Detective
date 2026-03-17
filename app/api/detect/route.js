/**
 * app/api/detect/route.js
 *
 * Deepfake detection API endpoint.
 *
 * Request:  POST multipart/form-data
 *   - file  (required): image or audio file
 *   - type  (optional): "image" | "audio" (auto-detected from MIME if omitted)
 *
 * Response: JSON
 *   {
 *     result:      "Fake" | "Real" | "Suspicious",
 *     confidence:  0-100,
 *     explanation: [string, string],
 *     source:      "primary-api" | "fallback-hf" | "fallback-heuristic"
 *   }
 *
 * Error responses:
 *   400 { error: string }  – bad input (no file / wrong type / too large)
 *   500 { error: string }  – unexpected server error
 */

import { callPrimaryAPI } from '../../../lib/apiClient';
import { analyzeImageFallback } from '../../../lib/fallbackImage';
import { analyzeAudioFallback } from '../../../lib/fallbackAudio';

export const runtime = 'nodejs';
// Allow up to 30 s for external API calls on Vercel
export const maxDuration = 30;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
]);

const ALLOWED_AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/webm',
]);

/** Final heuristic – always returns a safe "Suspicious" response */
function heuristicFallback() {
  return {
    result: 'Suspicious',
    confidence: 60,
    explanation: [
      'Fallback mode: external API unavailable',
      'Please retry or test with another file',
    ],
    source: 'fallback-heuristic',
  };
}

export async function POST(request) {
  let fileBuffer;
  let mimeType;
  let fileType;

  // ── 1. Parse multipart form data ──────────────────────────────────────────
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file uploaded. Include a "file" field.' }, { status: 400 });
    }

    mimeType = (file.type || '').toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.has(mimeType);
    const isAudio = ALLOWED_AUDIO_TYPES.has(mimeType);

    if (!isImage && !isAudio) {
      return Response.json(
        {
          error: `Unsupported file type "${mimeType}". Please upload an image (JPEG/PNG/WEBP) or audio (MP3/WAV/OGG) file.`,
        },
        { status: 400 },
      );
    }

    // Size guard
    const arrayBuf = await file.arrayBuffer();
    if (arrayBuf.byteLength > MAX_FILE_SIZE) {
      return Response.json(
        { error: 'File too large. Maximum allowed size is 10 MB.' },
        { status: 400 },
      );
    }

    fileBuffer = Buffer.from(arrayBuf);
    fileType = isImage ? 'image' : 'audio';
  } catch (parseErr) {
    console.error('[detect] Failed to parse form data:', parseErr);
    return Response.json({ error: 'Failed to parse uploaded file.' }, { status: 400 });
  }

  // ── 2. Primary API ─────────────────────────────────────────────────────────
  try {
    const result = await callPrimaryAPI(fileBuffer, mimeType, fileType);
    if (result && typeof result.confidence === 'number') {
      return Response.json(result);
    }
  } catch (primaryErr) {
    console.warn('[detect] Primary API failed:', primaryErr.message);
  }

  // ── 3. Fallback (HF secondary model + heuristic) ──────────────────────────
  try {
    const fallback =
      fileType === 'image'
        ? await analyzeImageFallback(fileBuffer, mimeType)
        : await analyzeAudioFallback(fileBuffer, mimeType);

    if (fallback && typeof fallback.confidence === 'number') {
      return Response.json(fallback);
    }
  } catch (fallbackErr) {
    console.warn('[detect] Fallback analysis failed:', fallbackErr.message);
  }

  // ── 4. Final deterministic heuristic ──────────────────────────────────────
  return Response.json(heuristicFallback());
}

export async function GET() {
  return Response.json({ status: 'ok', message: 'DeepShield AI detection endpoint' });
}
