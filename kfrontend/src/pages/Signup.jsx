import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("http://35.76.105.79:3001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      setMsg(data.message);

      if (res.status === 201) {
        // Wait 1.5 seconds so user sees the success message before moving
        setTimeout(() => nav("/login"), 1500);
      }
    } catch (error) {
      setMsg("Failed to connect to server.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us to get started with your workspace.</p>

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              name="username" 
              placeholder="Choose a username" 
              style={styles.input} 
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="Create a strong password" 
              style={styles.input} 
              required
            />
          </div>

          <button type="submit" style={styles.button}>Sign Up</button>
          
          {msg && (
            <div style={msg.includes("success") || msg.includes("created") ? styles.successMsg : styles.errorMsg}>
              {msg}
            </div>
          )}
        </form>
        
        <p style={styles.footerText}>
          Already have an account? <span style={styles.link} onClick={() => nav('/login')}>Log in</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: '"Segoe UI", Arial, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '24px',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 30px 0',
    color: '#666',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#28a745', // Green color for Signup to distinguish from Login
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
  },
  successMsg: {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  errorMsg: {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  footerText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#007bff',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
  }
};