// src/pages/Signup.jsx
import { useState } from "react";
import { signup } from "../utils/auth";

export default function Signup() {
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
      const res = await signup({ username: username.trim(), password });
      // backend usually returns { message, userId } — show message if present
      setMsg(res.message || "Signup successful — you can login now.");
      setUsername("");
      setPassword("");
    } catch (err) {
      setMsg(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h2>Signup</h2>
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
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
}
