/**
 * Audio Manager - Centralized audio control system
 * Manages volume levels, muting, and audio playback throughout the game
 */

export interface AudioSettings {
  masterVolume: number; // 0-100
  masterEnabled: boolean;
  sfxVolume: number; // 0-100
  sfxEnabled: boolean;
  musicVolume: number; // 0-100
  musicEnabled: boolean;
  voiceVolume: number; // 0-100
  voiceEnabled: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 70,
  masterEnabled: true,
  sfxVolume: 80,
  sfxEnabled: true,
  musicVolume: 60,
  musicEnabled: true,
  voiceVolume: 75,
  voiceEnabled: true,
};

class AudioManager {
  private audioContext: AudioContext | null = null;
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;
  
  // Audio node references
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;

  // Currently playing audio references
  private currentMusic: HTMLAudioElement | null = null;
  private activeSfx: Set<HTMLAudioElement> = new Set();
  private activeVoices: Set<HTMLAudioElement> = new Set();

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.voiceGain = this.audioContext.createGain();

      // Connect gain nodes
      this.masterGain.connect(this.audioContext.destination);
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.voiceGain.connect(this.masterGain);

      this.applyVolumeSettings();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Update audio settings and apply to all gain nodes
   */
  updateSettings(settings: AudioSettings) {
    this.settings = settings;
    this.applyVolumeSettings();
  }

  /**
   * Apply current volume settings to gain nodes
   */
  private applyVolumeSettings() {
    if (!this.audioContext) return;

    // Convert 0-100 range to 0-1 for Web Audio API
    const masterVol = this.settings.masterEnabled ? this.settings.masterVolume / 100 : 0;
    const sfxVol = this.settings.sfxEnabled ? this.settings.sfxVolume / 100 : 0;
    const musicVol = this.settings.musicEnabled ? this.settings.musicVolume / 100 : 0;
    const voiceVol = this.settings.voiceEnabled ? this.settings.voiceVolume / 100 : 0;

    if (this.masterGain) this.masterGain.gain.value = masterVol;
    if (this.sfxGain) this.sfxGain.gain.value = sfxVol;
    if (this.musicGain) this.musicGain.gain.value = musicVol;
    if (this.voiceGain) this.voiceGain.gain.value = voiceVol;

    // Also update HTML audio elements directly
    if (this.currentMusic) {
      this.currentMusic.volume = masterVol * musicVol;
    }
  }

  /**
   * Play background music (loops)
   */
  playMusic(src: string) {
    this.stopMusic();
    
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = (this.settings.masterEnabled ? this.settings.masterVolume / 100 : 0) * 
                   (this.settings.musicEnabled ? this.settings.musicVolume / 100 : 0);
    
    audio.play().catch(err => console.warn('Music playback failed:', err));
    this.currentMusic = audio;
  }

  /**
   * Stop currently playing music
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * Play sound effect (one-shot)
   */
  playSfx(src: string) {
    const audio = new Audio(src);
    audio.volume = (this.settings.masterEnabled ? this.settings.masterVolume / 100 : 0) * 
                   (this.settings.sfxEnabled ? this.settings.sfxVolume / 100 : 0);
    
    audio.play().catch(err => console.warn('SFX playback failed:', err));
    
    this.activeSfx.add(audio);
    audio.onended = () => {
      this.activeSfx.delete(audio);
    };
  }

  /**
   * Play voice line (one-shot)
   */
  playVoice(src: string) {
    const audio = new Audio(src);
    audio.volume = (this.settings.masterEnabled ? this.settings.masterVolume / 100 : 0) * 
                   (this.settings.voiceEnabled ? this.settings.voiceVolume / 100 : 0);
    
    audio.play().catch(err => console.warn('Voice playback failed:', err));
    
    this.activeVoices.add(audio);
    audio.onended = () => {
      this.activeVoices.delete(audio);
    };
  }

  /**
   * Stop all audio
   */
  stopAll() {
    this.stopMusic();
    this.activeSfx.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeVoices.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeSfx.clear();
    this.activeVoices.clear();
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();
