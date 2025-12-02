import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Kutipage</h1>
        <p style={styles.subtitle}>Welcome to your professional dashboard.</p>
        
        <div style={styles.buttonGroup}>
          <Link to="/signup" style={styles.link}>
            <button style={styles.primaryButton}>Get Started</button>
          </Link>
          
          <Link to="/login" style={styles.link}>
            <button style={styles.secondaryButton}>Log In</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Styling Object
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f5', // Light gray background
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '3rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    margin: '0 0 10px 0',
    color: '#18181b',
    fontSize: '2.5rem',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 30px 0',
    color: '#71717a',
    fontSize: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column', // Stack buttons vertically
    gap: '15px',
  },
  link: {
    textDecoration: 'none',
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#2563eb', // Professional Blue
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: '#52525b',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};