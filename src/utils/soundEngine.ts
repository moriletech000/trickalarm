type SoundType = 'beep' | 'buzz' | 'bell';

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  start(soundType: SoundType = 'beep') {
    if (this.isPlaying) {
      this.stop();
    }

    this.initAudioContext();
    this.isPlaying = true;

    if (soundType === 'beep') {
      this.playBeep();
    } else if (soundType === 'buzz') {
      this.playBuzz();
    } else if (soundType === 'bell') {
      this.playBell();
    }
  }

  private playBeep() {
    const playTone = () => {
      if (!this.isPlaying || !this.audioContext) return;

      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);

      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.oscillator.start();
      this.oscillator.stop(this.audioContext.currentTime + 0.5);

      this.oscillator.onended = () => {
        if (this.oscillator) {
          this.oscillator.disconnect();
        }
        if (this.gainNode) {
          this.gainNode.disconnect();
        }
      };
    };

    playTone();
    this.intervalId = window.setInterval(playTone, 1000);
  }

  private playBuzz() {
    if (!this.audioContext) return;

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime);

    this.gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.oscillator.start();
  }

  private playBell() {
    const playTone = () => {
      if (!this.isPlaying || !this.audioContext) return;

      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.oscillator.type = 'triangle';
      this.oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime);

      const now = this.audioContext.currentTime;
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      this.gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.oscillator.start();
      this.oscillator.stop(this.audioContext.currentTime + 0.8);

      this.oscillator.onended = () => {
        if (this.oscillator) {
          this.oscillator.disconnect();
        }
        if (this.gainNode) {
          this.gainNode.disconnect();
        }
      };
    };

    playTone();
    this.intervalId = window.setInterval(playTone, 1500);
  }

  stop() {
    this.isPlaying = false;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
      }
      this.oscillator = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }
}

export const soundEngine = new SoundEngine();