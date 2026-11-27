import {useEffect, useState} from 'react';
import {Crown, Medal, Play, RefreshCw, Trophy} from 'lucide-react';
import {
  GAME_MODES,
  KELAS_OPTIONS,
  RANK_TIERS,
  getDifficultyMeta,
  getModeMeta,
} from '../lib/ranks';
import {fetchLeaderboard} from '../lib/storage';
import type {LeaderboardEntry, PlayerProfile} from '../types';
import {AvatarImg} from './AvatarImg';

interface LeaderboardViewProps {
  profile: PlayerProfile;
  onStartChallenge: () => void;
}

export function LeaderboardView({profile, onStartChallenge}: LeaderboardViewProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState<string>('semua');
  const [kelasFilter, setKelasFilter] = useState<string>('semua');

  const loadData = async (mode: string, kelas: string) => {
    setLoading(true);
    const res = await fetchLeaderboard(mode, kelas);
    setEntries(res.entries);
    setLoading(false);
  };

  useEffect(() => {
    loadData(modeFilter, kelasFilter);
  }, [modeFilter, kelasFilter]);

  const topThree = entries.slice(0, 3);
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Peringkat Kelas 1 SD <span aria-hidden="true">·</span> ruangbermain.site
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mt-1 text-balance">
            Papan Peringkat & Podium Juara
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Kumpulkan poin dari kecepatan, ketepatan, dan kombo beruntun untuk naik ke podium juara.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => loadData(modeFilter, kelasFilter)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <button
            type="button"
            onClick={onStartChallenge}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            <span>Kejar Peringkat</span>
          </button>
        </div>
      </div>

      {/* Podium Juara 1, 2, 3 */}
      {!loading && topThree.length > 0 && (
        <section aria-label="Podium Juara Teratas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Peringkat 2 */}
            <div className="order-2 md:order-1">
              {second ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-3">
                    <Medal className="w-4 h-4 text-slate-500" />
                    <span>Juara 2</span>
                  </div>
                  <div className="flex justify-center">
                    <AvatarImg avatarId={second.avatarId} sizeClass="w-16 h-16" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mt-3 truncate">
                    {second.playerName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelas {second.kelas} <span aria-hidden="true">·</span> {second.rankTitle}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 font-mono font-bold text-2xl text-slate-800 tabular-nums">
                    {second.score.toLocaleString('id-ID')}
                    <span className="text-xs font-sans font-medium text-slate-500 ml-1">poin</span>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex h-44 bg-slate-100/70 border border-dashed border-slate-300 rounded-2xl items-center justify-center text-sm text-slate-500">
                  Posisi Juara 2 Menunggu
                </div>
              )}
            </div>

            {/* Peringkat 1 (Elevated) */}
            <div className="order-1 md:order-2">
              {first && (
                <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 text-center shadow-sm">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-3">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span>Juara 1 · Peringkat Tertinggi</span>
                  </div>
                  <div className="flex justify-center">
                    <AvatarImg avatarId={first.avatarId} sizeClass="w-20 h-20" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 mt-3 truncate">
                    {first.playerName}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Kelas {first.kelas} <span aria-hidden="true">·</span> {first.rankTitle}
                  </p>
                  <div className="mt-4 pt-3 border-t border-amber-100 font-mono font-bold text-3xl text-blue-600 tabular-nums">
                    {first.score.toLocaleString('id-ID')}
                    <span className="text-xs font-sans font-medium text-slate-500 ml-1">poin</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 tabular-nums">
                    Benar {first.correctCount}/{first.totalQuestions} <span aria-hidden="true">·</span> Kombo {first.maxStreak}x
                  </p>
                </div>
              )}
            </div>

            {/* Peringkat 3 */}
            <div className="order-3">
              {third ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-3">
                    <Medal className="w-4 h-4 text-amber-700" />
                    <span>Juara 3</span>
                  </div>
                  <div className="flex justify-center">
                    <AvatarImg avatarId={third.avatarId} sizeClass="w-16 h-16" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mt-3 truncate">
                    {third.playerName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelas {third.kelas} <span aria-hidden="true">·</span> {third.rankTitle}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 font-mono font-bold text-2xl text-slate-800 tabular-nums">
                    {third.score.toLocaleString('id-ID')}
                    <span className="text-xs font-sans font-medium text-slate-500 ml-1">poin</span>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex h-40 bg-slate-100/70 border border-dashed border-slate-300 rounded-2xl items-center justify-center text-sm text-slate-500">
                  Posisi Juara 3 Menunggu
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar + Leaderboard Table */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Mode Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setModeFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                modeFilter === 'semua'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Mode
            </button>
            {GAME_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModeFilter(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  modeFilter === m.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.shortTitle}
              </button>
            ))}
          </div>

          {/* Kelas Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setKelasFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                kelasFilter === 'semua'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kelas
            </button>
            {KELAS_OPTIONS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKelasFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  kelasFilter === k
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {k === 'Umum' ? 'Umum' : `Kelas ${k}`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Memuat papan peringkat kelas...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-10 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-slate-900">
              Belum Ada Skor pada Filter Ini
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Mainkan 1 ronde (10 soal) lalu simpan namamu agar tampil di podium juara kelas!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onStartChallenge}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                Mulai Main Sekarang
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  <th className="py-3.5 px-4 w-16">No</th>
                  <th className="py-3.5 px-4">Pemain</th>
                  <th className="py-3.5 px-4">Mode & Tingkat</th>
                  <th className="py-3.5 px-4 text-right">Benar</th>
                  <th className="py-3.5 px-4 text-right">Kombo</th>
                  <th className="py-3.5 px-4 text-right">Waktu</th>
                  <th className="py-3.5 px-4 text-right">Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {entries.map((entry, index) => {
                  const rankNum = index + 1;
                  const isCurrentPlayer =
                    profile.playerName.trim() !== '' &&
                    entry.playerName.toLowerCase() === profile.playerName.trim().toLowerCase();
                  const modeMeta = getModeMeta(entry.mode);
                  const levelMeta = getDifficultyMeta(entry.level);

                  return (
                    <tr
                      key={entry.id}
                      className={isCurrentPlayer ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold tabular-nums text-slate-700">
                        #{rankNum}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <AvatarImg avatarId={entry.avatarId} sizeClass="w-9 h-9" />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {entry.playerName}
                            </div>
                            <div className="text-xs text-slate-500">
                              Kelas {entry.kelas} <span aria-hidden="true">·</span> {entry.rankTitle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium">{modeMeta.shortTitle}</div>
                        <div className="text-xs text-slate-500">{levelMeta.label}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {entry.correctCount}/{entry.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-700">
                        {entry.maxStreak}x
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">
                        {entry.durationSeconds}d
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-blue-700">
                        {entry.score.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Tangga Pangkat Ruang Bermain */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
            Tangga Pangkat Pemain
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Setiap ronde memberi tambahan XP untuk menaikkan pangkatmu dari Pemula Ceria hingga Juara Bintang Emas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RANK_TIERS.map((tier, idx) => {
            const unlocked = profile.totalXp >= tier.minXp;
            return (
              <div
                key={tier.id}
                className={`p-4 rounded-2xl border ${
                  unlocked ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/80 opacity-80'
                }`}
              >
                <div className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
                  Tingkat {idx + 1} · {tier.minXp.toLocaleString('id-ID')} XP
                </div>
                <div className="font-display font-bold text-base text-slate-900 mt-1">
                  {tier.title}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{tier.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
