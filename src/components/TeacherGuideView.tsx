import {useEffect, useState} from 'react';
import {BookOpen, CheckCircle2, Trash2, Users} from 'lucide-react';
import {deleteLeaderboardEntry, fetchLeaderboard, resetAllLeaderboard} from '../lib/storage';
import type {LeaderboardEntry} from '../types';

export function TeacherGuideView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const reload = async () => {
    const res = await fetchLeaderboard('semua', 'semua');
    setEntries(res.entries);
  };

  useEffect(() => {
    reload();
  }, []);

  const handleDeleteEntry = async (id: string) => {
    const ok = await deleteLeaderboardEntry(id);
    if (ok) {
      setEntries((prev) => prev.filter((item) => item.id !== id));
      setStatusMessage('Satu catatan skor berhasil dihapus.');
    }
  };

  const handleResetAll = async () => {
    const ok = await resetAllLeaderboard();
    if (ok) {
      setEntries([]);
      setConfirmReset(false);
      setStatusMessage('Seluruh papan peringkat sesi ini telah dikosongkan.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      <div>
        <p className="text-xs font-medium text-slate-500">
          Kurikulum Merdeka Fase A <span aria-hidden="true">·</span> Kelas 1 SD
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mt-1 text-balance">
          Panduan Guru & Orang Tua
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Dirancang untuk melatih kepekaan bilangan (number sense) siswa kelas 1 SD secara visual dan menyenangkan tanpa tekanan waktu yang membuat panik.
        </p>
      </div>

      {/* Curriculum Mapping */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-blue-700 font-display font-bold text-lg">
            <BookOpen className="w-5 h-5" />
            <h2>Cakupan Materi Bilangan</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
            <li>
              <strong className="text-slate-900">Membilang Konkret:</strong> Siswa dapat menyentuh setiap gambar apel, bintang, bebek, atau balok untuk menandai hitungan satu per satu (1–25).
            </li>
            <li>
              <strong className="text-slate-900">Membandingkan Bilangan:</strong> Mengenalkan simbol lebih besar (&gt;), sama banyak (=), dan lebih kecil (&lt;) disertai titik puluhan-satuan.
            </li>
            <li>
              <strong className="text-slate-900">Urutan & Pola Angka:</strong> Melengkapi bilangan yang hilang secara maju, mundur, maupun loncat 2.
            </li>
            <li>
              <strong className="text-slate-900">Penjumlahan & Pengurangan:</strong> Operasi hitung hingga 40 dengan balok bantu dua warna yang dapat dinyalakan atau dimatikan.
            </li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700 font-display font-bold text-lg">
            <Users className="w-5 h-5" />
            <h2>Tips Bermain di Kelas</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
            <li>
              <strong className="text-slate-900">Tingkat Bertahap:</strong> Mulai dengan tingkat <em>Dasar (1–10)</em> di semester awal, lalu naik ke <em>Mahir (1–20)</em> dan <em>Tantangan (1–50)</em>.
            </li>
            <li>
              <strong className="text-slate-900">Turnamen Kelompok:</strong> Gunakan proyektor kelas dengan mode <em>Tantangan Peringkat</em>, pilih kelas (1A, 1B, 1C), dan bandingkan hasil di Papan Peringkat.
            </li>
            <li>
              <strong className="text-slate-900">Pintasan Keyboard:</strong> Di laptop kelas, siswa bisa langsung menekan tombol angka <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">1–4</code> untuk menjawab dan <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">Enter</code> untuk soal berikutnya.
            </li>
          </ul>
        </div>
      </section>

      {/* Classroom Leaderboard Management */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Kelola Papan Peringkat Sesi Kelas
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Saat ini terdapat <span className="font-mono font-bold tabular-nums">{entries.length}</span> catatan skor tersimpan.
            </p>
          </div>

          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Kosongkan Peringkat Sesi
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-rose-700">Yakin hapus semua?</span>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap"
                  >
                    Ya, Hapus Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            Belum ada catatan skor yang tersimpan di papan peringkat.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {entries.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-slate-900">{item.playerName}</span>{' '}
                  <span className="text-xs text-slate-500">
                    (Kelas {item.kelas} · {item.mode} ·{' '}
                    <span className="font-mono tabular-nums">{item.score} poin</span>)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(item.id)}
                  aria-label={`Hapus skor ${item.playerName}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
