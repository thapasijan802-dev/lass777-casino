import { Howl, Howler } from 'howler';

/**
 * Generates an in-memory base64 WAV data URI so that sound effects
 * are 100% reliable offline and require zero external asset downloads.
 */
function createWavDataUri(
  sampleRate: number,
  durationSec: number,
  generateSample: (t: number, i: number) => number,
): string {
  const numSamples = Math.floor(sampleRate * durationSec);
  const blockAlign = 2; // 16-bit mono
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = generateSample(t, i);
    s = Math.max(-1, Math.min(1, s)); // clamp
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  // Convert buffer to binary string then base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

class SlotAudioManager {
  private sounds: Record<string, Howl> = {};
  private spinLoopId: number | null = null;
  private isInitialized = false;
  private muted = false;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Resume Howler AudioContext for browser autoplay policies
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }

      // 1. Spin Start Sound (Rev up + mechanical lever pull)
      const spinStartUri = createWavDataUri(22050, 0.25, (t) => {
        const freq = 180 + t * 400;
        const decay = Math.exp(-t * 6);
        return Math.sin(2 * Math.PI * freq * t) * decay * 0.4;
      });

      // 2. Spin Loop (Rhythmic mechanical whoosh/flutter)
      const spinLoopUri = createWavDataUri(22050, 0.35, (t) => {
        const flutter = Math.sin(2 * Math.PI * 25 * t);
        const noise = (Math.random() * 2 - 1) * 0.15;
        const tone = Math.sin(2 * Math.PI * 220 * t) * 0.25;
        return (tone + noise) * (0.6 + 0.4 * flutter) * 0.3;
      });

      // 3. Reel Stop Clack (Sharp percussive mechanical lock)
      const reelStopUri = createWavDataUri(22050, 0.12, (t) => {
        const freq = 340 * Math.exp(-t * 30);
        const click = (Math.random() * 2 - 1) * Math.exp(-t * 50) * 0.6;
        const woodThump = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 20) * 0.5;
        return (click + woodThump) * 0.6;
      });

      // 4. Win Chime / Bell (Bright triad casino bell chime)
      const winBellUri = createWavDataUri(22050, 0.7, (t) => {
        const note1 = Math.sin(2 * Math.PI * 659.25 * t); // E5
        const note2 = Math.sin(2 * Math.PI * 830.61 * t); // G#5
        const note3 = Math.sin(2 * Math.PI * 987.77 * t); // B5
        const decay = Math.exp(-t * 4);
        return ((note1 + note2 + note3) / 3) * decay * 0.5;
      });

      // 5. Coin Tally (Fast high frequency metallic ping)
      const coinTallyUri = createWavDataUri(22050, 0.08, (t) => {
        const freq = 1480;
        const decay = Math.exp(-t * 40);
        return Math.sin(2 * Math.PI * freq * t) * decay * 0.4;
      });

      this.sounds.spin_start = new Howl({ src: [spinStartUri], volume: 0.5 });
      this.sounds.spin_loop = new Howl({ src: [spinLoopUri], loop: true, volume: 0.35 });
      this.sounds.reel_stop = new Howl({ src: [reelStopUri], volume: 0.7 });
      this.sounds.win_bell = new Howl({ src: [winBellUri], volume: 0.65 });
      this.sounds.coin_tally = new Howl({ src: [coinTallyUri], volume: 0.45 });

      this.isInitialized = true;
    } catch (err) {
      console.warn('SlotAudioManager initialization warning:', err);
    }
  }

  public playSpinStart() {
    this.init();
    if (this.muted) return;
    this.sounds.spin_start?.play();
  }

  public playSpinLoop() {
    this.init();
    if (this.muted) return;
    if (this.sounds.spin_loop && !this.spinLoopId) {
      this.spinLoopId = this.sounds.spin_loop.play();
    }
  }

  public stopSpinLoop() {
    if (this.sounds.spin_loop && this.spinLoopId !== null) {
      this.sounds.spin_loop.stop(this.spinLoopId);
      this.spinLoopId = null;
    }
  }

  public playReelStop(reelIndex = 0) {
    this.init();
    if (this.muted) return;
    // Pitch shift slightly per reel index for ascending tension (1.0 to 1.2x)
    if (this.sounds.reel_stop) {
      const id = this.sounds.reel_stop.play();
      const rate = 0.95 + reelIndex * 0.06;
      this.sounds.reel_stop.rate(rate, id);
    }
  }

  public playWinBell() {
    this.init();
    if (this.muted) return;
    this.sounds.win_bell?.play();
  }

  public playCoinTally() {
    this.init();
    if (this.muted) return;
    this.sounds.coin_tally?.play();
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    Howler.mute(muted);
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

export const slotAudio = new SlotAudioManager();
