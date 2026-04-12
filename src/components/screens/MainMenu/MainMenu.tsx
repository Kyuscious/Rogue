import React, { useState } from 'react';
import './MainMenu.css';
import { useTranslation } from '../../../hooks/useTranslation';

interface MainMenuProps {
  username: string;
  onStart: () => void;
  onProfiles: () => void;
  onIndex: () => void;
  onOptions: () => void;
  onLogout: () => void;
  onDisclaimer: () => void;
}

const CREDITS_DATA_KEYS = [
  {
    titleKey: 'developedBy' as const,
    contributors: [
      { name: 'Luci', link: 'https://twitter.com/luci930353', icon: '🐦' },
    ],
  },
  {
    titleKey: 'artsBy' as const,
    contributors: [
      { name: 'MartinStarlove', link: 'https://purelyhuman.xyz/artists/MartinStarlove', icon: '🎨' },
    ],
  },
  {
    titleKey: 'musicsBy' as const,
    contributors: [
      // { name: 'Your Name', link: 'https://your-link', icon: '🎵' },
    ],
  },
  {
    titleKey: 'testedBy' as const,
    contributors: [
      { name: 'ad Raychu', link: 'https://twitter.com/ad_raychu', icon: '🧪' },
      { name: 'Fotok', link: 'https://twitter.com/fotok', icon: '🧪' },
    ],
  },
  {
    titleKey: 'supportedBy' as const,
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
  const t = useTranslation();
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
        <h1 className="game-title">{t.mainMenu.title}</h1>
        
        <div className="main-actions">
          <button className="action-btn primary-action" onClick={onStart}>
            <span className="btn-icon">▶️</span>
            <span className="btn-text">{t.mainMenu.start}</span>
          </button>
          
          <div className="secondary-actions">
            <button className="action-btn secondary" onClick={onProfiles}>
              <span className="btn-icon">👤</span>
              <span className="btn-text">{t.mainMenu.profiles}</span>
            </button>
            <button className="action-btn secondary" onClick={onIndex}>
              <span className="btn-icon">📖</span>
              <span className="btn-text">{t.mainMenu.index}</span>
            </button>
            <button className="action-btn secondary" onClick={onOptions}>
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">{t.mainMenu.options}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="bottom-links">
        <button className="link-btn" onClick={onDisclaimer}>
          ⓘ {t.mainMenu.disclaimer}
        </button>
        <button className="link-btn" onClick={handleDiscordClick}>
          💬 {t.mainMenu.discord}
        </button>
        <button 
          className="link-btn" 
          onClick={() => setShowCreditsModal(true)}
        >
          ✨ {t.mainMenu.credits}
        </button>
        <div className="version-tag">{t.mainMenu.version}</div>
      </div>

      {/* Credits Modal */}
      {showCreditsModal && (
        <div className="credits-modal-overlay" onClick={() => setShowCreditsModal(false)}>
          <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
            <div className="credits-modal-header">
              <h2>{t.credits.title}</h2>
              <button 
                className="credits-close-btn" 
                onClick={() => setShowCreditsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="credits-modal-content">
              {CREDITS_DATA_KEYS.map((category) => (
                <div key={category.titleKey} className="credits-section">
                  <h3 className="credits-category">{t.credits[category.titleKey]}</h3>
                  {category.contributors.length > 0 ? (
                    <div className="credits-contributors">
                      {category.contributors.map((contributor) => (
                        <button
                          key={contributor.name}
                          className="contributor-btn"
                          onClick={() => window.open(contributor.link, '_blank')}
                          title={t.credits.visitProfile.replace('{{name}}', contributor.name)}
                        >
                          <span className="contributor-icon">{contributor.icon}</span>
                          <span className="contributor-name">{contributor.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="credits-empty">
                      <p>{t.credits.comingSoon}</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="credits-footer">
                <p>{t.credits.supportDevelopment}</p>
                <div className="support-buttons">
                  <button 
                    className="support-btn kofi-btn"
                    onClick={() => window.open('https://ko-fi.com/luci930353', '_blank')}
                  >
                    {t.credits.kofi}
                  </button>
                  <button 
                    className="support-btn patreon-btn"
                    onClick={() => window.open('https://patreon.com/', '_blank')}
                  >
                    {t.credits.patreon}
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
