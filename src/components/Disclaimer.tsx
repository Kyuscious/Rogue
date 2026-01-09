import React, { useState, useEffect } from 'react';
import './Disclaimer.css';

interface DisclaimerProps {
  onAccept: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onAccept();
          return 100;
        }
        return prev + (100 / 50); // 5 seconds = 50 * 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onAccept]);

  const handleSkip = () => {
    onAccept();
  };

  return (
    <div className="disclaimer-screen">
      <div className="disclaimer-container">
        <div className="disclaimer-header">
          <h1>Riot Roguelike</h1>
          <p className="subtitle">A Riot Universe Adventure</p>
        </div>

        <div className="legal-notice">
          <p>
            This is a <strong>fan-made project</strong>. Most of the characters, names, and IP are property of 
            <strong> Riot Games, Inc.</strong> | © 2026 Sorratec inc
          </p>
          <p>
            According to Riot Games' Fan Content Policy, this project is non-commercial and created for educational and entertainment purposes only.
            Sharing the passion for the Runeterra universe is our only goal, and we do not intend to infringe on Riot's intellectual property rights.
            If they wish to see this project taken down, we will comply immediately.
          </p>
        </div>

        <div className="loading-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="loading-text">Runeterra awaits</p>
        </div>

        <button onClick={handleSkip} className="btn-skip">
          Skip
        </button>

        <div className="social-footer">
          <a
            href="https://discord.gg/yourdiscord"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon discord"
            title="Join our Discord"
          >
            <span>💬</span>
          </a>
          <a
            href="mailto:contact@sorratec.inc"
            className="social-icon email"
            title="Send us an email"
          >
            <span>✉️</span>
          </a>
          <a
            href="#"
            className="social-icon placeholder"
            title="Coming soon"
          >
            <span>🎮</span>
          </a>
          <a
            href="#"
            className="social-icon placeholder"
            title="Coming soon"
          >
            <span>⭐</span>
          </a>
        </div>
      </div>
    </div>
  );
};
