import React, { useState, useEffect } from 'react';
import './Disclaimer.css';

interface DisclaimerProps {
  onAccept: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  const [progress, setProgress] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Loop back to 0 when reaching 100 for continuous animation
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / 100); // 10 seconds = 100 * 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

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
          <h1>Runeterrogue</h1>
          <p className="subtitle">A Runeterra Roguelike Adventure</p>
        </div>

        <div className="legal-notice">
          <p>
            This is a <strong>fan-made project</strong>. Most of the characters, names, and IP are property of 
            <strong> Riot Games, Inc.</strong>
          </p>
          <p className="paragraph-spacing"> 
            This project is <strong>not</strong> affiliated with, endorsed by, sponsored by, or
            approved by <strong>Riot Games</strong>. (Yet ? Hopefully one day Corporate Mundo will notice us!)
          </p>
          <p>
            According to Riot Games's <a href="https://www.riotgames.com/en/legal" target="_blank" rel="noopener noreferrer" className="legal-link">Legal Jibber Jabber</a>, 
            this project is strictly for <strong>non-commercial</strong> use for the community to enjoy totally for free forever. 
            We will however try to register this product and apply for a Production API usage once it's completely stable (v1.0.0).
          </p>
          <p>
            All artwork, sound effects, music, and medias are created locally but still subject to Riot's IP, we try to remain as Lore-accurate as possible purely for the sake of immersion and discovery of Runeterra.
          </p>
          <p>
            If for any reason, at any given time riot's legal team decides to see this project taken down, we will <strong>comply immediatelly</strong> by stopping development and distribution. (Though we hope it never comes to that, we stay realistic !)
          </p>
          <p>
            It's an honour to create something inspired by Riot's amazing work, and we hope you enjoy playing this work of passion as much as we do creating it ! 
          </p>
          <p>
            If you have any questions or concerns, please contact us through our information below.
          </p>
          <p><strong> Thank you !</strong></p>
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
            <span className="checkbox-label">Do not show again</span>
          </label>
        </div>

        <button onClick={handleSkip} className="btn-skip">
          Skip
        </button>
      </div>
    </div>
  );
};
