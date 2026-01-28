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

interface Contributor {
  name: string;
  link: string;
  icon: string;
}

interface CreditsCategory {
  title: string;
  contributors: Contributor[];
}

const CREDITS_DATA: CreditsCategory[] = [
  {
    title: 'Developed by',
    contributors: [
      { name: 'Luci', link: 'https://twitter.com/luci930353', icon: '🐦' },
    ],
  },
  {
    title: 'Arts by',
    contributors: [
      { name: 'MartinStarlove', link: 'https://twitter.com/MartinStarlove', icon: '🎨' },
    ],
  },
  {
    title: 'Musics by',
    contributors: [
      // { name: 'Your Name', link: 'https://your-link', icon: '🎵' },
    ],
  },
  {
    title: 'Tested by',
    contributors: [
      { name: 'ad Raychu', link: 'https://twitter.com/ad_raychu', icon: '🧪' },
    ],
  },
  {
    title: 'Supported by',
    contributors: [
      // { name: 'Your Name', link: 'https://your-link', icon: '❤️' },
    ],
  },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  username,
  onStart,
  onProfiles,
  onIndex,
  onOptions,
  onLogout,
  onDisclaimer,
}) => {
  const [showCreditsModal, setShowCreditsModal] = useState(false);

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
        <button 
          className="link-btn" 
          onClick={() => setShowCreditsModal(true)}
        >
          ✨ Credits
        </button>
        <div className="version-tag">v0.0.1</div>
      </div>

      {/* Credits Modal */}
      {showCreditsModal && (
        <div className="credits-modal-overlay" onClick={() => setShowCreditsModal(false)}>
          <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
            <div className="credits-modal-header">
              <h2>Credits</h2>
              <button 
                className="credits-close-btn" 
                onClick={() => setShowCreditsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="credits-modal-content">
              {CREDITS_DATA.map((category) => (
                <div key={category.title} className="credits-section">
                  <h3 className="credits-category">{category.title}</h3>
                  {category.contributors.length > 0 ? (
                    <div className="credits-contributors">
                      {category.contributors.map((contributor) => (
                        <button
                          key={contributor.name}
                          className="contributor-btn"
                          onClick={() => window.open(contributor.link, '_blank')}
                          title={`Visit ${contributor.name}'s profile`}
                        >
                          <span className="contributor-icon">{contributor.icon}</span>
                          <span className="contributor-name">{contributor.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="credits-empty">
                      <p>Coming soon...</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="credits-footer">
                <p>Support the development:</p>
                <div className="support-buttons">
                  <button 
                    className="support-btn kofi-btn"
                    onClick={() => window.open('https://ko-fi.com/luci930353', '_blank')}
                  >
                    ☕ Ko-Fi
                  </button>
                  <button 
                    className="support-btn patreon-btn"
                    onClick={() => window.open('https://patreon.com/', '_blank')}
                  >
                    🎁 Patreon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
