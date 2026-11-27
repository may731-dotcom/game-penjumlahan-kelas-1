import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {createServer as createViteServer} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

interface LeaderboardEntry {
  id: string;
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
  createdAt: string;
}

const VALID_AVATARS = new Set(['owl', 'fox', 'bunny', 'panda']);
const VALID_MODES = new Set(['campuran', 'hitung', 'banding', 'urut', 'operasi']);
const VALID_LEVELS = new Set(['dasar', 'mahir', 'tantangan']);
const VALID_KELAS = new Set(['1A', '1B', '1C', 'Umum']);

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.writeFileSync(LEADERBOARD_FILE, '[]', 'utf-8');
  }
}

function readLeaderboard(): LeaderboardEntry[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

function writeLeaderboard(entries: LeaderboardEntry[]): void {
  ensureDataFile();
  const tempFile = `${LEADERBOARD_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(entries, null, 2), 'utf-8');
  fs.renameSync(tempFile, LEADERBOARD_FILE);
}

function computeRankTitle(score: number): string {
  if (score >= 1300) return 'Juara Bintang Emas';
  if (score >= 1050) return 'Master Matematika';
  if (score >= 800) return 'Jagoan Bilangan';
  if (score >= 500) return 'Penghitung Hebat';
  return 'Pemula Ceria';
}

async function startServer() {
  const app = express();
  app.use(express.json({limit: '32kb'}));

  app.get('/api/health', (_req, res) => {
    res.json({status: 'ok'});
  });

  app.get('/api/leaderboard', (req, res) => {
    const modeFilter = typeof req.query.mode === 'string' ? req.query.mode : 'semua';
    const kelasFilter = typeof req.query.kelas === 'string' ? req.query.kelas : 'semua';

    let entries = readLeaderboard();
    if (modeFilter !== 'semua' && VALID_MODES.has(modeFilter)) {
      entries = entries.filter((item) => item.mode === modeFilter);
    }
    if (kelasFilter !== 'semua' && VALID_KELAS.has(kelasFilter)) {
      entries = entries.filter((item) => item.kelas === kelasFilter);
    }

    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      if (a.durationSeconds !== b.durationSeconds) return a.durationSeconds - b.durationSeconds;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({entries: entries.slice(0, 100)});
  });

  app.post('/api/leaderboard', (req, res) => {
    const body = req.body ?? {};
    const rawName = typeof body.playerName === 'string' ? body.playerName.trim() : '';
    const playerName = rawName.replace(/\s+/g, ' ').slice(0, 24);
    if (!playerName) {
      res.status(400).json({error: 'Nama pemain wajib diisi.'});
      return;
    }

    const kelas = typeof body.kelas === 'string' && VALID_KELAS.has(body.kelas) ? body.kelas : '1A';
    const avatarId =
      typeof body.avatarId === 'string' && VALID_AVATARS.has(body.avatarId) ? body.avatarId : 'owl';
    const mode = typeof body.mode === 'string' && VALID_MODES.has(body.mode) ? body.mode : 'campuran';
    const level =
      typeof body.level === 'string' && VALID_LEVELS.has(body.level) ? body.level : 'dasar';

    const totalQuestions = Math.max(1, Math.min(20, Math.round(Number(body.totalQuestions) || 10)));
    const correctCount = Math.max(0, Math.min(totalQuestions, Math.round(Number(body.correctCount) || 0)));
    const maxStreak = Math.max(0, Math.min(totalQuestions, Math.round(Number(body.maxStreak) || 0)));
    const score = Math.max(0, Math.min(5000, Math.round(Number(body.score) || 0)));
    const durationSeconds = Math.max(1, Math.min(3600, Math.round(Number(body.durationSeconds) || 30)));
    const rankTitle =
      typeof body.rankTitle === 'string' && body.rankTitle.trim().length > 0
        ? body.rankTitle.trim().slice(0, 32)
        : computeRankTitle(score);

    const newEntry: LeaderboardEntry = {
      id: `rb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      playerName,
      kelas,
      avatarId,
      mode,
      level,
      score,
      correctCount,
      totalQuestions,
      maxStreak,
      durationSeconds,
      rankTitle,
      createdAt: new Date().toISOString(),
    };

    const existing = readLeaderboard();
    const updated = [newEntry, ...existing].slice(0, 200);
    writeLeaderboard(updated);

    const sorted = [...updated].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.durationSeconds - b.durationSeconds;
    });
    const rank = sorted.findIndex((item) => item.id === newEntry.id) + 1;

    res.status(201).json({
      entry: newEntry,
      rank,
      totalEntries: sorted.length,
    });
  });

  app.delete('/api/leaderboard/:id', (req, res) => {
    const id = req.params.id;
    const existing = readLeaderboard();
    const filtered = existing.filter((item) => item.id !== id);
    if (filtered.length === existing.length) {
      res.status(404).json({error: 'Data peringkat tidak ditemukan.'});
      return;
    }
    writeLeaderboard(filtered);
    res.json({deleted: true});
  });

  app.post('/api/leaderboard/reset', (_req, res) => {
    writeLeaderboard([]);
    res.json({reset: true});
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ruang Bermain server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
