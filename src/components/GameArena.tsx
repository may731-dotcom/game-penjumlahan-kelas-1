import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  LogOut,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import {generateRoundQuestions} from '../lib/mathGenerator';
import {getDifficultyMeta, getModeMeta} from '../lib/ranks';
import {playCorrectSound, playFanfareSound, playWrongSound} from '../lib/sound';
import type {CompareOperator, DifficultyLevel, GameMode, MathQuestion} from '../types';
import {CountingObjects, VisualDotGrid, VisualOperationBlocks} from './CountingObjects';

interface GameArenaProps {
  mode: GameMode;
  level: DifficultyLevel;
  soundEnabled: boolean;
  showVisualHelper: boolean;
  onToggleSound: () => void;
  onToggleVisualHelper: () => void;
  onExit: () => void;
  onComplete: (result: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    maxStreak: number;
    durationSeconds: number;
  }) => void;
}

const TOTAL_QUESTIONS = 10;

export function GameArena({
  mode,
  level,
  soundEnabled,
  showVisualHelper,
  onToggleSound,
  onToggleVisualHelper,
  onExit,
  onComplete,
}: GameArenaProps) {
  const questions = useMemo<MathQuestion[]>(
    () => generateRoundQuestions(mode, level, TOTAL_QUESTIONS),
    [mode, level]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const questionStartRef = useRef<number>(Date.now());
  const roundStartRef = useRef<number>(Date.now());

  const currentQuestion = questions[currentIdx];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQuestion.answer;

  const modeMeta = getModeMeta(mode);
  const levelMeta = getDifficultyMeta(level);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - roundStartRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSelectAnswer = useCallback(
    (choice: string | number) => {
      if (isAnswered) return;
      setSelectedAnswer(choice);

      const secondsTaken = (Date.now() - questionStartRef.current) / 1000;
      const correct = choice === currentQuestion.answer;

      if (correct) {
        const nextStreak = streak + 1;
        const speedBonus = secondsTaken <= 4 ? 30 : secondsTaken <= 8 ? 15 : 0;
        const streakBonus = nextStreak > 1 ? Math.min(nextStreak - 1, 5) * 20 : 0;
        const earned = 100 + speedBonus + streakBonus;

        setScore((prev) => prev + earned);
        setCorrectCount((prev) => prev + 1);
        setStreak(nextStreak);
        setMaxStreak((prev) => Math.max(prev, nextStreak));
        setLastPoints(earned);
        playCorrectSound(soundEnabled, nextStreak);
      } else {
        setStreak(0);
        setLastPoints(0);
        playWrongSound(soundEnabled);
      }
    },
    [currentQuestion.answer, isAnswered, soundEnabled, streak]
  );

  const handleNext = useCallback(() => {
    if (!isAnswered) return;
    if (currentIdx + 1 >= questions.length) {
      const totalDuration = Math.max(1, Math.round((Date.now() - roundStartRef.current) / 1000));
      playFanfareSound(soundEnabled);
      onComplete({
        score,
        correctCount,
        totalQuestions: questions.length,
        maxStreak,
        durationSeconds: totalDuration,
      });
      return;
    }

    setCurrentIdx((prev) => prev + 1);
    setSelectedAnswer(null);
    setLastPoints(0);
    questionStartRef.current = Date.now();
  }, [
    correctCount,
    currentIdx,
    isAnswered,
    maxStreak,
    onComplete,
    questions.length,
    score,
    soundEnabled,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isAnswered) {
        e.preventDefault();
        handleNext();
        return;
      }

      if (!isAnswered) {
        if (currentQuestion.kind === 'banding') {
          const ops: CompareOperator[] = ['>', '=', '<'];
          if (e.key === '1' || e.key === '>') handleSelectAnswer(ops[0]);
          if (e.key === '2' || e.key === '=') handleSelectAnswer(ops[1]);
          if (e.key === '3' || e.key === '<') handleSelectAnswer(ops[2]);
        } else {
          const numKey = Number(e.key);
          if (numKey >= 1 && numKey <= 4 && currentQuestion.choices[numKey - 1] !== undefined) {
            handleSelectAnswer(currentQuestion.choices[numKey - 1]);
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentQuestion, handleNext, handleSelectAnswer, isAnswered]);

  const progressPct = ((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Unobtrusive Top HUD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-slate-500">
              {modeMeta.title} <span aria-hidden="true">·</span> {levelMeta.label} ({levelMeta.rangeLabel})
            </div>
            <div className="text-base sm:text-lg font-display font-bold text-slate-900 tabular-nums mt-0.5">
              Soal {currentIdx + 1} dari {questions.length}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="text-right">
              <div className="text-xs text-slate-500">Skor</div>
              <div className="text-lg font-mono font-bold text-blue-600 tabular-nums">
                {score.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Kombo</div>
              <div className="text-lg font-mono font-bold text-amber-600 tabular-nums flex items-center justify-end gap-1">
                <Flame className="w-4 h-4" aria-hidden="true" />
                <span>{streak}x</span>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500">Waktu</div>
              <div className="text-lg font-mono font-bold text-slate-700 tabular-nums">
                {elapsedSeconds}d
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={onToggleVisualHelper}
                title={showVisualHelper ? 'Sembunyikan alat bantu gambar' : 'Tampilkan alat bantu gambar'}
                className={`h-10 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors whitespace-nowrap ${
                  showVisualHelper
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {showVisualHelper ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden md:inline">Bantuan Gambar</span>
              </button>

              <button
                type="button"
                onClick={onToggleSound}
                aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onExit}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-200"
            style={{width: `${progressPct}%`}}
          />
        </div>
      </div>

      {/* Main Question Stage */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 text-center text-balance">
          {currentQuestion.prompt}
        </h2>

        <div className="mt-6">
          {/* 1. Hitung Benda */}
          {currentQuestion.kind === 'hitung' && (
            <CountingObjects
              questionId={currentQuestion.id}
              objectType={currentQuestion.objectType}
              count={currentQuestion.count}
              soundEnabled={soundEnabled}
            />
          )}

          {/* 2. Bandingkan Bilangan */}
          {currentQuestion.kind === 'banding' && (
            <div className="max-w-xl mx-auto">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <div className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 tabular-nums">
                    {currentQuestion.left}
                  </div>
                  {showVisualHelper && (
                    <VisualDotGrid value={currentQuestion.left} colorClass="bg-blue-600" />
                  )}
                </div>

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-3xl font-display font-bold text-slate-700">
                  {isAnswered ? selectedAnswer : '?'}
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <div className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 tabular-nums">
                    {currentQuestion.right}
                  </div>
                  {showVisualHelper && (
                    <VisualDotGrid value={currentQuestion.right} colorClass="bg-emerald-600" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Lengkapi Urutan */}
          {currentQuestion.kind === 'urut' && (
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-5 gap-2 sm:gap-3.5 py-2">
                {currentQuestion.sequence.map((num, idx) => {
                  const isMissing = num === null;
                  const displayNum =
                    isMissing && isAnswered ? currentQuestion.answer : num;
                  return (
                    <div
                      key={idx}
                      className={`h-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors ${
                        isMissing
                          ? isAnswered
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-dashed border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-900'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl font-display font-extrabold tabular-nums">
                        {displayNum === null ? '?' : displayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
              {showVisualHelper && (
                <p className="text-center text-xs text-slate-500 mt-3">
                  Petunjuk: Perhatikan selisih angka dari kotak ke kotak secara berurutan.
                </p>
              )}
            </div>
          )}

          {/* 4. Tambah & Kurang */}
          {currentQuestion.kind === 'operasi' && (
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-3 sm:gap-5 py-4 px-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-lg mx-auto">
                <span className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 tabular-nums">
                  {currentQuestion.a}
                </span>
                <span className="text-3xl sm:text-4xl font-display font-bold text-blue-600">
                  {currentQuestion.operator}
                </span>
                <span className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 tabular-nums">
                  {currentQuestion.b}
                </span>
                <span className="text-3xl sm:text-4xl font-display font-bold text-slate-400">
                  =
                </span>
                <span className="min-w-[64px] h-14 px-3 rounded-xl border-2 border-dashed border-blue-500 bg-white flex items-center justify-center text-3xl sm:text-4xl font-display font-extrabold text-blue-700 tabular-nums">
                  {isAnswered ? currentQuestion.answer : '?'}
                </span>
              </div>

              {showVisualHelper && (
                <VisualOperationBlocks
                  a={currentQuestion.a}
                  b={currentQuestion.b}
                  operator={currentQuestion.operator}
                />
              )}
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="mt-8">
          {currentQuestion.kind === 'banding' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
              {(
                [
                  {op: '>' as CompareOperator, label: 'Lebih Besar'},
                  {op: '=' as CompareOperator, label: 'Sama Banyak'},
                  {op: '<' as CompareOperator, label: 'Lebih Kecil'},
                ] as const
              ).map(({op, label}) => {
                const isSelected = selectedAnswer === op;
                const isRightOption = currentQuestion.answer === op;
                let btnStyle =
                  'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-900';

                if (isAnswered) {
                  if (isRightOption) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-800';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
                  }
                }

                return (
                  <button
                    key={op}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectAnswer(op)}
                    className={`min-h-[72px] px-4 py-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-98 ${btnStyle}`}
                  >
                    <span className="text-3xl font-display font-extrabold leading-none">{op}</span>
                    <span className="text-xs font-semibold mt-1.5">{label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {currentQuestion.choices.map((choice, idx) => {
                const isSelected = selectedAnswer === choice;
                const isRightOption = currentQuestion.answer === choice;
                let btnStyle =
                  'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-900';

                if (isAnswered) {
                  if (isRightOption) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-800';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
                  }
                }

                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectAnswer(choice)}
                    className={`relative min-h-[72px] rounded-2xl border-2 text-3xl font-display font-extrabold tabular-nums transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-98 ${btnStyle}`}
                  >
                    <span className="absolute top-2 left-3 text-[11px] font-mono font-medium opacity-45">
                      {idx + 1}
                    </span>
                    {choice}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Immediate Feedback Banner */}
        {isAnswered && (
          <div
            className={`mt-6 p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-display font-bold text-base sm:text-lg">
                  {isCorrect
                    ? `Hebat, Benar! +${lastPoints} Poin`
                    : `Hampir Tepat — Jawaban yang benar adalah ${currentQuestion.answer}`}
                </div>
                <p className="text-sm opacity-90 mt-0.5">{currentQuestion.explanation}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{currentIdx + 1 >= questions.length ? 'Lihat Hasil & Peringkat' : 'Soal Berikutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
