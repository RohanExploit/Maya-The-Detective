'use client';

import { useState, useCallback } from 'react';
import DropZone from '../components/DropZone';
import ResultCard from '../components/ResultCard';

/** Animated dot loader */
function DotLoader() {
  return (
    <span className="dot-loader inline-flex items-center gap-1 text-violet-400">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = useCallback((file) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || analyzing) return;

    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [selectedFile, analyzing]);

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-12">
      {/* Header */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-4xl">🛡️</span>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            DeepShield AI
          </h1>
        </div>
        <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
          Upload an image or audio clip to instantly detect deepfakes.
          Powered by HuggingFace AI with multi-tier fallback for 100% uptime.
        </p>
      </header>

      {/* Card container */}
      <div className="w-full max-w-lg space-y-5">
        {/* Upload area */}
        <section className="rounded-2xl bg-slate-900/70 border border-slate-700/60 p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Upload File
          </h2>
          <DropZone onFileSelected={handleFileSelected} disabled={analyzing} />

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200
                bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white shadow-lg shadow-violet-900/40
                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  Analyzing <DotLoader />
                </span>
              ) : (
                '🔍 Analyze'
              )}
            </button>

            {(selectedFile || result) && (
              <button
                onClick={handleReset}
                disabled={analyzing}
                className="py-3 px-4 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200
                  bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            )}
          </div>
        </section>

        {/* Error state */}
        {error && (
          <div className="rounded-2xl border border-red-700 bg-red-950/40 p-4 text-sm text-red-300">
            <span className="font-semibold">⚠️ Error: </span>{error}
          </div>
        )}

        {/* Result card */}
        {result && (
          <ResultCard
            result={result.result}
            confidence={result.confidence}
            explanation={result.explanation}
            source={result.source}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-600 space-y-1">
        <p>
          DeepShield AI · Built for hackathons · Powered by{' '}
          <a
            href="https://huggingface.co"
            className="text-slate-500 hover:text-slate-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            HuggingFace
          </a>
        </p>
        <p>
          Models:{' '}
          <a
            href="https://huggingface.co/dima806/deepfake_vs_real_image_detection"
            className="text-slate-500 hover:text-slate-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            dima806/deepfake_vs_real_image_detection
          </a>{' '}
          ·{' '}
          <a
            href="https://huggingface.co/Wvolf/ViT_Deepfake_Detection"
            className="text-slate-500 hover:text-slate-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wvolf/ViT_Deepfake_Detection
          </a>
        </p>
        <p className="pt-1">
          <a
            href="https://github.com/RohanExploit/Maya-The-Detective"
            className="text-slate-500 hover:text-slate-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
