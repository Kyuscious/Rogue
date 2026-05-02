import React, { useState, useEffect } from 'react';
import {
  loadProfiles,
  getActiveProfileId,
  setActiveProfileId,
  renameProfile,
  resetProfile,
  formatPlayTime,
  hasRunInProgress,
  unlockAllContent,
  PlayerProfile,
} from '../MainMenu/Profiles/profileSystem';
import { useTranslation } from '../../../hooks/useTranslation';
import './Profiles.css';

interface ProfilesProps {
  onBack: () => void;
}

export const Profiles: React.FC<ProfilesProps> = ({ onBack }) => {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<number>(1);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<number | null>(null);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState<number | null>(null);
  const t = useTranslation();

  // Load profiles on mount
  useEffect(() => {
    refreshProfiles();
  }, []);

  const refreshProfiles = () => {
    setProfiles(loadProfiles());
    setActiveProfileIdState(getActiveProfileId());
  };

  const handleUseProfile = (profileId: number) => {
    setActiveProfileId(profileId);
    setActiveProfileIdState(profileId);
    refreshProfiles();
  };

  const handleStartRename = (profile: PlayerProfile) => {
    setEditingProfileId(profile.id);
    setEditingName(profile.name);
  };

  const handleSaveRename = () => {
    if (editingProfileId && editingName.trim()) {
      renameProfile(editingProfileId, editingName.trim());
      setEditingProfileId(null);
      setEditingName('');
      refreshProfiles();
    }
  };

  const handleCancelRename = () => {
    setEditingProfileId(null);
    setEditingName('');
  };

  const handleResetProfile = (profileId: number) => {
    resetProfile(profileId);
    setShowResetConfirm(null);
    refreshProfiles();
  };

  const handleUnlockAll = (profileId: number) => {
    unlockAllContent(profileId);
    setShowUnlockConfirm(null);
    refreshProfiles();
  };

  return (
    <div className="profiles-screen">
      <button className="back-btn" onClick={onBack}>
        {t.preGameSetup.backToMenu}
      </button>

      <div className="profiles-content">
        <h1 className="profiles-title">{t.profiles.title}</h1>
        <p className="profiles-subtitle">{t.profiles.subtitle}</p>

        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`profile-card ${activeProfileId === profile.id ? 'active' : ''}`}
            >
              {/* Profile Header */}
              <div className="profile-header">
                {editingProfileId === profile.id ? (
                  <div className="profile-name-edit">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      maxLength={20}
                      autoFocus
                    />
                    <button className="save-btn" onClick={handleSaveRename}>
                      ✓
                    </button>
                    <button className="cancel-btn" onClick={handleCancelRename}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="profile-name-display">
                    <h2>{profile.name}</h2>
                    <button
                      className="rename-btn"
                      onClick={() => handleStartRename(profile)}
                      title={t.profiles.renameTooltip}
                    >
                      ✏️
                    </button>
                  </div>
                )}
                {activeProfileId === profile.id && (
                  <div className="active-badge">{t.profiles.activeBadge}</div>
                )}
              </div>

              {/* Profile Stats */}
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-icon">⚔️</span>
                  <span className="stat-label">{t.profiles.battlesWon}</span>
                  <span className="stat-value">{profile.stats.battlesWon}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">☠️</span>
                  <span className="stat-label">{t.profiles.enemiesKilled}</span>
                  <span className="stat-value">{profile.stats.enemiesKilled || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👑</span>
                  <span className="stat-label">{t.profiles.gamesCompleted}</span>
                  <span className="stat-value">{profile.stats.gamesCompleted}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💀</span>
                  <span className="stat-label">{t.profiles.runsFailed}</span>
                  <span className="stat-value">{profile.stats.runsFailed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🎁</span>
                  <span className="stat-label">{t.profiles.itemsDiscovered}</span>
                  <span className="stat-value">{profile.stats.itemsDiscovered.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-label">{t.profiles.timePlayed}</span>
                  <span className="stat-value">{formatPlayTime(profile.stats.hoursPlayed)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🎮</span>
                  <span className="stat-label">{t.profiles.runInProgress}</span>
                  <span className={`stat-value ${hasRunInProgress(profile.id) ? 'run-active' : 'run-inactive'}`}>
                    {hasRunInProgress(profile.id) ? t.profiles.yes : t.profiles.no}
                  </span>
                </div>
              </div>

              {/* Achievements Disabled Warning */}
              {profile.stats.achievementsDisabled && (
                <div className="achievements-warning">
                  {t.profiles.achievementsDisabledWarning}
                </div>
              )}

              {/* Profile Actions */}
              <div className="profile-actions">
                {activeProfileId !== profile.id && (
                  <button
                    className="use-profile-btn"
                    onClick={() => handleUseProfile(profile.id)}
                  >
                    {t.profiles.useProfile}
                  </button>
                )}
                {showResetConfirm === profile.id ? (
                  <div className="reset-confirm">
                    <p>{t.profiles.resetConfirmation}</p>
                    <button
                      className="confirm-reset-btn"
                      onClick={() => handleResetProfile(profile.id)}
                    >
                      {t.profiles.confirmReset}
                    </button>
                    <button
                      className="cancel-reset-btn"
                      onClick={() => setShowResetConfirm(null)}
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    className="reset-profile-btn"
                    onClick={() => setShowResetConfirm(profile.id)}
                  >
                    {t.profiles.resetProfile}
                  </button>
                )}
                
                {/* Unlock All Button */}
                <button
                  className="unlock-all-btn"
                  onClick={() => setShowUnlockConfirm(profile.id)}
                  disabled={profile.stats.achievementsDisabled}
                >
                  {profile.stats.achievementsDisabled ? t.profiles.alreadyUnlocked : t.profiles.unlockAll}
                </button>
                
                {/* Unlock All Modal */}
                {showUnlockConfirm === profile.id && (
                  <div className="unlock-modal-overlay" onClick={() => setShowUnlockConfirm(null)}>
                    <div className="unlock-confirm" onClick={(e) => e.stopPropagation()}>
                      <p>{t.profiles.unlockConfirmation}</p>
                      <p className="unlock-warning">{t.profiles.achievementsWarning}</p>
                      <button
                        className="confirm-unlock-btn"
                        onClick={() => handleUnlockAll(profile.id)}
                      >
                        {t.profiles.confirmUnlock}
                      </button>
                      <button
                        className="cancel-unlock-btn"
                        onClick={() => setShowUnlockConfirm(null)}
                      >
                        {t.common.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
