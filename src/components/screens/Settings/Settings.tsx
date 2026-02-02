import React from 'react';
import { useGameStore } from '../../../game/store';
import { LANGUAGES, Language } from '../../../i18n';
import { useTranslation } from '../../../hooks/useTranslation';
import './Settings.css';

interface VolumeControlProps {
  label: string;
  description: string;
  volume: number;
  enabled: boolean;
  onVolumeChange: (volume: number) => void;
  onToggle: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  label,
  description,
  volume,
  enabled,
  onVolumeChange,
  onToggle,
}) => {
  return (
    <div className="volume-control">
      <div className="volume-header">
        <label className="volume-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className="volume-checkbox"
          />
          <span className="volume-title">{label}</span>
        </label>
        <span className="volume-value">{enabled ? volume : 0}%</span>
      </div>
      <p className="volume-description">{description}</p>
      <div className="volume-slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          disabled={!enabled}
          className={`volume-slider ${!enabled ? 'disabled' : ''}`}
        />
        <div className="volume-markers">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export const SettingsScreen: React.FC = () => {
  const state = useGameStore((store) => store.state);
  const setLanguage = useGameStore((store) => store.setLanguage);
  const toggleSettings = useGameStore((store) => store.toggleSettings);
  const setMasterVolume = useGameStore((store) => store.setMasterVolume);
  const toggleMasterVolume = useGameStore((store) => store.toggleMasterVolume);
  const setSfxVolume = useGameStore((store) => store.setSfxVolume);
  const toggleSfxVolume = useGameStore((store) => store.toggleSfxVolume);
  const setMusicVolume = useGameStore((store) => store.setMusicVolume);
  const toggleMusicVolume = useGameStore((store) => store.toggleMusicVolume);
  const setVoiceVolume = useGameStore((store) => store.setVoiceVolume);
  const toggleVoiceVolume = useGameStore((store) => store.toggleVoiceVolume);
  const setThemeBrightness = useGameStore((store) => store.setThemeBrightness);
  const setThemeSaturation = useGameStore((store) => store.setThemeSaturation);
  const setThemeContrast = useGameStore((store) => store.setThemeContrast);
  const resetTheme = useGameStore((store) => store.resetTheme);
  const t = useTranslation();

  if (!state.showSettings) {
    return null;
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleClose = () => {
    toggleSettings();
  };

  return (
    <div className="settings-overlay" onClick={handleClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>{t.settings.title}</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="settings-section">
          <label htmlFor="language-select">{t.settings.language}</label>
          <select
            id="language-select"
            className="language-selector"
            value={state.currentLanguage}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        <div className="settings-divider"></div>

        <div className="settings-section theme-section">
          <h3 className="section-title">Display & Theme</h3>
          <p className="section-description">Customize display settings to prevent browser extensions from affecting your game visuals.</p>
          
          <div className="theme-control">
            <div className="theme-control-header">
              <label htmlFor="brightness-slider">Brightness</label>
              <span className="theme-value">{Math.round(state.themeSettings.brightness * 100)}%</span>
            </div>
            <input
              id="brightness-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              value={state.themeSettings.brightness}
              onChange={(e) => setThemeBrightness(Number(e.target.value))}
              className="theme-slider"
            />
            <div className="theme-markers">
              <span>Dark</span>
              <span>Normal</span>
              <span>Bright</span>
            </div>
          </div>

          <div className="theme-control">
            <div className="theme-control-header">
              <label htmlFor="saturation-slider">Saturation</label>
              <span className="theme-value">{Math.round(state.themeSettings.saturation * 100)}%</span>
            </div>
            <input
              id="saturation-slider"
              type="range"
              min="0.5"
              max="1.5"
              step="0.01"
              value={state.themeSettings.saturation}
              onChange={(e) => setThemeSaturation(Number(e.target.value))}
              className="theme-slider"
            />
            <div className="theme-markers">
              <span>Muted</span>
              <span>Normal</span>
              <span>Vivid</span>
            </div>
          </div>

          <div className="theme-control">
            <div className="theme-control-header">
              <label htmlFor="contrast-slider">Contrast</label>
              <span className="theme-value">{Math.round(state.themeSettings.contrast * 100)}%</span>
            </div>
            <input
              id="contrast-slider"
              type="range"
              min="0.5"
              max="1.5"
              step="0.01"
              value={state.themeSettings.contrast}
              onChange={(e) => setThemeContrast(Number(e.target.value))}
              className="theme-slider"
            />
            <div className="theme-markers">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          <button className="reset-theme-btn" onClick={resetTheme}>
            🔄 Reset to Default
          </button>
        </div>

        <div className="settings-divider"></div>

        <div className="settings-section audio-section">
          <h3 className="section-title">{t.settings.audio}</h3>
          
          <VolumeControl
            label={t.settings.masterVolume}
            description={t.settings.masterVolumeDesc}
            volume={state.audioSettings.masterVolume}
            enabled={state.audioSettings.masterEnabled}
            onVolumeChange={setMasterVolume}
            onToggle={toggleMasterVolume}
          />

          <VolumeControl
            label={t.settings.musicVolume}
            description={t.settings.musicVolumeDesc}
            volume={state.audioSettings.musicVolume}
            enabled={state.audioSettings.musicEnabled}
            onVolumeChange={setMusicVolume}
            onToggle={toggleMusicVolume}
          />

          <VolumeControl
            label={t.settings.sfxVolume}
            description={t.settings.sfxVolumeDesc}
            volume={state.audioSettings.sfxVolume}
            enabled={state.audioSettings.sfxEnabled}
            onVolumeChange={setSfxVolume}
            onToggle={toggleSfxVolume}
          />

          <VolumeControl
            label={t.settings.voiceVolume}
            description={t.settings.voiceVolumeDesc}
            volume={state.audioSettings.voiceVolume}
            enabled={state.audioSettings.voiceEnabled}
            onVolumeChange={setVoiceVolume}
            onToggle={toggleVoiceVolume}
          />
        </div>

        <div className="settings-info">
          <p>
            🌍 Language support is currently in development. Most translations are placeholders marked with [LANG] prefixes.
            Full translations will be added progressively for all game content including characters, enemies, items, abilities, and UI text.
          </p>
        </div>

        <div className="settings-footer">
          <button className="save-btn" onClick={handleClose}>
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
