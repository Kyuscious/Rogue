import React, { useState, useEffect } from 'react';
import { useTranslations } from '../../../i18n/helpers';
import './Disclaimer.css';

interface DisclaimerProps {
  onAccept: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  const t = useTranslations();
  const [progress, setProgress] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / 100); // 10 seconds = 100 * 100ms
        if (newProgress >= 100) {
          // Auto-accept when timer reaches 100%
          if (dontShowAgain) {
            localStorage.setItem('skipDisclaimer', 'true');
          }
          onAccept();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [dontShowAgain, onAccept]);

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('skipDisclaimer', 'true');
    }
    onAccept();
  };

  return (
    <div className="disclaimer-screen">
      <div className="disclaimer-container">
        <div className="disclaimer-header">
          <h1>{t.disclaimer.title}</h1>
          <p className="subtitle">{t.disclaimer.subtitle}</p>
        </div>

        <div className="legal-notice">
          <p>
            {t.disclaimer.paragraph1.split('Riot Games, Inc.')[0]}
            <strong> Riot Games, Inc.</strong>
          </p>
          <p className="paragraph-spacing"> 
            {t.disclaimer.paragraph2.split('Riot Games')[0]}
            <strong>Riot Games</strong>
            {t.disclaimer.paragraph2.split('Riot Games')[1]}
          </p>
          <p>
            {t.disclaimer.paragraph3.split('Legal Jibber Jabber')[0]}
            <a href="https://www.riotgames.com/en/legal" target="_blank" rel="noopener noreferrer" className="legal-link">
              {t.disclaimer.legalLinkText}
            </a>
            {t.disclaimer.paragraph3.split('Legal Jibber Jabber')[1]}
          </p>
          <p>
            {t.disclaimer.paragraph4}
          </p>
          <p>
            {t.disclaimer.paragraph5}
          </p>
          <p>
            {t.disclaimer.paragraph6}
          </p>
          <p>
            {t.disclaimer.paragraph7}
          </p>
          <p><strong>{t.disclaimer.thankYou}</strong></p>
        </div>

        <div className="loading-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span className="checkbox-label">{t.disclaimer.dontShowAgain}</span>
          </label>
        </div>

        <button onClick={handleSkip} className="btn-skip">
          {t.disclaimer.skip}
        </button>
      </div>
    </div>
  );
};
