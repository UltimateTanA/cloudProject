// src/App.jsx
import { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    return id ? { userId: id } : null;
  });

  function handleLogin(data) {
    if (data?.userId) setUser({ userId: data.userId });
    else setUser(null);
  }
  function handleLogout() {
    setUser(null);
  }

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <main className="main">
        <Signup />
        <hr />
        <Login onLogin={handleLogin} />
        {user && <div className="welcome">Welcome, user {user.userId}</div>}
      </main>
    </div>
  );
}
