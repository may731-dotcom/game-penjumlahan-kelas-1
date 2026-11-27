import {useEffect, useState} from 'react';
import {
  ArrowRight,
  Award,
  Calculator,
  ChevronRight,
  Crown,
  Layers,
  ListOrdered,
  Play,
  Scale,
  Sparkles,
  Trophy,
  UserCheck,
} from 'lucide-react';
import {AvatarImg} from './components/AvatarImg';
import {GameArena} from './components/GameArena';
import {LeaderboardView} from './components/LeaderboardView';
import {PlayerSetupModal} from './components/PlayerSetupModal';
import {RoundSummary} from './components/RoundSummary';
import {TeacherGuideView} from './components/TeacherGuideView';
import {
  DIFFICULTY_LEVELS,
  GAME_MODES,
  HERO_IMAGE_PATH,
  getDifficultyMeta,
  getModeMeta,
  getRankForXp,
} from './lib/ranks';
import {playTapSound} from './lib/sound';
import {fetchLeaderboard, loadPlayerProfile, savePlayerProfile} from './lib/storage';
import type {
  AppView,
  DifficultyLevel,
  GameMode,
  LeaderboardEntry,
  PlayerProfile,
  RoundResult,
} from './types';

function ModeIcon({mode}: {mode: GameMode}) {
  switch (mode) {
    case 'campuran':
      return <Trophy className="w-5 h-5 text-amber-600" />;
    case 'hitung':
      return <Layers className="w-5 h-5 text-blue-600" />;
    case 'banding':
      return <Scale className="w-5 h-5 text-emerald-600" />;
    case 'urut':
      return <ListOrdered className="w-5 h-5 text-indigo-600" />;
    case 'operasi':
      return <Calculator className="w-5 h-5 text-rose-600" />;
  }
}

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [selectedMode, setSelectedMode] = useState<GameMode>('campuran');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('dasar');
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([]);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    savePlayerProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (view === 'home' || view === 'games') {
      fetchLeaderboard('semua', 'semua').then((res) => {
        setTopEntries(res.entries.slice(0, 5));
      });
    }
  }, [view]);

  const updateProfile = (updates: Partial<PlayerProfile>) => {
    setProfile((prev) => ({...prev, ...updates}));
  };

  const startGame = (mode: GameMode, level: DifficultyLevel = selectedLevel) => {
    playTapSound(profile.soundEnabled);
    setSelectedMode(mode);
    setSelectedLevel(level);
    setRoundResult(null);
    setGameKey((k) => k + 1);
    setView('playing');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleRoundComplete = (rawResult: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    maxStreak: number;
    durationSeconds: number;
  }) => {
    const starsEarned: 1 | 2 | 3 =
      rawResult.correctCount >= 8 ? 3 : rawResult.correctCount >= 5 ? 2 : 1;
    const xpEarned = Math.max(50, Math.round(rawResult.score * 0.25) + rawResult.correctCount * 10);
    const previousXp = profile.totalXp;
    const newXp = previousXp + xpEarned;

    updateProfile({
      totalXp: newXp,
      gamesPlayed: profile.gamesPlayed + 1,
      totalCorrect: profile.totalCorrect + rawResult.correctCount,
      bestScore: Math.max(profile.bestScore, rawResult.score),
      bestStreak: Math.max(profile.bestStreak, rawResult.maxStreak),
    });

    setRoundResult({
      mode: selectedMode,
      level: selectedLevel,
      ...rawResult,
      starsEarned,
      xpEarned,
      previousXp,
      newXp,
    });
    setView('summary');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const navigateTo = (target: AppView) => {
    playTapSound(profile.soundEnabled);
    setView(target);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const currentRank = getRankForXp(profile.totalXp);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar: Strict 1-row, 3-zone contract */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark only */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-lg font-display font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
          >
            ruangbermain.site
          </button>

          {/* Zone 2: 4 single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Navigasi utama">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                view === 'home'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => navigateTo('games')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                view === 'games'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Permainan
            </button>
            <button
              type="button"
              onClick={() => navigateTo('leaderboard')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                view === 'leaderboard'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Peringkat
            </button>
            <button
              type="button"
              onClick={() => navigateTo('guide')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                view === 'guide'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Panduan Guru
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() =>
                view === 'playing' ? navigateTo('home') : startGame('campuran', selectedLevel)
              }
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              {view === 'playing' ? 'Kembali Beranda' : 'Mulai Bermain'}
            </button>
          </div>
        </div>

        {/* Mobile compact nav row (only below md) */}
        <nav className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto text-xs font-medium text-slate-600">
          {(
            [
              {id: 'home' as AppView, label: 'Beranda'},
              {id: 'games' as AppView, label: 'Permainan'},
              {id: 'leaderboard' as AppView, label: 'Peringkat'},
              {id: 'guide' as AppView, label: 'Panduan Guru'},
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
                view === item.id ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {/* HOME & GAMES LANDING */}
        {(view === 'home' || view === 'games') && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
            {/* Hero Split (shown on Beranda) */}
            {view === 'home' && (
              <section className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left Column */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm font-medium text-slate-500">
                        Matematika Bilangan <span aria-hidden="true">·</span> Kelas 1 SD{' '}
                        <span aria-hidden="true">·</span> Kurikulum Merdeka
                      </p>
                      <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.12] text-balance">
                        Belajar Bilangan Jadi Seru dan Penuh Bintang
                      </h1>
                      <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                        Latih membilang benda, membandingkan angka, melengkapi urutan, serta penjumlahan dan pengurangan sambil mengejar podium peringkat kelas.
                      </p>
                    </div>

                    {/* Player Identity Strip */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <AvatarImg avatarId={profile.avatarId} sizeClass="w-12 h-12" />
                        <div className="min-w-0">
                          <div className="font-display font-bold text-slate-900 truncate">
                            {profile.playerName ? profile.playerName : 'Pemain Baru Kelas 1'}
                          </div>
                          <div className="text-xs text-slate-500 truncate tabular-nums">
                            Kelas {profile.kelas} <span aria-hidden="true">·</span>{' '}
                            {currentRank.title} <span aria-hidden="true">·</span>{' '}
                            {profile.totalXp.toLocaleString('id-ID')} XP
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProfileModal(true)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{profile.playerName ? 'Ubah Profil' : 'Isi Nama'}</span>
                      </button>
                    </div>

                    {/* Primary & Secondary CTAs */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startGame('campuran', selectedLevel)}
                        className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <Play className="w-4 h-4" />
                        <span>Mulai Tantangan Peringkat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('leaderboard')}
                        className="px-5 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <Trophy className="w-4 h-4 text-amber-600" />
                        <span>Lihat Papan Peringkat</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Generated Illustration */}
                  <div className="lg:col-span-6">
                    {!heroImgFailed ? (
                      <img
                        src={HERO_IMAGE_PATH}
                        alt="Ilustrasi meja belajar berisi balok angka 1 sampai 10, sempoa kayu warna-warni, dan bentuk geometri untuk belajar matematika kelas 1 SD"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgFailed(true)}
                        className="w-full h-64 sm:h-80 lg:h-full object-cover rounded-2xl border border-slate-200"
                      />
                    ) : (
                      <div className="w-full h-64 sm:h-80 lg:h-full rounded-2xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
                        <Sparkles className="w-10 h-10 text-blue-600 mb-2" />
                        <div className="font-display font-bold text-slate-800">
                          Arena Bilangan Kelas 1 SD
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4-Column Summary Strip below Hero Split */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">Mode Belajar</div>
                    <div className="text-xl font-display font-bold text-slate-900 mt-0.5 tabular-nums">
                      5 Permainan
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">Rentang Bilangan</div>
                    <div className="text-xl font-display font-bold text-slate-900 mt-0.5 tabular-nums">
                      1 sampai 50
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">Skor Terbaikmu</div>
                    <div className="text-xl font-display font-bold text-blue-600 mt-0.5 tabular-nums">
                      {profile.bestScore.toLocaleString('id-ID')} Poin
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="text-xs text-slate-500">Pangkatmu</div>
                    <div className="text-xl font-display font-bold text-emerald-700 mt-0.5 truncate">
                      {currentRank.title}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Mode & Difficulty Selection Section */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 text-balance">
                    Pilih Permainan Bilangan
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Tentukan tingkat bilangan terlebih dahulu, lalu pilih permainan yang ingin dimainkan.
                  </p>
                </div>

                {/* Interactive Difficulty Segmented Control */}
                <div
                  className="inline-flex items-center gap-1 p-1 bg-slate-200/75 rounded-xl self-start md:self-auto"
                  role="group"
                  aria-label="Pilih tingkat kesulitan"
                >
                  {DIFFICULTY_LEVELS.map((lvl) => {
                    const active = selectedLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          playTapSound(profile.soundEnabled);
                          setSelectedLevel(lvl.id);
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lvl.label} ({lvl.rangeLabel.replace('Bilangan ', '')})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {GAME_MODES.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-5 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {m.metaText}
                        </span>
                        <ModeIcon mode={m.id} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-slate-900">
                        {m.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{m.subtitle}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-500 truncate">
                        {getDifficultyMeta(selectedLevel).rangeLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => startGame(m.id, selectedLevel)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Mainkan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Leaderboard Preview */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-slate-900">
                      Peringkat Teratas Kelas
                    </h2>
                    <p className="text-xs text-slate-500">
                      5 skor terbaik yang tercatat di ruangbermain.site
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo('leaderboard')}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap"
                >
                  <span>Lihat Semua Peringkat</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {topEntries.length === 0 ? (
                <div className="py-6 px-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-sm text-slate-700">
                      Belum ada skor yang dicatat hari ini. Jadilah juara pertama di papan peringkat!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startGame('campuran', selectedLevel)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
                  >
                    Cetak Skor Pertama
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {topEntries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="py-3 flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 font-mono font-bold text-slate-500 tabular-nums">
                          #{idx + 1}
                        </span>
                        <AvatarImg avatarId={entry.avatarId} sizeClass="w-9 h-9" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {entry.playerName}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            Kelas {entry.kelas} <span aria-hidden="true">·</span>{' '}
                            {getModeMeta(entry.mode).shortTitle} <span aria-hidden="true">·</span>{' '}
                            {entry.rankTitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-blue-700 tabular-nums">
                          {entry.score.toLocaleString('id-ID')} poin
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          Benar {entry.correctCount}/{entry.totalQuestions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ACTIVE GAME ARENA */}
        {view === 'playing' && (
          <GameArena
            key={gameKey}
            mode={selectedMode}
            level={selectedLevel}
            soundEnabled={profile.soundEnabled}
            showVisualHelper={profile.showVisualHelper}
            onToggleSound={() => updateProfile({soundEnabled: !profile.soundEnabled})}
            onToggleVisualHelper={() =>
              updateProfile({showVisualHelper: !profile.showVisualHelper})
            }
            onExit={() => navigateTo('home')}
            onComplete={handleRoundComplete}
          />
        )}

        {/* ROUND SUMMARY */}
        {view === 'summary' && roundResult && (
          <RoundSummary
            result={roundResult}
            profile={profile}
            onUpdateProfile={updateProfile}
            onPlayAgain={() => startGame(selectedMode, selectedLevel)}
            onViewLeaderboard={() => navigateTo('leaderboard')}
            onChooseAnother={() => navigateTo('games')}
          />
        )}

        {/* FULL LEADERBOARD */}
        {view === 'leaderboard' && (
          <LeaderboardView
            profile={profile}
            onStartChallenge={() => startGame('campuran', selectedLevel)}
          />
        )}

        {/* TEACHER GUIDE */}
        {view === 'guide' && <TeacherGuideView />}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            ruangbermain.site — Game Matematika Bilangan Kelas 1 SD
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigateTo('games')}
              className="hover:text-slate-900 transition-colors"
            >
              Pilih Permainan
            </button>
            <button
              type="button"
              onClick={() => navigateTo('leaderboard')}
              className="hover:text-slate-900 transition-colors"
            >
              Papan Peringkat
            </button>
            <button
              type="button"
              onClick={() => navigateTo('guide')}
              className="hover:text-slate-900 transition-colors"
            >
              Panduan Guru
            </button>
          </div>
        </div>
      </footer>

      {showProfileModal && (
        <PlayerSetupModal
          profile={profile}
          onSave={(updates) => updateProfile(updates)}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
