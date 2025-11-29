# Quick Start - Gmail Push Notifications

## What Was Implemented

✅ **Gmail OAuth Integration** - Connect user's Gmail account  
✅ **Gmail Watch API** - Start push notifications for new emails  
✅ **Pub/Sub Push Handler** - Receive notifications from Google  
✅ **Email Processing** - Fetch and parse new emails automatically  
✅ **JWT Authentication** - Secure API endpoints  

## Quick Test (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
npm install googleapis
```

### 2. Set Up Google Cloud (One-Time)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select project
3. Enable **Gmail API** and **Pub/Sub API**
4. Create OAuth 2.0 credentials
5. Create Pub/Sub topic: `gmail-notify`
6. Grant Gmail service account publish permission

### 3. Configure Environment

Create `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/oauth2/callback
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PUBSUB_TOPIC=projects/your-project-id/topics/gmail-notify
```

### 4. Start Server
```bash
cd backend
node src/index.js
```

### 5. Test with Script
```bash
./test-gmail-push.sh
```

Or manually:

**Signup:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

**Login (save token):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

**Get Gmail OAuth URL:**
```bash
curl -X GET http://localhost:3000/api/gmail/connect \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Open URL in browser** → Authorize → Gmail connected!

### 6. Set Up Push Notifications

1. **Install ngrok** (to expose local server):
   ```bash
   ngrok http 3000
   ```

2. **Create Pub/Sub subscription** with push endpoint:
   ```bash
   gcloud pubsub subscriptions create gmail-notify-sub \
     --topic=gmail-notify \
     --push-endpoint=https://YOUR-NGROK-URL.ngrok.io/api/gmail/push
   ```

3. **Start watch** (or it auto-starts after OAuth):
   ```bash
   curl -X POST http://localhost:3000/api/gmail/watch \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### 7. Test Push Notifications

**Send yourself an email** → Check server logs for:
```
📧 Push notification received for: your-email@gmail.com
📬 New email: Test Subject from sender@example.com
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Create user account |
| POST | `/auth/login` | No | Login, get JWT token |
| GET | `/api/gmail/connect` | Yes | Get Gmail OAuth URL |
| GET | `/api/gmail/oauth2/callback` | Yes | OAuth callback (Google redirects here) |
| GET | `/api/gmail/messages` | Yes | List recent emails |
| POST | `/api/gmail/watch` | Yes | Start Gmail watch |
| POST | `/api/gmail/push` | No | Pub/Sub push endpoint (Google calls this) |

## What Happens When New Email Arrives?

1. **Gmail** detects new email in INBOX
2. **Google Pub/Sub** publishes notification to your topic
3. **Your endpoint** (`/api/gmail/push`) receives POST request
4. **Backend** fetches email details using Gmail API
5. **Email data** is logged (ready for ML tagging, websockets, webhooks)

## Next Steps

- [ ] Add WebSocket support for real-time frontend updates
- [ ] Integrate ML endpoint for email tagging
- [ ] Add Telegram/Slack/WhatsApp webhooks
- [ ] Set up watch renewal cron job (watches expire in ~7 days)

## Troubleshooting

**"Watch failed"** → Check `GOOGLE_PUBSUB_TOPIC` in `.env`  
**"No push received"** → Verify ngrok URL in Pub/Sub subscription  
**"Token expired"** → Re-authorize Gmail (OAuth flow again)  

See `TESTING_GUIDE.md` for detailed troubleshooting.

