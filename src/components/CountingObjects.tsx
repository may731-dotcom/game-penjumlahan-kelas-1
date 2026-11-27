import {useEffect, useState} from 'react';
import type {CountObjectType} from '../types';
import {playCountTickSound} from '../lib/sound';

function ObjectSvg({type, marked}: {type: CountObjectType; marked: boolean}) {
  const opacityClass = marked ? 'opacity-100 scale-105' : 'opacity-95';

  switch (type) {
    case 'apel':
      return (
        <svg viewBox="0 0 48 48" className={`w-10 h-10 sm:w-11 sm:h-11 transition-transform ${opacityClass}`} aria-hidden="true">
          <path d="M24 12 C24 8, 28 5, 31 6" fill="none" stroke="#65A30D" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="29" cy="9" rx="5" ry="2.5" fill="#84CC16" transform="rotate(-20 29 9)" />
          <path
            d="M24 14 C16 12, 9 18, 10 28 C11 37, 17 42, 22 41 C23 41, 24 40, 24 40 C24 40, 25 41, 26 41 C31 42, 37 37, 38 28 C39 18, 32 12, 24 14 Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="2"
          />
          <ellipse cx="17" cy="21" rx="2.2" ry="4" fill="#FCA5A5" opacity="0.65" transform="rotate(-15 17 21)" />
        </svg>
      );
    case 'bintang':
      return (
        <svg viewBox="0 0 48 48" className={`w-10 h-10 sm:w-11 sm:h-11 transition-transform ${opacityClass}`} aria-hidden="true">
          <path
            d="M24 6 L29.4 17.1 L41.6 18.8 L32.8 27.4 L34.9 39.6 L24 33.8 L13.1 39.6 L15.2 27.4 L6.4 18.8 L18.6 17.1 Z"
            fill="#FACC15"
            stroke="#B45309"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="22" r="1.8" fill="#78350F" />
          <circle cx="28" cy="22" r="1.8" fill="#78350F" />
          <path d="M21 26 Q24 29 27 26" fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'bebek':
      return (
        <svg viewBox="0 0 48 48" className={`w-10 h-10 sm:w-11 sm:h-11 transition-transform ${opacityClass}`} aria-hidden="true">
          <ellipse cx="23" cy="31" rx="13" ry="9" fill="#FDE047" stroke="#A16207" strokeWidth="2" />
          <circle cx="29" cy="18" r="8" fill="#FDE047" stroke="#A16207" strokeWidth="2" />
          <path d="M36 17 L43 19 L36 22 Z" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="31" cy="16" r="1.7" fill="#1E293B" />
          <path d="M16 29 Q22 25 27 31" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'balok':
      return (
        <svg viewBox="0 0 48 48" className={`w-10 h-10 sm:w-11 sm:h-11 transition-transform ${opacityClass}`} aria-hidden="true">
          <rect x="9" y="13" width="30" height="26" rx="5" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" />
          <rect x="14" y="8" width="8" height="6" rx="2" fill="#60A5FA" stroke="#1E40AF" strokeWidth="1.8" />
          <rect x="26" y="8" width="8" height="6" rx="2" fill="#60A5FA" stroke="#1E40AF" strokeWidth="1.8" />
          <rect x="14" y="19" width="20" height="4" rx="2" fill="#93C5FD" opacity="0.6" />
        </svg>
      );
    case 'pensil':
      return (
        <svg viewBox="0 0 48 48" className={`w-10 h-10 sm:w-11 sm:h-11 transition-transform ${opacityClass}`} aria-hidden="true">
          <g transform="rotate(-35 24 24)">
            <rect x="19" y="10" width="10" height="24" rx="2" fill="#10B981" stroke="#065F46" strokeWidth="2" />
            <rect x="19" y="8" width="10" height="5" rx="1.5" fill="#FDA4AF" stroke="#065F46" strokeWidth="1.8" />
            <polygon points="19,34 29,34 24,42" fill="#FDE68A" stroke="#065F46" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="22.5,39 25.5,39 24,42" fill="#1E293B" />
          </g>
        </svg>
      );
  }
}

interface CountingObjectsProps {
  questionId: string;
  objectType: CountObjectType;
  count: number;
  soundEnabled: boolean;
}

export function CountingObjects({questionId, objectType, count, soundEnabled}: CountingObjectsProps) {
  const [markedIndices, setMarkedIndices] = useState<number[]>([]);

  useEffect(() => {
    setMarkedIndices([]);
  }, [questionId]);

  const toggleIndex = (idx: number) => {
    setMarkedIndices((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((item) => item !== idx);
      }
      playCountTickSound(soundEnabled, prev.length);
      return [...prev, idx];
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Sentuh benda untuk membantu menghitung satu per satu</span>
        <span className="font-mono tabular-nums font-medium text-slate-700">
          Ditandai: {markedIndices.length}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2.5 sm:gap-3 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-xl mx-auto">
        {Array.from({length: count}, (_, i) => {
          const orderNum = markedIndices.indexOf(i) + 1;
          const isMarked = orderNum > 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggleIndex(i)}
              aria-label={`Benda ke-${i + 1}${isMarked ? `, hitungan ${orderNum}` : ''}`}
              className={`relative min-h-[54px] sm:min-h-[60px] rounded-xl flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isMarked
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-xs'
                  : 'bg-white border border-slate-200 hover:border-slate-300 active:scale-95'
              }`}
            >
              <ObjectSvg type={objectType} marked={isMarked} />
              {isMarked && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-mono font-bold tabular-nums flex items-center justify-center shadow-xs">
                  {orderNum}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VisualDotGrid({value, colorClass = 'bg-blue-600'}: {value: number; colorClass?: string}) {
  const capped = Math.min(value, 50);
  const tens = Math.floor(capped / 10);
  const ones = capped % 10;

  return (
    <div className="flex flex-col items-center gap-2 mt-3" aria-hidden="true">
      {tens > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({length: tens}, (_, tIdx) => (
            <div
              key={tIdx}
              className="grid grid-cols-5 gap-1 p-1.5 rounded-lg bg-slate-100 border border-slate-200"
            >
              {Array.from({length: 10}, (_, dIdx) => (
                <span key={dIdx} className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
              ))}
            </div>
          ))}
        </div>
      )}
      {ones > 0 && (
        <div className="grid grid-cols-5 gap-1 p-1.5 rounded-lg bg-slate-100 border border-slate-200">
          {Array.from({length: ones}, (_, dIdx) => (
            <span key={dIdx} className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function VisualOperationBlocks({
  a,
  b,
  operator,
}: {
  a: number;
  b: number;
  operator: '+' | '-';
}) {
  if (a > 25 || b > 25) {
    return (
      <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center">
        Tip: Hitung puluhan terlebih dahulu, lalu tambahkan atau kurangkan satuannya.
      </div>
    );
  }

  if (operator === '+') {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Balok biru: {a}</span>
          <span>Balok kuning: {b}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {Array.from({length: a}, (_, i) => (
            <span
              key={`a_${i}`}
              className="w-6 h-6 rounded-md bg-blue-600 border border-blue-700"
              aria-hidden="true"
            />
          ))}
          <span className="w-2" aria-hidden="true" />
          {Array.from({length: b}, (_, i) => (
            <span
              key={`b_${i}`}
              className="w-6 h-6 rounded-md bg-amber-400 border border-amber-500"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 max-w-xl mx-auto">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Balok awal: {a}</span>
        <span>Diambil (dicoret): {b}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({length: a}, (_, i) => {
          const isRemoved = i >= a - b;
          return (
            <span
              key={`sub_${i}`}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                isRemoved
                  ? 'bg-rose-100 border border-rose-300 text-rose-600 line-through opacity-75'
                  : 'bg-blue-600 border border-blue-700'
              }`}
              aria-hidden="true"
            >
              {isRemoved ? '×' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}
