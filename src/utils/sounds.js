// Ses efektleri için web Audio API kullanımı

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.musicGain = null;
    this.sfxGain = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.currentMusic = null;
  }

  init() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Gain nodes for volume control
      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 0.3; // Müzik daha sessiz
      this.musicGain.connect(this.audioContext.destination);
      
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = 0.5; // Efektler orta seviye
      this.sfxGain.connect(this.audioContext.destination);
    }
  }

  // Basit ses efekti oluşturma
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Puan kazanma sesi (yükselen ton)
  playScore() {
    if (!this.enabled) return;
    this.playTone(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.3), 50); // E5
  }

  // Can kaybı sesi (düşük, dramatik)
  playDamage() {
    if (!this.enabled) return;
    this.playTone(220, 0.1, 'sawtooth', 0.4); // A3
    setTimeout(() => this.playTone(196, 0.2, 'sawtooth', 0.4), 60); // G3
    setTimeout(() => this.playTone(174.61, 0.3, 'square', 0.3), 120); // F3
  }

  // Oyun başlangıç sesi
  playStart() {
    if (!this.enabled) return;
    this.playTone(392, 0.1, 'sine', 0.3); // G4
    setTimeout(() => this.playTone(523.25, 0.1, 'sine', 0.3), 100); // C5
    setTimeout(() => this.playTone(659.25, 0.2, 'sine', 0.3), 200); // E5
  }

  // Oyun bitiş sesi
  playGameOver() {
    if (!this.enabled) return;
    this.playTone(329.63, 0.2, 'sine', 0.4); // E4
    setTimeout(() => this.playTone(293.66, 0.2, 'sine', 0.4), 200); // D4
    setTimeout(() => this.playTone(261.63, 0.3, 'sine', 0.4), 400); // C4
    setTimeout(() => this.playTone(220, 0.5, 'sine', 0.4), 600); // A3
  }

  // Arka plan müziği (basit loop)
  playBackgroundMusic() {
    if (!this.musicEnabled || !this.audioContext) return;

    const melody = [
      { freq: 523.25, duration: 0.3 }, // C5
      { freq: 587.33, duration: 0.3 }, // D5
      { freq: 659.25, duration: 0.3 }, // E5
      { freq: 587.33, duration: 0.3 }, // D5
      { freq: 523.25, duration: 0.3 }, // C5
      { freq: 440, duration: 0.3 },    // A4
      { freq: 493.88, duration: 0.3 }, // B4
      { freq: 523.25, duration: 0.6 }, // C5
    ];

    let currentNote = 0;
    const playNote = () => {
      if (!this.musicEnabled) return;
      
      const note = melody[currentNote];
      this.playMusicNote(note.freq, note.duration);
      
      currentNote = (currentNote + 1) % melody.length;
      this.currentMusic = setTimeout(playNote, note.duration * 1000);
    };

    playNote();
  }

  playMusicNote(frequency, duration) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.musicGain);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  stopBackgroundMusic() {
    if (this.currentMusic) {
      clearTimeout(this.currentMusic);
      this.currentMusic = null;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }
}

// Singleton instance
const soundManager = new SoundManager();

// Web ortamında otomatik başlat
if (typeof window !== 'undefined') {
  // İlk kullanıcı etkileşiminde başlat (tarayıcı politikası)
  const initOnInteraction = () => {
    soundManager.init();
    soundManager.playBackgroundMusic();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
  };
  
  document.addEventListener('click', initOnInteraction);
  document.addEventListener('touchstart', initOnInteraction);
}

export default soundManager;
