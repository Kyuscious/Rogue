import React, { useState } from "react";
import { authApi } from "../../../api/authApi.js";
import { useAuthStore } from "@game/authStore";
import { useTranslation } from "../../../hooks/useTranslation";

export const AuthScreen: React.FC<{
  onSuccess: () => void;
}> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser, setToken } = useAuthStore();
  const t = useTranslation();

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t.login.errors.emptyCredentials);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await authApi.login(email, password);
      setUser(result.user);
      setToken(result.token);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.errors.connectionFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError(t.login.errors.emptySignUpCredentials);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await authApi.register(email, password, username);
      setUser(result.user);
      setToken(result.token);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.errors.connectionFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await authApi.loginAnonymous();
      setUser(result.user);
      setToken(result.token);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.errors.autoLoginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Riot Roguelike</h1>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <div style={{ marginBottom: "20px" }}>
        {!isRegister ? (
          <>
            <h2>{t.login.loginTab}</h2>
            <input
              type="email"
              placeholder={t.login.usernameLabel}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder={t.login.passwordLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? t.login.loggingIn : t.login.loginButton}
            </button>
            <button onClick={() => setIsRegister(true)}>
              {t.login.signUpButton}
            </button>
          </>
        ) : (
          <>
            <h2>{t.login.signUpTab}</h2>
            <input
              type="text"
              placeholder={t.login.usernameLabel}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <input
              type="email"
              placeholder={t.login.usernameLabel}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder={t.login.passwordLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button onClick={handleRegister} disabled={loading}>
              {loading ? t.login.creatingAccount : t.login.signUpButton}
            </button>
            <button onClick={() => setIsRegister(false)}>{t.login.backToLogin}</button>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <h3>{t.login.orContinueAsGuest}</h3>
        <button onClick={handleAnonymous} disabled={loading}>
          {loading ? t.common.loading : t.login.playAsGuest}
        </button>
      </div>
    </div>
  );
};
