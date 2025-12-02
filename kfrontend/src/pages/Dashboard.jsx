import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for potential logout/navigation

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [hasGmail, setHasGmail] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState(null);
  const [emailAddress, setEmailAddress] = useState(null);
  
  // Logic remains the same
  const connectTelegram = async () => {
    try {
      const res = await fetch("http://35.74.239.203:3003/api/telegram/connect", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (!res.ok) throw new Error("Failed to generate Telegram link");
      const data = await res.json();
      if (data.connectLink) window.location.href = data.connectLink;
      else alert("No connect link returned");
    } catch (err) {
      console.error("Error connecting Telegram", err);
      alert("Error connecting Telegram");
    }
  };

  const connectGmail = async () => {
    try {
      const res = await fetch("http://35.76.105.79:3002/api/gmail/connect", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (!res.ok) throw new Error("Failed to generate Gmail auth URL");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("No Gmail URL returned");
    } catch (err) {
      console.error("Error connecting Gmail", err);
      alert("Error connecting Gmail");
    }
  };

  const fetchUserIntegrations = async () => {
    try {
      const res = await fetch("http://35.76.105.79:3002/api/gmail/int", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
      });
      const data = await res.json();
      setUserId(data.userId);
      setHasGmail(data.hasGmail);
      setHasTelegram(data.hasTelegram);
      setTelegramUsername(data.telegramUsername);
      setEmailAddress(data.email);
    } catch (err) {
      console.error("Error fetching user data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserIntegrations();
  }, []);

  if (loading) return <div style={styles.loadingContainer}>Loading Dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.dashboardCard}>
        
        {/* Header Section */}
        <div style={styles.header}>
          <h2 style={styles.title}>Integration Dashboard</h2>
          <div style={styles.userInfo}>
            <span style={styles.userLabel}>Account ID:</span>
            <span style={styles.userId}>{userId}</span>
          </div>
        </div>

        {/* Integrations Grid */}
        <div style={styles.grid}>
          
          {/* Gmail Card */}
          <div style={styles.integrationCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Gmail</h3>
              {hasGmail ? <span style={styles.badgeConnected}>Active</span> : <span style={styles.badgeInactive}>Inactive</span>}
            </div>
            
            <p style={styles.cardDescription}>
              {hasGmail 
                ? `Connected as ${emailAddress}` 
                : "Connect your inbox to receive important messages and alerts on webhooks."}
            </p>

            {hasGmail ? (
              <button disabled style={styles.buttonConnected}>✓ Connected</button>
            ) : (
              <button onClick={connectGmail} style={styles.gmailButton}>
                Connect Google Account
              </button>
            )}
          </div>

          {/* Telegram Card */}
          <div style={styles.integrationCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Telegram</h3>
              {hasTelegram ? <span style={styles.badgeConnected}>Active</span> : <span style={styles.badgeInactive}>Inactive</span>}
            </div>

            <p style={styles.cardDescription}>
              {hasTelegram 
                ? `Linked to @${telegramUsername}` 
                : "Link your Telegram to get instant notifications on your phone."}
            </p>

            {hasTelegram ? (
              <button disabled style={styles.buttonConnected}>✓ Connected</button>
            ) : (
              <button onClick={connectTelegram} style={styles.telegramButton}>
                Connect Telegram
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', // Centers vertically
    minHeight: '100vh',   // Ensures it takes full height
    backgroundColor: '#f0f2f5',
    fontFamily: '"Segoe UI", Arial, sans-serif',
    padding: '20px',      // Prevents edges from touching on mobile
    boxSizing: 'border-box',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666',
  },
  dashboardCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '700px', // Slightly wider than login for the dashboard
    padding: '40px',
  },
  header: {
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', // Handles mobile view better
  },
  title: {
    margin: 0,
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '700',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8f9fa',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  userLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userId: {
    fontSize: '14px',
    color: '#333',
    fontFamily: 'monospace',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  integrationCard: {
    border: '1px solid #e1e4e8',
    borderRadius: '12px',
    padding: '24px',
    transition: 'transform 0.2s',
    backgroundColor: '#fff',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  cardDescription: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
  // Buttons
  gmailButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#DB4437', // Google Red
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  telegramButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0088cc', // Telegram Blue
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonConnected: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#f0fdf4', // Very light green
    color: '#166534', // Dark green text
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'default',
  },
  // Status Badges
  badgeConnected: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeInactive: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
};