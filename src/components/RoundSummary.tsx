import {useState, type FormEvent} from 'react';
import {Award, CheckCircle2, RotateCcw, Star, Trophy} from 'lucide-react';
import {
  AVATAR_OPTIONS,
  KELAS_OPTIONS,
  getDifficultyMeta,
  getModeMeta,
  getRankForXp,
} from '../lib/ranks';
import {submitLeaderboardEntry} from '../lib/storage';
import type {AvatarId, KelasOption, PlayerProfile, RoundResult} from '../types';
import {AvatarImg} from './AvatarImg';

interface RoundSummaryProps {
  result: RoundResult;
  profile: PlayerProfile;
  onUpdateProfile: (updates: Partial<PlayerProfile>) => void;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onChooseAnother: () => void;
}

export function RoundSummary({
  result,
  profile,
  onUpdateProfile,
  onPlayAgain,
  onViewLeaderboard,
  onChooseAnother,
}: RoundSummaryProps) {
  const [name, setName] = useState(profile.playerName);
  const [kelas, setKelas] = useState<KelasOption>(profile.kelas);
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<{rank: number; total: number} | null>(null);
  const [error, setError] = useState('');

  const modeMeta = getModeMeta(result.mode);
  const levelMeta = getDifficultyMeta(result.level);
  const prevRank = getRankForXp(result.previousXp);
  const newRank = getRankForXp(result.newXp);
  const promoted = prevRank.id !== newRank.id;

  const progressPct = newRank.nextXp
    ? Math.min(
        100,
        Math.round(((result.newXp - newRank.minXp) / (newRank.nextXp - newRank.minXp)) * 100)
      )
    : 100;

  const handleSaveToLeaderboard = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = name.trim().replace(/\s+/g, ' ');
    if (!cleaned) {
      setError('Tulis nama panggilanmu dulu supaya masuk papan peringkat.');
      return;
    }

    setSubmitting(true);
    setError('');
    onUpdateProfile({
      playerName: cleaned.slice(0, 24),
      kelas,
      avatarId,
    });

    try {
      const response = await submitLeaderboardEntry({
        playerName: cleaned.slice(0, 24),
        kelas,
        avatarId,
        mode: result.mode,
        level: result.level,
        score: result.score,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        maxStreak: result.maxStreak,
        durationSeconds: result.durationSeconds,
        rankTitle: newRank.title,
      });
      setSubmittedRank({rank: response.rank, total: response.totalEntries});
    } catch {
      setError('Gagal menyimpan skor. Coba lagi sebentar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        {/* Stars & Headline */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3" aria-label={`Meraih ${result.starsEarned} dari 3 bintang`}>
            {[1, 2, 3].map((starNum) => {
              const earned = starNum <= result.starsEarned;
              return (
                <Star
                  key={starNum}
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${
                    earned ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'
                  }`}
                />
              );
            })}
          </div>

          <p className="text-xs font-medium text-slate-500">
            {modeMeta.title} <span aria-hidden="true">·</span> {levelMeta.label} ({levelMeta.rangeLabel})
          </p>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mt-1 text-balance">
            {result.starsEarned === 3
              ? 'Luar Biasa! Kamu Bintang Matematika!'
              : result.starsEarned === 2
                ? 'Bagus Sekali! Terus Berlatih!'
                : 'Semangat! Coba Lagi Pasti Bisa!'}
          </h1>
        </div>

        {/* 4-column Tabular Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">Skor Akhir</div>
            <div className="text-2xl font-mono font-bold text-blue-600 tabular-nums mt-1">
              {result.score.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">Jawaban Benar</div>
            <div className="text-2xl font-mono font-bold text-emerald-600 tabular-nums mt-1">
              {result.correctCount}/{result.totalQuestions}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">Kombo Terbaik</div>
            <div className="text-2xl font-mono font-bold text-amber-600 tabular-nums mt-1">
              {result.maxStreak}x
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-slate-500">Waktu Selesai</div>
            <div className="text-2xl font-mono font-bold text-slate-800 tabular-nums mt-1">
              {result.durationSeconds}d
            </div>
          </div>
        </div>

        {/* Rank Tier Progression */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Pangkat Saat Ini</div>
                <div className="font-display font-bold text-slate-900">
                  {newRank.title}
                  {promoted && (
                    <span className="ml-2 text-xs font-semibold text-emerald-700">
                      Naik Pangkat!
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Tambahan XP</div>
              <div className="font-mono font-bold text-sm text-blue-600 tabular-nums">
                +{result.xpEarned} XP (Total {result.newXp.toLocaleString('id-ID')})
              </div>
            </div>
          </div>

          <div className="mt-3 h-2.5 w-full bg-white border border-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{width: `${progressPct}%`}}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1.5 tabular-nums">
            <span>{newRank.minXp.toLocaleString('id-ID')} XP</span>
            <span>
              {newRank.nextXp
                ? `Target berikut: ${newRank.nextXp.toLocaleString('id-ID')} XP`
                : 'Pangkat Tertinggi Tercapai'}
            </span>
          </div>
        </div>

        {/* Save to Leaderboard Form */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          {submittedRank ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-display font-bold text-emerald-900">
                    Skor Tersimpan di Papan Peringkat!
                  </div>
                  <p className="text-sm text-emerald-800">
                    Peringkatmu saat ini: <strong className="tabular-nums">#{submittedRank.rank}</strong> dari{' '}
                    <span className="tabular-nums">{submittedRank.total}</span> catatan skor.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onViewLeaderboard}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold whitespace-nowrap shrink-0"
              >
                Buka Papan Peringkat
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveToLeaderboard} className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-900">
                  Catat Namamu di Papan Peringkat
                </h2>
                <p className="text-sm text-slate-600">
                  Simpan skor ini agar muncul di podium juara kelas!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div>
                  <label htmlFor="summary-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    id="summary-name"
                    type="text"
                    maxLength={24}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Tulis namamu di sini..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Kelas</span>
                  <div className="flex items-center gap-1.5">
                    {KELAS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setKelas(opt)}
                        className={`h-11 px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                          kelas === opt
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Avatar</span>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarId(av.id)}
                      className={`p-1.5 rounded-xl border-2 flex items-center gap-2 transition-colors ${
                        avatarId === av.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <AvatarImg avatarId={av.id} sizeClass="w-9 h-9" />
                      <span className="text-xs font-semibold text-slate-700 pr-1.5">
                        {av.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan Skor...' : 'Simpan ke Papan Peringkat'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Action Row */}
        <div className="mt-7 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onChooseAnother}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Pilih Mode Lain
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Lihat Peringkat
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Main Lagi</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
