import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  regionName: string;
  progress: number; // 0-100
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ regionName, progress, message }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1 className="loading-title">Traveling to {regionName}</h1>
        
        <div className="loading-bar-container">
          <div className="loading-bar">
            <div 
              className="loading-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="loading-percentage">{Math.round(progress)}%</span>
        </div>
        
        {message && <p className="loading-message">{message}</p>}
        
        <div className="loading-spinner">
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
          <div className="spinner-blade"></div>
        </div>
      </div>
    </div>
  );
};
