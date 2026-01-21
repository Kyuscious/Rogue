import React, { useState } from "react";
import { authApi } from "../api/authApi.js";
import { useAuthStore } from "../game/authStore.js";

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

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
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
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError("All fields are required");
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
      setError(err instanceof Error ? err.message : "Registration failed");
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
      setError(err instanceof Error ? err.message : "Anonymous login failed");
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
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button onClick={() => setIsRegister(true)}>
              Create Account
            </button>
          </>
        ) : (
          <>
            <h2>Register</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button onClick={handleRegister} disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>
            <button onClick={() => setIsRegister(false)}>Back to Login</button>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <h3>Or continue as guest</h3>
        <button onClick={handleAnonymous} disabled={loading}>
          {loading ? "Loading..." : "Play as Guest"}
        </button>
      </div>
    </div>
  );
};
