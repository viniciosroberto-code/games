class EngineAudio {
  constructor() {
    this.audioCtx = null;
    this.mainGain = null;
    this.osc1 = null; 
    this.osc2 = null; 
    this.subOsc = null; 
    
    this.bgMusic = null;
    this.isRunning = false;

    this.lastSpeed = 0;
    this.turboCooldown = false;
  }

  init() {
    if (this.audioCtx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.mainGain = this.audioCtx.createGain();
    this.mainGain.gain.value = 0.15;
    this.mainGain.connect(this.audioCtx.destination);

    this.osc1 = this.audioCtx.createOscillator();
    this.osc1.type = 'sawtooth';

    this.osc2 = this.audioCtx.createOscillator();
    this.osc2.type = 'square';
    const gainOsc2 = this.audioCtx.createGain();
    gainOsc2.gain.value = 0.3;

    this.subOsc = this.audioCtx.createOscillator();
    this.subOsc.type = 'triangle';
    const gainSub = this.audioCtx.createGain();
    gainSub.gain.value = 0.6;

    this.osc1.connect(this.mainGain);
    
    this.osc2.connect(gainOsc2);
    gainOsc2.connect(this.mainGain);

    this.subOsc.connect(gainSub);
    gainSub.connect(this.mainGain);

    this.osc1.start();
    this.osc2.start();
    this.subOsc.start();

    this.isRunning = true;
    this.playMusic();
  }

  playMusic() {
    this.bgMusic = new Audio('musica.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.2;
    this.bgMusic.play().catch(() => {});
  }

  playTurboBlowOff() {
    if (!this.audioCtx || this.turboCooldown) return;

    this.turboCooldown = true;
    setTimeout(() => { this.turboCooldown = false; }, 800);

    const bufferSize = this.audioCtx.sampleRate * 0.25;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 3;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start();
  }

  update(speed, maxSpeed, currentGear) {
    if (!this.isRunning) return;

    if (this.lastSpeed > 2000 && speed < this.lastSpeed - 20) {
      this.playTurboBlowOff();
    }
    this.lastSpeed = speed;

    const gearRatios = [
      { min: 0.00, max: 0.18 },
      { min: 0.18, max: 0.38 },
      { min: 0.38, max: 0.58 },
      { min: 0.58, max: 0.78 },
      { min: 0.78, max: 0.92 },
      { min: 0.92, max: 1.00 }
    ];

    const ratio = speed / maxSpeed;
    const gearIndex = Math.min(Math.max(currentGear - 1, 0), 5);
    const currentGearRange = gearRatios[gearIndex];

    let gearProgress = (ratio - currentGearRange.min) / (currentGearRange.max - currentGearRange.min);
    gearProgress = Math.min(Math.max(gearProgress, 0), 1);

    const baseFreq = 45 + (gearIndex * 12);
    const maxFreq = 180 + (gearIndex * 18);
    const targetFreq = baseFreq + (gearProgress * (maxFreq - baseFreq));

    const now = this.audioCtx.currentTime;

    this.osc1.frequency.setTargetAtTime(targetFreq, now, 0.04);
    this.osc2.frequency.setTargetAtTime(targetFreq * 1.5, now, 0.04);
    this.subOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.04);
  }
}