import type {LeaderboardEntry, PlayerProfile} from '../types';

const PROFILE_STORAGE_KEY = 'ruangbermain_player_profile_v1';
const LOCAL_LEADERBOARD_KEY = 'ruangbermain_local_leaderboard_v1';

export const DEFAULT_PROFILE: PlayerProfile = {
  playerName: '',
  kelas: '1A',
  avatarId: 'owl',
  totalXp: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  bestScore: 0,
  bestStreak: 0,
  soundEnabled: true,
  showVisualHelper: true,
};

export function loadPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

function loadLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchLeaderboard(
  mode = 'semua',
  kelas = 'semua'
): Promise<{entries: LeaderboardEntry[]; source: 'server' | 'local'}> {
  try {
    const params = new URLSearchParams();
    if (mode !== 'semua') params.set('mode', mode);
    if (kelas !== 'semua') params.set('kelas', kelas);
    const query = params.toString();
    const res = await fetch(`/api/leaderboard${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Server response not ok');
    const data = await res.json();
    const entries = Array.isArray(data.entries) ? data.entries : [];
    if (mode === 'semua' && kelas === 'semua') {
      saveLocalLeaderboard(entries);
    }
    return {entries, source: 'server'};
  } catch {
    let entries = loadLocalLeaderboard();
    if (mode !== 'semua') entries = entries.filter((e) => e.mode === mode);
    if (kelas !== 'semua') entries = entries.filter((e) => e.kelas === kelas);
    entries.sort((a, b) => b.score - a.score || b.correctCount - a.correctCount);
    return {entries, source: 'local'};
  }
}

export async function submitLeaderboardEntry(payload: {
  playerName: string;
  kelas: string;
  avatarId: string;
  mode: string;
  level: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxStreak: number;
  durationSeconds: number;
  rankTitle: string;
}): Promise<{entry: LeaderboardEntry; rank: number; totalEntries: number}> {
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit');
    const data = await res.json();
    const existing = loadLocalLeaderboard();
    saveLocalLeaderboard([data.entry, ...existing].slice(0, 100));
    return data;
  } catch {
    const fallbackEntry: LeaderboardEntry = {
      id: `local_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    const existing = [fallbackEntry, ...loadLocalLeaderboard()].sort((a, b) => b.score - a.score);
    saveLocalLeaderboard(existing);
    const rank = existing.findIndex((item) => item.id === fallbackEntry.id) + 1;
    return {entry: fallbackEntry, rank, totalEntries: existing.length};
  }
}

export async function deleteLeaderboardEntry(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/leaderboard/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) return false;
    const local = loadLocalLeaderboard().filter((item) => item.id !== id);
    saveLocalLeaderboard(local);
    return true;
  } catch {
    const local = loadLocalLeaderboard().filter((item) => item.id !== id);
    saveLocalLeaderboard(local);
    return true;
  }
}

export async function resetAllLeaderboard(): Promise<boolean> {
  try {
    const res = await fetch('/api/leaderboard/reset', {method: 'POST'});
    if (!res.ok) return false;
    saveLocalLeaderboard([]);
    return true;
  } catch {
    saveLocalLeaderboard([]);
    return true;
  }
}
