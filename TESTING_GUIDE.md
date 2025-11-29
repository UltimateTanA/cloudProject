# Gmail Push Notification Testing Guide

This guide will walk you through testing the Gmail push notification system step by step.

## Prerequisites

1. **Google Cloud Project Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project (or use existing)
   - Enable **Gmail API** and **Cloud Pub/Sub API**
   - Create OAuth 2.0 credentials (Client ID & Secret)

2. **Install Dependencies**
   ```bash
   cd backend
   npm install googleapis
   ```

3. **Environment Variables**
   Create a `.env` file in `/backend` directory:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/oauth2/callback
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_PUBSUB_TOPIC=projects/your-project-id/topics/gmail-notify
   ```

## Step 1: Set Up Google Cloud Pub/Sub

### 1.1 Create Pub/Sub Topic
```bash
# Using gcloud CLI (install if needed: https://cloud.google.com/sdk/docs/install)
gcloud pubsub topics create gmail-notify --project=your-project-id
```

Or via Google Cloud Console:
- Go to **Pub/Sub** → **Topics**
- Click **Create Topic**
- Name: `gmail-notify`

### 1.2 Grant Gmail Service Account Permission
Gmail needs permission to publish to your topic:

```bash
# Get Gmail service account email
GMAIL_SERVICE_ACCOUNT="gmail-api-push@system.gserviceaccount.com"

# Grant publish permission
gcloud pubsub topics add-iam-policy-binding gmail-notify \
  --member="serviceAccount:${GMAIL_SERVICE_ACCOUNT}" \
  --role="roles/pubsub.publisher" \
  --project=your-project-id
```

Or via Console:
- Go to your topic → **Permissions** tab
- Click **Add Principal**
- Principal: `gmail-api-push@system.gserviceaccount.com`
- Role: **Pub/Sub Publisher**

## Step 2: Set Up Public HTTPS Endpoint (for Local Testing)

Since Google Pub/Sub needs a public HTTPS URL, you'll need to expose your local server.

### Option A: Using ngrok (Recommended for Testing)

1. **Install ngrok**: https://ngrok.com/download

2. **Start your backend server**:
   ```bash
   cd backend
   node src/index.js
   ```

3. **In another terminal, expose your server**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### Option B: Using Cloud Run / Heroku / Railway (Production)

Deploy your backend to a service that provides HTTPS automatically.

## Step 3: Create Pub/Sub Push Subscription

### 3.1 Create Subscription with Push Endpoint

```bash
gcloud pubsub subscriptions create gmail-notify-sub \
  --topic=gmail-notify \
  --push-endpoint=https://your-ngrok-url.ngrok.io/api/gmail/push \
  --project=your-project-id
```

Or via Console:
- Go to **Pub/Sub** → **Subscriptions**
- Click **Create Subscription**
- Name: `gmail-notify-sub`
- Topic: `gmail-notify`
- Delivery type: **Push**
- Endpoint URL: `https://your-ngrok-url.ngrok.io/api/gmail/push`

**Important**: Update this URL whenever ngrok restarts (free tier gives new URLs).

## Step 4: Test the Complete Flow

### 4.1 Start Your Server

```bash
cd backend
node src/index.js
```

You should see: `Server running on http://localhost:3000`

### 4.2 Test User Signup/Login

```bash
# Signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Login (save the token)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

**Save the token** from the login response (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 4.3 Connect Gmail Account

```bash
# Get OAuth URL
curl -X GET http://localhost:3000/api/gmail/connect \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

This returns a URL like:
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Open this URL in your browser** and authorize access to your Gmail account.

After authorization, Google redirects to:
```
http://localhost:3000/api/gmail/oauth2/callback?code=4/0A...
```

Your backend should:
- Exchange code for tokens
- Save tokens to database
- Automatically start Gmail watch
- Redirect to frontend

### 4.4 Verify Watch is Active

Check your database or logs. The user document should have:
- `gmail.accessToken`
- `gmail.refreshToken`
- `gmail.emailAddress`
- `gmail.historyId`
- `gmail.watchExpiry` (timestamp ~7 days in future)

### 4.5 Test Push Notification

**Send yourself a test email** from another account (or use Gmail's "Compose" to send to yourself).

Within a few seconds, Google Pub/Sub should:
1. Detect the new email
2. Publish a message to your topic
3. Push the message to your endpoint: `POST /api/gmail/push`

**Check your server logs** - you should see:
```
📧 Push notification received for: your-email@gmail.com, historyId: 12345
📬 New email: Test Subject from sender@example.com
```

### 4.6 Verify Email Processing

Check your server console for:
- Push notification received
- New emails processed
- HistoryId updated

You can also test manually by calling the push endpoint with a mock Pub/Sub message:

```bash
curl -X POST http://localhost:3000/api/gmail/push \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "data": "'$(echo -n '{"emailAddress":"your-email@gmail.com","historyId":"12345"}' | base64)'"
    }
  }'
```

## Step 5: Testing Checklist

- [ ] Google Cloud project created
- [ ] Gmail API enabled
- [ ] Pub/Sub API enabled
- [ ] Pub/Sub topic created (`gmail-notify`)
- [ ] Gmail service account has publish permission
- [ ] Backend server running
- [ ] ngrok exposing local server (or deployed to HTTPS)
- [ ] Pub/Sub subscription created with push endpoint
- [ ] User signed up and logged in
- [ ] Gmail OAuth completed (tokens saved)
- [ ] Gmail watch started (check `watchExpiry` in DB)
- [ ] Test email sent to connected Gmail account
- [ ] Push notification received in server logs
- [ ] New email processed and logged

## Step 6: Troubleshooting

### Issue: "Watch failed" or "Topic not found"
- Verify `GOOGLE_PUBSUB_TOPIC` in `.env` matches your topic name
- Format: `projects/YOUR_PROJECT_ID/topics/gmail-notify`
- Check Gmail service account has publish permission

### Issue: "Push endpoint not receiving requests"
- Verify ngrok URL is correct in subscription
- Check ngrok is still running (free tier URLs change on restart)
- Test endpoint manually: `curl -X POST https://your-url.ngrok.io/api/gmail/push`
- Check Pub/Sub subscription status in Console

### Issue: "401 Unauthorized" in push handler
- Push endpoint doesn't use JWT (Google calls it directly)
- If you added auth middleware, remove it for `/push` route

### Issue: "No historyId stored"
- First watch might not have historyId
- Send an email after watch is active
- Check `user.gmail.historyId` in database

### Issue: "Token expired"
- Tokens auto-refresh, but if refresh token is missing:
  - Re-authorize Gmail (OAuth flow again)
  - Make sure `prompt: 'consent'` in OAuth URL to get refresh token

## Step 7: Next Steps

Once push notifications work:

1. **Add WebSocket Support** - Emit new emails to frontend in real-time
2. **Add ML Tagging** - Send emails to your ML endpoint for classification
3. **Add Webhooks** - Trigger Telegram/Slack/WhatsApp notifications
4. **Add Watch Renewal** - Set up cron job to renew watch every 6 days

## Testing with Postman

### Collection Setup

1. **Environment Variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (set after login)

2. **Requests**:

   **Signup**:
   ```
   POST {{base_url}}/auth/signup
   Body: { "username": "test", "password": "test123" }
   ```

   **Login**:
   ```
   POST {{base_url}}/auth/login
   Body: { "username": "test", "password": "test123" }
   ```
   Save token to environment variable.

   **Get Gmail Connect URL**:
   ```
   GET {{base_url}}/api/gmail/connect
   Headers: Authorization: Bearer {{token}}
   ```

   **List Messages**:
   ```
   GET {{base_url}}/api/gmail/messages
   Headers: Authorization: Bearer {{token}}
   ```

   **Start Watch**:
   ```
   POST {{base_url}}/api/gmail/watch
   Headers: Authorization: Bearer {{token}}
   ```

## Monitoring

- **Google Cloud Console** → Pub/Sub → Subscriptions → Check message delivery
- **Server logs** - Watch for push notifications
- **Database** - Check `gmail.historyId` updates
- **ngrok dashboard** - See incoming requests at http://localhost:4040

---

**Need Help?** Check the server console logs for detailed error messages!

