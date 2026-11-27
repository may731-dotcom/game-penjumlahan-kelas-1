export type GameMode = 'campuran' | 'hitung' | 'banding' | 'urut' | 'operasi';

export type DifficultyLevel = 'dasar' | 'mahir' | 'tantangan';

export type AvatarId = 'owl' | 'fox' | 'bunny' | 'panda';

export type KelasOption = '1A' | '1B' | '1C' | 'Umum';

export type AppView = 'home' | 'games' | 'playing' | 'summary' | 'leaderboard' | 'guide';

export type CountObjectType = 'apel' | 'bintang' | 'bebek' | 'balok' | 'pensil';

export interface HitungQuestion {
  id: string;
  kind: 'hitung';
  prompt: string;
  objectType: CountObjectType;
  count: number;
  choices: number[];
  answer: number;
  explanation: string;
}

export type CompareOperator = '>' | '=' | '<';

export interface BandingQuestion {
  id: string;
  kind: 'banding';
  prompt: string;
  left: number;
  right: number;
  answer: CompareOperator;
  explanation: string;
}

export interface UrutQuestion {
  id: string;
  kind: 'urut';
  prompt: string;
  sequence: (number | null)[];
  missingIndex: number;
  step: number;
  choices: number[];
  answer: number;
  explanation: string;
}

export interface OperasiQuestion {
  id: string;
  kind: 'operasi';
  prompt: string;
  a: number;
  b: number;
  operator: '+' | '-';
  choices: number[];
  answer: number;
  explanation: string;
}

export type MathQuestion = HitungQuestion | BandingQuestion | UrutQuestion | OperasiQuestion;

export interface RankTier {
  id: string;
  title: string;
  minXp: number;
  nextXp: number | null;
  accentBg: string;
  accentText: string;
  borderClass: string;
  description: string;
}

export interface PlayerProfile {
  playerName: string;
  kelas: KelasOption;
  avatarId: AvatarId;
  totalXp: number;
  gamesPlayed: number;
  totalCorrect: number;
  bestScore: number;
  bestStreak: number;
  soundEnabled: boolean;
  showVisualHelper: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  kelas: string;
  avatarId: AvatarId | string;
  mode: GameMode | string;
  level: DifficultyLevel | string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxStreak: number;
  durationSeconds: number;
  rankTitle: string;
  createdAt: string;
}

export interface RoundResult {
  mode: GameMode;
  level: DifficultyLevel;
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxStreak: number;
  durationSeconds: number;
  starsEarned: 1 | 2 | 3;
  xpEarned: number;
  previousXp: number;
  newXp: number;
}
