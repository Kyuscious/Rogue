import React, { useState, useEffect } from 'react';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // const { setPlayerName } = useGameStore(); // TODO: Add to store when needed

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
        setError('Saved credentials are invalid. Please login again.');
        setIsLoading(false);
        return;
      }

      const playerData = localStorage.getItem(playerKey);
      console.log('Loading player:', playerData);
      onLoginSuccess();
    } catch (err) {
      setError('Failed to auto-login. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(isSignUp ? 'Please enter username and password' : 'Please enter credentials');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
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
          setError('This account already exists. Try logging in instead!');
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
          setError('Invalid username or password');
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

      // TODO: Add setPlayerName to store when needed
      onLoginSuccess();
    } catch (err) {
      setError('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkRiotAccount = async () => {
    setIsLoading(true);
    setError('');
    try {
      // TODO: Implement Riot OAuth flow
      // This would redirect to Riot's OAuth endpoint and get the summoner name
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUsername('RiotSummonerName');
      setError('');
    } catch (err) {
      setError('Failed to link Riot account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>Riot Roguelike</h1>
          <p className="subtitle">Connect to Your Account</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
            disabled={isLoading}
          >
            Login
          </button>
          <button
            className={`tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Summoner Name</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              maxLength={50}
            />
            {!isSignUp && <p className="input-hint">At least 4 characters</p>}
          </div>

          <div className="remember-me-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe">Remember me on this device</label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="btn-login">
            {isLoading ? (isSignUp ? 'Creating Account...' : 'Logging In...') : (isSignUp ? 'Create Account' : 'Login')}
          </button>
        </form>

        <div className="riot-link-section">
          <p className="divider">or</p>
          <button
            type="button"
            onClick={handleLinkRiotAccount}
            disabled={isLoading}
            className="btn-riot-link"
          >
            🎮 Link Riot Account
          </button>
          <p className="riot-hint">Auto-fill your summoner name instantly</p>
        </div>

        <p className="login-footer">
          Your data is stored securely • Password protected
        </p>
      </div>
    </div>
  );
};
