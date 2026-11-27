let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  delay = 0,
  volume = 0.08,
  type: OscillatorType = 'sine'
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playTapSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(440, 0.06, 0, 0.04, 'triangle');
}

export function playCountTickSound(enabled: boolean, index: number): void {
  if (!enabled) return;
  const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0];
  const note = scale[index % scale.length];
  playTone(note, 0.09, 0, 0.05, 'sine');
}

export function playCorrectSound(enabled: boolean, streak: number): void {
  if (!enabled) return;
  const boost = Math.min(streak, 6) * 20;
  playTone(523.25 + boost, 0.14, 0, 0.07, 'sine');
  playTone(659.25 + boost, 0.18, 0.07, 0.08, 'sine');
}

export function playWrongSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(311.13, 0.14, 0, 0.05, 'triangle');
  playTone(261.63, 0.2, 0.1, 0.05, 'triangle');
}

export function playFanfareSound(enabled: boolean): void {
  if (!enabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    playTone(freq, 0.24, i * 0.09, 0.075, 'sine');
  });
}
