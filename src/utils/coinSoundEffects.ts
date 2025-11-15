// Coin Sound Effects Utility
// Provides audio feedback for coin collection animations

class CoinSoundEffects {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Initialize audio context on user interaction
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
      this.isEnabled = false;
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Create a coin collection sound effect
  public async playCoinCollectSound(coinCount: number = 1) {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      await this.resumeAudioContext();

      // Create a pleasant coin sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Coin sound parameters
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      // Multiple coins = multiple quick sounds
      if (coinCount > 1) {
        for (let i = 1; i < Math.min(coinCount, 5); i++) {
          setTimeout(() => {
            this.playSingleCoinSound(0.8 + (i * 0.1));
          }, i * 100);
        }
      }
    } catch (error) {
      console.warn('Error playing coin sound:', error);
    }
  }

  private async playSingleCoinSound(pitch: number = 1) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800 * pitch, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200 * pitch, this.audioContext.currentTime + 0.08);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Error playing single coin sound:', error);
    }
  }

  // Perfect score celebration sound
  public async playBonusSound() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      await this.resumeAudioContext();

      // Create celebratory arpeggio
      const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.playNoteSound(freq, 0.15);
        }, index * 150);
      });
    } catch (error) {
      console.warn('Error playing bonus sound:', error);
    }
  }

  private async playNoteSound(frequency: number, duration: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled && !!this.audioContext;
  }
}

// Create singleton instance
const coinSoundEffects = new CoinSoundEffects();

export default coinSoundEffects;