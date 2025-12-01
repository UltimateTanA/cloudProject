// src/components/Navbar.jsx
export default function Navbar({ onLogout }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const loggedIn = !!token;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    onLogout?.();
  }

  return (
    <nav className="nav">
      <div className="brand">Auth Demo</div>
      <div>
        {loggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    </nav>
  );
}
