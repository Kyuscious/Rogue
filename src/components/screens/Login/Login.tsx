import React, { useState, useEffect } from 'react';
import './Login.css';
import { useGameStore } from '../../../game/store';
import { useTranslation } from '../../../hooks/useTranslation';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const t = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setUsername: setPlayerName } = useGameStore();

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
      
      // Auto-login if credentials are remembered
      setTimeout(() => {
        handleAutoLogin(savedUsername, savedPassword);
      }, 300);
    }
  }, []);

  // Simple hash function for password (not secure - use bcrypt on backend)
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const handleAutoLogin = async (user: string, pass: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const passwordHash = simpleHash(pass);
      const credentialsKey = `player_${user}_${passwordHash}`;
      const playerKey = `player_${user}`;

      const existingCredentials = localStorage.getItem(credentialsKey);
      if (!existingCredentials) {
        // Credentials expired or invalid
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
        setError(t.login.errors.savedCredentialsInvalid);
        setIsLoading(false);
        return;
      }

      const playerData = localStorage.getItem(playerKey);
      console.log('Loading player:', playerData);
      setPlayerName(user);
      onLoginSuccess();
    } catch (err) {
      setError(t.login.errors.autoLoginFailed);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(isSignUp ? t.login.errors.emptySignUpCredentials : t.login.errors.emptyCredentials);
      return;
    }

    if (password.length < 4) {
      setError(t.login.errors.passwordTooShort);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const passwordHash = simpleHash(password);
      const credentialsKey = `player_${username}_${passwordHash}`;
      const playerKey = `player_${username}`;

      if (isSignUp) {
        // Sign up - check if this exact username/password combo exists
        const existingCredentials = localStorage.getItem(credentialsKey);
        if (existingCredentials) {
          setError(t.login.errors.accountExists);
          setIsLoading(false);
          return;
        }

        // Create new player
        const newPlayer = {
          username,
          createdAt: new Date().toISOString(),
          highestFloor: 1,
          totalGold: 0,
          totalWins: 0,
          lastPlayed: new Date().toISOString(),
          riotLinked: false,
        };

        localStorage.setItem(credentialsKey, JSON.stringify({ username, passwordHash }));
        localStorage.setItem(playerKey, JSON.stringify(newPlayer));
      } else {
        // Login - verify credentials
        const existingCredentials = localStorage.getItem(credentialsKey);
        if (!existingCredentials) {
          setError(t.login.errors.invalidCredentials);
          setIsLoading(false);
          return;
        }

        const playerData = localStorage.getItem(playerKey);
        console.log('Loading player:', playerData);
      }

      // Save credentials if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }

      setPlayerName(username);
      onLoginSuccess();
    } catch (err) {
      setError(t.login.errors.connectionFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAsGuest = () => {
    // Guest mode uses a temporary username
    setPlayerName('Guest');
    onLoginSuccess();
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>{t.login.title}</h1>
          <p className="subtitle">{t.login.subtitle}</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
            disabled={isLoading}
          >
            {t.login.loginTab}
          </button>
          <button
            className={`tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
            disabled={isLoading}
          >
            {t.login.signUpTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">{t.login.usernameLabel}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.login.usernamePlaceholder}
              disabled={isLoading}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.login.passwordLabel}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.login.passwordPlaceholder}
              disabled={isLoading}
              maxLength={50}
            />
            {!isSignUp && <p className="input-hint">{t.login.passwordHint}</p>}
            {!isSignUp && (
              <button 
                type="button" 
                className="forgot-password-link"
                onClick={() => setError(t.login.errors.forgotPasswordSoon)}
              >
                {t.login.forgotPassword}
              </button>
            )}
          </div>

          <div className="remember-me-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe">{t.login.rememberMe}</label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="btn-login">
            {isLoading ? (isSignUp ? t.login.creatingAccount : t.login.loggingIn) : (isSignUp ? t.login.signUpButton : t.login.loginButton)}
          </button>
        </form>

        <div className="riot-link-section">
          <p className="divider">or</p>
          <button
            type="button"
            onClick={handlePlayAsGuest}
            disabled={isLoading}
            className="btn-riot-link"
          >
            {t.login.playAsGuest}
          </button>
          <p className="riot-hint">{t.login.guestWarning}</p>
        </div>

        <p className="login-footer">
          {t.login.footer}
        </p>
      </div>
    </div>
  );
};
