# Frontend - Gmail Integration Test

A simple, modern frontend to test the Gmail push notification system.

## Features

✅ **User Authentication** - Sign up and login  
✅ **Gmail OAuth** - Connect Gmail account  
✅ **Email List** - View recent emails  
✅ **Watch Management** - Start/stop Gmail watch  
✅ **Notifications Log** - View push notification events  

## How to Use

### Option 1: Open Directly (Simplest)

1. Make sure your backend server is running:
   ```bash
   cd backend
   node src/index.js
   ```

2. Open `index.html` in your browser:
   - Double-click `index.html`, or
   - Right-click → Open with → Your browser

### Option 2: Use a Simple HTTP Server (Recommended)

Using Python:
```bash
cd frontend
python3 -m http.server 8000
```
Then open: http://localhost:8000

Using Node.js (http-server):
```bash
npm install -g http-server
cd frontend
http-server -p 8000
```
Then open: http://localhost:8000

Using PHP:
```bash
cd frontend
php -S localhost:8000
```

## Usage Flow

1. **Sign Up** - Create a new account
2. **Login** - Login with your credentials
3. **Connect Gmail** - Click "Connect Gmail" button
   - This opens Google OAuth consent screen
   - Authorize access to your Gmail
   - You'll be redirected back
4. **Start Watch** - Click "Start Watch" to enable push notifications
5. **View Emails** - Click "Refresh" to load recent emails
6. **Monitor Logs** - Check the notifications log for new email events

## API Endpoints Used

- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `GET /api/gmail/connect` - Get OAuth URL
- `GET /api/gmail/messages` - List emails
- `POST /api/gmail/watch` - Start watch

## Configuration

The frontend is configured to connect to `http://localhost:3000` by default.

To change the API URL, edit `app.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000'; // Change this
```

## Troubleshooting

**"Network error"** - Make sure backend is running on port 3000  
**"CORS error"** - Backend should have CORS enabled (already added)  
**"Gmail not connected"** - Complete OAuth flow first  
**OAuth redirect fails** - Check `GOOGLE_REDIRECT_URI` in backend matches your setup  

## Next Steps

- Add WebSocket support for real-time notifications
- Add email filtering and search
- Add email tagging UI
- Add webhook configuration UI

