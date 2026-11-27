import {useState} from 'react';
import {getAvatarOption} from '../lib/ranks';

interface AvatarImgProps {
  avatarId: string;
  sizeClass?: string;
  className?: string;
}

export function AvatarImg({avatarId, sizeClass = 'w-12 h-12', className = ''}: AvatarImgProps) {
  const [failed, setFailed] = useState(false);
  const avatar = getAvatarOption(avatarId);

  if (failed) {
    return (
      <div
        className={`${sizeClass} ${avatar.bgClass} rounded-xl flex items-center justify-center font-display font-bold text-slate-800 border border-slate-200 shrink-0 ${className}`}
        aria-label={avatar.label}
      >
        {avatar.fallbackInitial}
      </div>
    );
  }

  return (
    <img
      src={avatar.imagePath}
      alt={avatar.label}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} rounded-xl object-cover border border-slate-200 shrink-0 ${className}`}
    />
  );
}
