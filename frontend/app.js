// API Base URL
const API_BASE_URL = 'http://localhost:3000';

// State
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('currentUser');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    console.log(currentUser);
    console.log(authToken);

    // Check if redirected from Gmail OAuth

});

// ----- AUTH -----
async function handleSignup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        alert(res.ok ? 'Signup successful! Please login.' : data.message);
    } catch {
        alert('Network error during signup');
    }
}

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        console.log(data);
        if (res.ok) {
            authToken = data.token;
            currentUser = data.userId;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', currentUser);
            updateAuthUI();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch {
        alert('Network error during login');
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
}

// Update UI based on login status
function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const appSection = document.getElementById('app-section');
    const userInfo = document.getElementById('user-info');

    if (authToken) {
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        userInfo.textContent = `Logged in as: ${currentUser}`;
    } else {
        authSection.style.display = 'block';
        appSection.style.display = 'none';
        userInfo.textContent = '';
    }
}

// ----- GMAIL -----
async function connectGmail() {
    if (!authToken) return alert('Please login first');

    try {
        const res = await fetch(`${API_BASE_URL}/api/gmail/connect`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (res.ok && data.url) window.location.href = data.url;
        else alert('Failed to get Gmail OAuth URL');
    } catch {
        alert('Network error during Gmail connect');
    }
}

async function loadGmailMessages() {
    if (!authToken) return;

    const container = document.getElementById('messages-container');
    container.innerHTML = 'Loading messages...';

    try {
        console.log(authToken);
        const res = await fetch(`${API_BASE_URL}/api/gmail/messages`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();

        if (res.ok && data.messages) {
            displayMessages(data.messages);
        } else {
            container.innerHTML = data.message || 'No messages found';
        }
    } catch {
        container.innerHTML = 'Error loading messages';
    }
}

function displayMessages(messages) {
    const container = document.getElementById('messages-container');
    if (!messages.length) {
        container.innerHTML = 'No emails found';
        return;
    }
    container.innerHTML = messages.map(msg => `
        <div>
            <strong>From:</strong> ${msg.from}<br>
            <strong>Subject:</strong> ${msg.subject || '(No Subject)'}<br>
            <strong>Date:</strong> ${msg.date || 'Unknown'}<br>
            <p>${msg.snippet || ''}</p>
            <hr>
        </div>
    `).join('');
}

// ----- Event Listeners -----

document.getElementById('logout-btn').addEventListener('click', handleLogout);
document.getElementById('connect-gmail-btn').addEventListener('click', connectGmail);
