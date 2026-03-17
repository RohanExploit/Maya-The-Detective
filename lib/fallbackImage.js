/**
 * lib/fallbackImage.js
 * Tier-1 image fallback: second HuggingFace model (Wvolf/ViT_Deepfake_Detection).
 * Tier-2 image fallback: deterministic heuristic (file-size + magic-byte analysis).
 *
 * Fallback model: Wvolf/ViT_Deepfake_Detection (MIT)
 * Source: https://huggingface.co/Wvolf/ViT_Deepfake_Detection
 *
 * Attribution: Based on open-source ViT-based deepfake detection research.
 * License: MIT / Apache 2.0 — see HuggingFace model cards for details.
 */

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const FALLBACK_MODEL_1 = 'Wvolf/ViT_Deepfake_Detection';
const FALLBACK_MODEL_2 = 'prithivMLmods/Deep-Fake-Detector-Model';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryHFModel(modelId, fileBuffer, mimeType) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) return null;

  const url = `${HF_API_URL}/${modelId}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': mimeType,
        },
        body: fileBuffer,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.status === 503) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      if (!response.ok) return null;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const top = [...data].sort((a, b) => b.score - a.score)[0];
      if (typeof top.score !== 'number') return null;

      const label = (top.label || '').toLowerCase();
      let result;
      if (label.includes('fake') || label.includes('deepfake')) {
        result = 'Fake';
      } else if (label.includes('real')) {
        result = 'Real';
      } else {
        result = 'Suspicious';
      }

      return {
        result,
        confidence: Math.round(top.score * 100),
        explanation: [
          `Secondary model "${modelId.split('/')[1]}" detected: ${top.label} (${Math.round(top.score * 100)}%)`,
          'Vision transformer analysis of facial features and compression artifacts',
        ],
        source: 'fallback-hf',
      };
    } catch (_err) {
      clearTimeout(timer);
      if (attempt < 1) await sleep(1000);
    }
  }
  return null;
}

/**
 * Heuristic image analysis based on file properties.
 * @param {Buffer} fileBuffer
 * @returns {{ result: string, confidence: number, explanation: string[], source: string }}
 */
function heuristicImageAnalysis(fileBuffer) {
  const fileSizeKB = fileBuffer.length / 1024;
  const explanation = [];
  let suspicionScore = 55;

  // Check JPEG magic bytes (FF D8 FF)
  const isJpeg =
    fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8 && fileBuffer[2] === 0xff;
  // Check PNG magic bytes (89 50 4E 47)
  const isPng =
    fileBuffer[0] === 0x89 &&
    fileBuffer[1] === 0x50 &&
    fileBuffer[2] === 0x4e &&
    fileBuffer[3] === 0x47;

  if (!isJpeg && !isPng) {
    suspicionScore += 15;
    explanation.push('Image format may be non-standard (unexpected file signature)');
  } else {
    explanation.push('Standard image format detected (JPEG/PNG)');
  }

  if (fileSizeKB < 5) {
    suspicionScore += 20;
    explanation.push('File size unusually small — may lack natural image complexity');
  } else if (fileSizeKB > 500) {
    explanation.push('High-resolution image — sufficient detail for analysis');
  } else {
    explanation.push('File size within normal range');
  }

  return {
    result: 'Suspicious',
    confidence: Math.min(suspicionScore, 80),
    explanation: explanation.slice(0, 2),
    source: 'fallback-heuristic',
  };
}

/**
 * Analyze an image using fallback methods (secondary HF model then heuristic).
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @returns {Promise<{ result: string, confidence: number, explanation: string[], source: string }>}
 */
async function analyzeImageFallback(fileBuffer, mimeType) {
  const result1 = await tryHFModel(FALLBACK_MODEL_1, fileBuffer, mimeType);
  if (result1) return result1;

  const result2 = await tryHFModel(FALLBACK_MODEL_2, fileBuffer, mimeType);
  if (result2) return result2;

  return heuristicImageAnalysis(fileBuffer);
}

module.exports = { analyzeImageFallback };
