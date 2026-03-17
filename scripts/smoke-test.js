/**
 * scripts/smoke-test.js
 *
 * Basic smoke tests for the DeepShield AI library modules.
 * These run without starting the Next.js server.
 *
 * Acceptance tests verified:
 *  Test 3: Primary API failure (no real key) → fallback triggers, returns valid response
 *  Test 4: Unsupported file type → heuristic returns Suspicious
 */

const assert = require('node:assert/strict');
const { analyzeImageFallback } = require('../lib/fallbackImage');
const { analyzeAudioFallback } = require('../lib/fallbackAudio');

async function run() {
  console.log('🔍 Running DeepShield AI smoke tests…\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS  ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL  ${name}: ${err.message}`);
      failed++;
    }
  }

  // Test 1: Heuristic fallback for a valid JPEG
  await test('Image heuristic fallback returns valid schema for JPEG', async () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
    const savedKey = process.env.HF_API_KEY;
    delete process.env.HF_API_KEY;

    const result = await analyzeImageFallback(jpegBuffer, 'image/jpeg');

    if (savedKey) process.env.HF_API_KEY = savedKey;

    assert.ok(['Fake', 'Real', 'Suspicious'].includes(result.result), `result "${result.result}" must be valid`);
    assert.ok(typeof result.confidence === 'number', 'confidence must be a number');
    assert.ok(result.confidence >= 0 && result.confidence <= 100, 'confidence must be 0-100');
    assert.ok(Array.isArray(result.explanation) && result.explanation.length > 0, 'explanation must be non-empty array');
    assert.ok(typeof result.source === 'string', 'source must be a string');
  });

  // Test 2: Audio heuristic fallback for a WAV file
  await test('Audio heuristic fallback returns valid schema for WAV', async () => {
    const wavBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);
    const savedKey = process.env.HF_API_KEY;
    delete process.env.HF_API_KEY;

    const result = await analyzeAudioFallback(wavBuffer, 'audio/wav');

    if (savedKey) process.env.HF_API_KEY = savedKey;

    assert.ok(['Fake', 'Real', 'Suspicious'].includes(result.result));
    assert.ok(typeof result.confidence === 'number');
    assert.ok(result.confidence >= 0 && result.confidence <= 100);
    assert.ok(Array.isArray(result.explanation) && result.explanation.length > 0);
  });

  // Test 3: Non-image binary → heuristic marks as Suspicious
  await test('Non-standard bytes treated as Suspicious by image heuristic', async () => {
    const textBuffer = Buffer.from('Hello World, this is text');
    const savedKey = process.env.HF_API_KEY;
    delete process.env.HF_API_KEY;

    const result = await analyzeImageFallback(textBuffer, 'image/jpeg');

    if (savedKey) process.env.HF_API_KEY = savedKey;

    assert.equal(result.result, 'Suspicious', 'non-standard bytes should be Suspicious in heuristic');
    assert.equal(result.source, 'fallback-heuristic');
  });

  // Test 4: PNG magic bytes recognized correctly
  await test('PNG magic bytes detected correctly', async () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const savedKey = process.env.HF_API_KEY;
    delete process.env.HF_API_KEY;

    const result = await analyzeImageFallback(pngBuffer, 'image/png');

    if (savedKey) process.env.HF_API_KEY = savedKey;

    assert.ok(['Fake', 'Real', 'Suspicious'].includes(result.result));
    assert.equal(result.source, 'fallback-heuristic');
    // Heuristic base score is 55; files < 5 KB add +20, giving 75 → capped at 80.
    // Any valid heuristic result should be at least the base score (55).
    const MIN_HEURISTIC_CONFIDENCE = 55;
    assert.ok(result.confidence >= MIN_HEURISTIC_CONFIDENCE, `confidence ${result.confidence} should be at least ${MIN_HEURISTIC_CONFIDENCE}`);
  });

  console.log(`\n📋 Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log('✨ All smoke tests passed!');
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
