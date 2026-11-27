import {useState, type FormEvent} from 'react';
import {X} from 'lucide-react';
import {AVATAR_OPTIONS, KELAS_OPTIONS} from '../lib/ranks';
import type {AvatarId, KelasOption, PlayerProfile} from '../types';
import {AvatarImg} from './AvatarImg';

interface PlayerSetupModalProps {
  profile: PlayerProfile;
  onSave: (updates: {playerName: string; kelas: KelasOption; avatarId: AvatarId}) => void;
  onClose: () => void;
}

export function PlayerSetupModal({profile, onSave, onClose}: PlayerSetupModalProps) {
  const [name, setName] = useState(profile.playerName);
  const [kelas, setKelas] = useState<KelasOption>(profile.kelas);
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = name.trim().replace(/\s+/g, ' ');
    if (!cleaned) {
      setError('Tulis nama panggilanmu dulu ya.');
      return;
    }
    onSave({
      playerName: cleaned.slice(0, 24),
      kelas,
      avatarId,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-setup-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="player-setup-title" className="text-xl font-bold text-slate-900">
              Profil Pemain Kelas 1
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Nama dan avatarmu akan muncul di Papan Peringkat.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela profil"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label htmlFor="player-name-input" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Nama Panggilan
            </label>
            <input
              id="player-name-input"
              type="text"
              maxLength={24}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Bintang atau Salsa"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              autoFocus
            />
            {error && <p className="text-xs font-medium text-rose-600 mt-1.5">{error}</p>}
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-800 mb-2">Pilih Kelas</span>
            <div className="grid grid-cols-4 gap-2">
              {KELAS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setKelas(opt)}
                  className={`h-11 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    kelas === opt
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {opt === 'Umum' ? 'Umum' : `Kelas ${opt}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-800 mb-2">Pilih Avatar</span>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((av) => {
                const selected = avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarId(av.id)}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                      selected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <AvatarImg avatarId={av.id} sizeClass="w-12 h-12" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-full">
                      {av.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
