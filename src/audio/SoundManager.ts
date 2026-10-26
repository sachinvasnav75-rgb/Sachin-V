/**
 * Procedural Web Audio API Sound Engine
 * No external audio files needed; 100% synthetic realistic motorcycle sounds,
 * Indian pressure horns, nitro swooshes, tire skids, and wind effects.
 */

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  
  // Tire skid noise
  private skidNode: AudioBufferSourceNode | null = null;
  private skidGain: GainNode | null = null;

  // Wind noise
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;

  // Nitro swoosh
  private nitroGain: GainNode | null = null;
  
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private isEngineRunning: boolean = false;
  private engineType: 'inline4' | 'single_thump' | 'supercharged' | 'twin' | 'twostroke' = 'inline4';

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupWindSynth();
      this.setupSkidSynth();
      this.setupNitroSynth();
    } catch {
      // Audio not supported or blocked
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  public startEngine(type: 'inline4' | 'single_thump' | 'supercharged' | 'twin' | 'twostroke' = 'inline4') {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.stopEngine();

    this.engineType = type;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime( type === 'single_thump' ? 450 : 1200, this.ctx.currentTime);

    // Primary pulse oscillator
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = type === 'single_thump' ? 'square' : 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(35, this.ctx.currentTime);

    // Secondary harmonic oscillator
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = type === 'supercharged' ? 'triangle' : 'triangle';
    this.engineOsc2.frequency.setValueAtTime(70, this.ctx.currentTime);

    const osc1Gain = this.ctx.createGain();
    osc1Gain.gain.value = type === 'single_thump' ? 0.7 : 0.5;

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = type === 'supercharged' ? 0.6 : 0.4;

    this.engineOsc1.connect(osc1Gain);
    this.engineOsc2.connect(osc2Gain);

    osc1Gain.connect(this.engineFilter);
    osc2Gain.connect(this.engineFilter);

    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.isEngineRunning = true;
  }

  public updateEngine(rpmNormalized: number, isAccelerating: boolean, isBraking: boolean) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) return;

    const t = this.ctx.currentTime;
    const clampedRpm = Math.max(0.1, Math.min(1.0, rpmNormalized));

    let baseFreq = 40;
    let maxFreq = 280;

    if (this.engineType === 'single_thump') {
      // Classic Indian Bullet thump: slower chug-chug frequency
      baseFreq = 22;
      maxFreq = 120;
    } else if (this.engineType === 'supercharged') {
      baseFreq = 55;
      maxFreq = 420;
    } else if (this.engineType === 'twostroke') {
      baseFreq = 65;
      maxFreq = 300;
    }

    const targetFreq = baseFreq + clampedRpm * (maxFreq - baseFreq);
    this.engineOsc1.frequency.setTargetAtTime(targetFreq, t, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * (this.engineType === 'supercharged' ? 3.0 : 2.0), t, 0.08);

    // Filter opening when throttle is applied
    const filterBase = this.engineType === 'single_thump' ? 350 : 800;
    const targetFilter = filterBase + clampedRpm * (this.engineType === 'supercharged' ? 3500 : 2400) + (isAccelerating ? 600 : 0);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, t, 0.08);

    // Throttle volume bump
    const targetVol = (isAccelerating ? 0.35 : 0.18) + clampedRpm * 0.15;
    this.engineGain.gain.setTargetAtTime(targetVol, t, 0.05);

    // Skid noise when heavy braking at speed
    if (this.skidGain && clampedRpm > 0.3 && isBraking) {
      this.skidGain.gain.setTargetAtTime(0.28, t, 0.05);
    } else if (this.skidGain) {
      this.skidGain.gain.setTargetAtTime(0, t, 0.1);
    }

    // Wind noise at high speed
    if (this.windGain && this.windFilter) {
      const windAmt = Math.max(0, (clampedRpm - 0.4) * 1.6);
      this.windGain.gain.setTargetAtTime(windAmt * 0.25, t, 0.1);
      this.windFilter.frequency.setTargetAtTime(300 + windAmt * 1500, t, 0.1);
    }
  }

  public stopEngine() {
    if (this.engineOsc1) {
      try { this.engineOsc1.stop(); } catch {}
      this.engineOsc1.disconnect();
      this.engineOsc1 = null;
    }
    if (this.engineOsc2) {
      try { this.engineOsc2.stop(); } catch {}
      this.engineOsc2.disconnect();
      this.engineOsc2 = null;
    }
    this.isEngineRunning = false;
  }

  private setupSkidSynth() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.skidNode = this.ctx.createBufferSource();
    this.skidNode.buffer = buffer;
    this.skidNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 2.5;

    this.skidGain = this.ctx.createGain();
    this.skidGain.gain.value = 0;

    this.skidNode.connect(filter);
    filter.connect(this.skidGain);
    this.skidGain.connect(this.masterGain);
    this.skidNode.start();
  }

  private setupWindSynth() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const windNode = this.ctx.createBufferSource();
    windNode.buffer = buffer;
    windNode.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 400;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0;

    windNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    windNode.start();
  }

  private setupNitroSynth() {
    if (!this.ctx || !this.masterGain) return;
    this.nitroGain = this.ctx.createGain();
    this.nitroGain.gain.value = 0;
    this.nitroGain.connect(this.masterGain);
  }

  public playHorn(type: 'indian_pom' | 'melody' = 'indian_pom') {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0.4, t);
    hornGain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
    hornGain.connect(this.masterGain);

    if (type === 'indian_pom') {
      // Dual-tone classic Indian pressure horn (440Hz + 554Hz - A4 & C#5)
      const oscA = this.ctx.createOscillator();
      const oscB = this.ctx.createOscillator();
      oscA.type = 'sawtooth';
      oscB.type = 'sawtooth';
      oscA.frequency.setValueAtTime(435, t);
      oscB.frequency.setValueAtTime(548, t);

      oscA.connect(hornGain);
      oscB.connect(hornGain);

      oscA.start(t);
      oscB.start(t);
      oscA.stop(t + 0.45);
      oscB.stop(t + 0.45);
    } else {
      // Melodic multi-tone horn fanfare
      [523, 659, 784].forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteOsc = this.ctx.createOscillator();
        noteOsc.type = 'sawtooth';
        noteOsc.frequency.setValueAtTime(freq, t + idx * 0.1);
        noteOsc.connect(hornGain);
        noteOsc.start(t + idx * 0.1);
        noteOsc.stop(t + idx * 0.1 + 0.18);
      });
    }
  }

  public playNitro(active: boolean) {
    if (!this.ctx || !this.nitroGain) return;
    const t = this.ctx.currentTime;
    if (active) {
      this.nitroGain.gain.setTargetAtTime(0.35, t, 0.05);
    } else {
      this.nitroGain.gain.setTargetAtTime(0, t, 0.1);
    }
  }

  public playStuntSuccess() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    gain.connect(this.masterGain);

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      osc.connect(gain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.15);
    });
  }

  public playCrash() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  public playCheatBeep() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public dispose() {
    this.stopEngine();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundEngine = new SoundManager();
