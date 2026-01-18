import React, { useState } from 'react';
import './MainMenu.css';

interface MainMenuProps {
  username: string;
  onStart: () => void;
  onProfiles: () => void;
  onIndex: () => void;
  onOptions: () => void;
  onLogout: () => void;
  onDisclaimer: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  username,
  onStart,
  onProfiles,
  onIndex,
  onOptions,
  onLogout,
  onDisclaimer,
}) => {
  const [showCreditsTooltip, setShowCreditsTooltip] = useState(false);

  const handleDiscordClick = () => {
    window.open('https://discord.gg/your-discord-link', '_blank');
  };

  return (
    <div className="main-menu">
      {/* Top Bar - Username and Logout */}
      <div className="top-bar">
        <div className="top-spacer"></div>
        <div className="user-section">
          <span className="username-badge">{username}</span>
          <button className="logout-compact" onClick={onLogout}>
            🚪
          </button>
        </div>
      </div>

      {/* Center Content */}
      <div className="center-content">
        <h1 className="game-title">Runeterrogue</h1>
        
        <div className="main-actions">
          <button className="action-btn primary-action" onClick={onStart}>
            <span className="btn-icon">▶️</span>
            <span className="btn-text">Start</span>
          </button>
          
          <div className="secondary-actions">
            <button className="action-btn secondary" onClick={onProfiles}>
              <span className="btn-icon">👤</span>
              <span className="btn-text">Profiles</span>
            </button>
            <button className="action-btn secondary" onClick={onIndex}>
              <span className="btn-icon">📖</span>
              <span className="btn-text">Index</span>
            </button>
            <button className="action-btn secondary" onClick={onOptions}>
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">Options</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="bottom-links">
        <button className="link-btn" onClick={onDisclaimer}>
          ⓘ Disclaimer
        </button>
        <button className="link-btn" onClick={handleDiscordClick}>
          💬 Discord
        </button>
        <div 
          className="link-btn credits-link"
          onMouseEnter={() => setShowCreditsTooltip(true)}
          onMouseLeave={() => setShowCreditsTooltip(false)}
        >
          ✨ Credits
          {showCreditsTooltip && (
            <div className="credits-tooltip">
              <div className="tooltip-label">Created by</div>
              <div className="tooltip-name">Luci</div>
            </div>
          )}
        </div>
        <div className="version-tag">v0.0.1</div>
      </div>
    </div>
  );
};
