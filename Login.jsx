// src/pages/Login.jsx
import { useState } from "react";
import { login } from "../utils/auth";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!username.trim() || !password) {
      setMsg("Both username and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ username: username.trim(), password });
      // expected backend response: { message, token, userId }
      if (res.token) {
        localStorage.setItem("token", res.token);
      }
      if (res.userId) {
        localStorage.setItem("userId", res.userId);
      }
      setMsg(res.message || "Login successful");
      onLogin?.(res);
    } catch (err) {
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {msg && <div className="msg">{msg}</div>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
