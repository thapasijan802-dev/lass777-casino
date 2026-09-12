import { Howl, Howler } from 'howler';

/**
 * In-memory base64 WAV generator for self-contained, offline sound effects.
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

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = generateSample(t, i);
    s = Math.max(-1, Math.min(1, s));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

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

class OriginalsAudioManager {
  private sounds: Record<string, Howl> = {};
  private flightHumId: number | null = null;
  private isInitialized = false;
  private muted = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }

      // 1. Aviator Takeoff Whoosh
      const takeoffUri = createWavDataUri(22050, 0.4, (t) => {
        const freq = 120 + t * 450;
        const decay = Math.exp(-t * 3);
        const noise = (Math.random() * 2 - 1) * 0.15;
        return (Math.sin(2 * Math.PI * freq * t) + noise) * decay * 0.5;
      });

      // 2. Flight Engine Hum (Looping low turbine sound)
      const flightHumUri = createWavDataUri(22050, 0.5, (t) => {
        const f1 = Math.sin(2 * Math.PI * 130 * t);
        const f2 = Math.sin(2 * Math.PI * 260 * t) * 0.5;
        const noise = (Math.random() * 2 - 1) * 0.08;
        return (f1 + f2 + noise) * 0.3;
      });

      // 3. Crash Explosion (Punchy low sub thump + noisy sizzle)
      const crashUri = createWavDataUri(22050, 0.6, (t) => {
        const sub = Math.sin(2 * Math.PI * 65 * Math.exp(-t * 8) * t) * 0.6;
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 7) * 0.7;
        return (sub + noise) * Math.exp(-t * 4);
      });

      // 4. Cashout Victory Chime (Ascending triad chord)
      const cashoutUri = createWavDataUri(22050, 0.5, (t) => {
        const n1 = Math.sin(2 * Math.PI * 523.25 * t); // C5
        const n2 = Math.sin(2 * Math.PI * 659.25 * t); // E5
        const n3 = Math.sin(2 * Math.PI * 783.99 * t); // G5
        return ((n1 + n2 + n3) / 3) * Math.exp(-t * 5) * 0.6;
      });

      // 5. Mines Gem Chime (Crystal ping)
      const gemUri = createWavDataUri(22050, 0.25, (t) => {
        const freq = 1046.5; // C6
        return Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 12) * 0.5;
      });

      // 6. Mines Bomb Detonator (Click then explosion boom)
      const bombUri = createWavDataUri(22050, 0.7, (t) => {
        const boom = Math.sin(2 * Math.PI * 80 * Math.exp(-t * 10) * t) * 0.7;
        const sizzle = (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.6;
        return (boom + sizzle) * Math.exp(-t * 4);
      });

      this.sounds.takeoff = new Howl({ src: [takeoffUri], volume: 0.5 });
      this.sounds.flight_hum = new Howl({ src: [flightHumUri], loop: true, volume: 0.3 });
      this.sounds.crash = new Howl({ src: [crashUri], volume: 0.7 });
      this.sounds.cashout = new Howl({ src: [cashoutUri], volume: 0.65 });
      this.sounds.gem = new Howl({ src: [gemUri], volume: 0.6 });
      this.sounds.bomb = new Howl({ src: [bombUri], volume: 0.75 });

      this.isInitialized = true;
    } catch (err) {
      console.warn('OriginalsAudio init warning:', err);
    }
  }

  public playTakeoff() {
    this.init();
    if (this.muted) return;
    this.sounds.takeoff?.play();
  }

  public playFlightHum() {
    this.init();
    if (this.muted) return;
    if (this.sounds.flight_hum && !this.flightHumId) {
      this.flightHumId = this.sounds.flight_hum.play();
    }
  }

  public stopFlightHum() {
    if (this.sounds.flight_hum && this.flightHumId !== null) {
      this.sounds.flight_hum.stop(this.flightHumId);
      this.flightHumId = null;
    }
  }

  public playCrash() {
    this.init();
    this.stopFlightHum();
    if (this.muted) return;
    this.sounds.crash?.play();
  }

  public playCashout() {
    this.init();
    if (this.muted) return;
    this.sounds.cashout?.play();
  }

  public playGem(step = 0) {
    this.init();
    if (this.muted) return;
    if (this.sounds.gem) {
      const id = this.sounds.gem.play();
      // Ascending pitch per revealed gem step
      const rate = Math.min(2.0, 1.0 + step * 0.05);
      this.sounds.gem.rate(rate, id);
    }
  }

  public playBomb() {
    this.init();
    if (this.muted) return;
    this.sounds.bomb?.play();
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    Howler.mute(muted);
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

export const originalsAudio = new OriginalsAudioManager();
