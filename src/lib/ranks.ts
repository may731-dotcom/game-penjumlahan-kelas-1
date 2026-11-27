import type {AvatarId, DifficultyLevel, GameMode, KelasOption, RankTier} from '../types';

export const HERO_IMAGE_PATH = '/src/assets/images/hero_math_playground_1795768856844.jpg';

export interface AvatarOption {
  id: AvatarId;
  label: string;
  imagePath: string;
  bgClass: string;
  fallbackInitial: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'owl',
    label: 'Burung Hantu Pintar',
    imagePath: '/src/assets/images/avatar_owl_1795768857568.jpg',
    bgClass: 'bg-sky-100',
    fallbackInitial: 'BH',
  },
  {
    id: 'fox',
    label: 'Rubah Ceria',
    imagePath: '/src/assets/images/avatar_fox_1795768858048.jpg',
    bgClass: 'bg-emerald-100',
    fallbackInitial: 'RC',
  },
  {
    id: 'bunny',
    label: 'Kelinci Lincah',
    imagePath: '/src/assets/images/avatar_bunny_1795768858632.jpg',
    bgClass: 'bg-amber-100',
    fallbackInitial: 'KL',
  },
  {
    id: 'panda',
    label: 'Panda Bintang',
    imagePath: '/src/assets/images/avatar_panda_1795768858862.jpg',
    bgClass: 'bg-indigo-100',
    fallbackInitial: 'PB',
  },
];

export const KELAS_OPTIONS: KelasOption[] = ['1A', '1B', '1C', 'Umum'];

export interface ModeMeta {
  id: GameMode;
  title: string;
  shortTitle: string;
  subtitle: string;
  metaText: string;
  skillFocus: string;
}

export const GAME_MODES: ModeMeta[] = [
  {
    id: 'campuran',
    title: 'Tantangan Peringkat',
    shortTitle: 'Campuran',
    subtitle: 'Gabungan hitung benda, bandingkan, urutan, dan tambah kurang untuk skor tertinggi.',
    metaText: '10 Soal · Semua Keterampilan · Bonus Kombo',
    skillFocus: 'Skor Peringkat Utama',
  },
  {
    id: 'hitung',
    title: 'Hitung Benda',
    shortTitle: 'Hitung Benda',
    subtitle: 'Sentuh dan hitung buah, bintang, atau balok dengan cermat lalu pilih angkanya.',
    metaText: '10 Soal · Membilang Konkret',
    skillFocus: 'Pengenalan Lambang Bilangan',
  },
  {
    id: 'banding',
    title: 'Bandingkan Bilangan',
    shortTitle: 'Bandingkan',
    subtitle: 'Tentukan mana bilangan yang lebih besar, lebih kecil, atau sama banyak.',
    metaText: '10 Soal · Simbol >, =, <',
    skillFocus: 'Nilai & Perbandingan',
  },
  {
    id: 'urut',
    title: 'Lengkapi Urutan',
    shortTitle: 'Urutan',
    subtitle: 'Temukan bilangan yang hilang pada batu loncatan angka maju dan mundur.',
    metaText: '10 Soal · Pola Bilangan',
    skillFocus: 'Urutan & Lompat Bilangan',
  },
  {
    id: 'operasi',
    title: 'Tambah & Kurang',
    shortTitle: 'Tambah & Kurang',
    subtitle: 'Latih penjumlahan dan pengurangan dengan bantuan balok hitung dua warna.',
    metaText: '10 Soal · Operasi Hitung',
    skillFocus: 'Penjumlahan & Pengurangan',
  },
];

export interface DifficultyMeta {
  id: DifficultyLevel;
  label: string;
  rangeLabel: string;
  description: string;
}

export const DIFFICULTY_LEVELS: DifficultyMeta[] = [
  {
    id: 'dasar',
    label: 'Dasar',
    rangeLabel: 'Bilangan 1–10',
    description: 'Cocok untuk pengenalan awal kelas 1.',
  },
  {
    id: 'mahir',
    label: 'Mahir',
    rangeLabel: 'Bilangan 1–20',
    description: 'Standar inti matematika kelas 1 SD.',
  },
  {
    id: 'tantangan',
    label: 'Tantangan',
    rangeLabel: 'Bilangan 1–50',
    description: 'Pola lompat 2 dan hitung lebih cepat.',
  },
];

export const RANK_TIERS: RankTier[] = [
  {
    id: 'pemula',
    title: 'Pemula Ceria',
    minXp: 0,
    nextXp: 500,
    accentBg: 'bg-slate-100',
    accentText: 'text-slate-700',
    borderClass: 'border-slate-200',
    description: 'Baru memulai petualangan bilangan kelas 1.',
  },
  {
    id: 'penghitung',
    title: 'Penghitung Hebat',
    minXp: 500,
    nextXp: 1500,
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-700',
    borderClass: 'border-sky-200',
    description: 'Sudah terampil membilang dan membandingkan angka.',
  },
  {
    id: 'jagoan',
    title: 'Jagoan Bilangan',
    minXp: 1500,
    nextXp: 3500,
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    description: 'Cepat dan tepat menyelesaikan pola serta operasi.',
  },
  {
    id: 'master',
    title: 'Master Matematika',
    minXp: 3500,
    nextXp: 7000,
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-700',
    borderClass: 'border-blue-200',
    description: 'Panutan kelas dalam berhitung bilangan.',
  },
  {
    id: 'juara',
    title: 'Juara Bintang Emas',
    minXp: 7000,
    nextXp: null,
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
    borderClass: 'border-amber-200',
    description: 'Peringkat tertinggi di Ruang Bermain!',
  },
];

export function getRankForXp(xp: number): RankTier {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (xp >= tier.minXp) {
      current = tier;
    }
  }
  return current;
}

export function getAvatarOption(avatarId: string): AvatarOption {
  return AVATAR_OPTIONS.find((item) => item.id === avatarId) ?? AVATAR_OPTIONS[0];
}

export function getModeMeta(mode: string): ModeMeta {
  return GAME_MODES.find((item) => item.id === mode) ?? GAME_MODES[0];
}

export function getDifficultyMeta(level: string): DifficultyMeta {
  return DIFFICULTY_LEVELS.find((item) => item.id === level) ?? DIFFICULTY_LEVELS[0];
}
