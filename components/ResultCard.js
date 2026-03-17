/**
 * components/ResultCard.js
 * Color-coded result card with confidence bar and explainability bullets.
 */
'use client';

const SOURCE_LABELS = {
  'primary-api': 'Primary AI Model',
  'fallback-hf': 'Secondary AI Model',
  'fallback-heuristic': 'Heuristic Analysis',
};

const RESULT_STYLES = {
  Fake: {
    border: 'border-red-500',
    bg: 'bg-red-950/40',
    badge: 'bg-red-500 text-white',
    bar: 'bg-red-500',
    icon: '🚨',
    text: 'text-red-400',
  },
  Real: {
    border: 'border-green-500',
    bg: 'bg-green-950/40',
    badge: 'bg-green-500 text-white',
    bar: 'bg-green-500',
    icon: '✅',
    text: 'text-green-400',
  },
  Suspicious: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-950/30',
    badge: 'bg-yellow-500 text-black',
    bar: 'bg-yellow-400',
    icon: '⚠️',
    text: 'text-yellow-400',
  },
};

export default function ResultCard({ result, confidence, explanation, source }) {
  const style = RESULT_STYLES[result] ?? RESULT_STYLES.Suspicious;
  const sourceLabel = SOURCE_LABELS[source] ?? source;

  return (
    <div
      className={`rounded-2xl border-2 p-6 ${style.border} ${style.bg} shadow-xl transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{style.icon}</span>
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-wide ${style.badge}`}
            >
              {result.toUpperCase()}
            </span>
            <p className="text-xs text-slate-400 mt-1">Detection result</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${style.text}`}>{confidence}%</p>
          <p className="text-xs text-slate-500">confidence</p>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Confidence level</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Why?
        </p>
        <ul className="space-y-1.5">
          {(explanation || []).map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="mt-0.5 text-slate-500">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Source */}
      <div className="pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          🔍 Source:{' '}
          <span className="text-slate-400 font-medium">{sourceLabel}</span>
        </p>
      </div>
    </div>
  );
}
