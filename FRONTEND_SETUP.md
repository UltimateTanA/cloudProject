# Frontend Setup & Usage

## Quick Start

### 1. Start Backend Server

```bash
cd backend
node src/index.js
```

Backend should be running on `http://localhost:3000`

### 2. Start Frontend

**Option A: Use the startup script**
```bash
./start-frontend.sh
```

**Option B: Use Python**
```bash
cd frontend
python3 -m http.server 8000
```

**Option C: Use PHP**
```bash
cd frontend
php -S localhost:8000
```

**Option D: Just open the file**
- Double-click `frontend/index.html` in your file browser

### 3. Open in Browser

Open: `http://localhost:8000` (or just open `index.html` directly)

## Testing Flow

1. **Sign Up**
   - Click "Sign Up" tab
   - Enter username and password
   - Click "Sign Up" button

2. **Login**
   - Enter your credentials
   - Click "Login"
   - You'll see the main app interface

3. **Connect Gmail**
   - Click "Connect Gmail" button
   - Browser opens Google OAuth consent screen
   - Authorize access to your Gmail
   - You'll be redirected back to the app
   - Status should show "Connected"

4. **Start Watch**
   - Click "Start Watch" button
   - This enables push notifications
   - Status changes to "Watching for new emails"

5. **View Emails**
   - Click "Refresh" button
   - Recent emails will be displayed

6. **Test Push Notifications**
   - Send yourself an email from another account
   - Check server logs for push notification
   - (In production, you'd see real-time updates via WebSocket)

## Features

- ✅ Clean, modern UI
- ✅ User authentication
- ✅ Gmail OAuth integration
- ✅ Email list display
- ✅ Watch management
- ✅ Notifications log
- ✅ Responsive design

## Configuration

### Change API URL

Edit `frontend/app.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000'; // Change this
```

### Change OAuth Redirect

Edit `backend/src/controllers/gmailController.js`:
```javascript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8000';
```

Or set environment variable:
```bash
export FRONTEND_URL=http://localhost:8000
```

## Troubleshooting

**"Network error" when trying to login**
- Make sure backend is running on port 3000
- Check browser console for detailed errors

**"CORS error"**
- Backend should have CORS enabled (already configured)
- Make sure you're accessing frontend via HTTP (not file://)

**Gmail OAuth redirect fails**
- Check `GOOGLE_REDIRECT_URI` in backend matches: `http://localhost:3000/api/gmail/oauth2/callback`
- Make sure this URL is added in Google Cloud Console OAuth credentials

**"Gmail not connected" after OAuth**
- Check backend logs for errors
- Make sure you're logged in when clicking "Connect Gmail"
- Try refreshing the page after OAuth redirect

## Next Steps

- Add WebSocket for real-time email notifications
- Add email search and filtering
- Add email tagging UI
- Add webhook configuration interface

