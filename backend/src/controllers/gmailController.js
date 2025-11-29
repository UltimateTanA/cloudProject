const { google } = require('googleapis');
const User = require('../models/User');
const { createOAuth2Client, getAuthUrl } = require('../utils/googleClient');

// Helper function to get authenticated Gmail client for a user
async function getGmailClient(user) {
  const oAuth2Client = createOAuth2Client();
  oAuth2Client.setCredentials({
    access_token: user.gmail.accessToken,
    refresh_token: user.gmail.refreshToken,
    expiry_date: user.gmail.expiryDate,
  });

  // Auto refresh tokens if expired
  oAuth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) user.gmail.accessToken = tokens.access_token;
    if (tokens.expiry_date) user.gmail.expiryDate = tokens.expiry_date;
    await user.save();
  });

  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

// GET /api/gmail/connect
exports.connectGmail = async (req, res) => {
  try {
            const userId = req.user.id; 
            const state = Buffer.from(JSON.stringify({ userId })).toString("base64url");
            const oAuth2Client = createOAuth2Client();
            const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify"
            ],
            state,
        });

        res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create auth URL' });
  }
};

// GET /api/gmail/oauth2/callback?code=...
exports.oauthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (!state) {
      return res.status(400).json({ message: "Missing state param" });
    }

    const { userId } = JSON.parse(Buffer.from(state, "base64url").toString());

    if (!userId) {
      return res.status(400).json({ message: "Invalid state" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const oAuth2Client = createOAuth2Client();

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Get user email from Gmail profile
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const profileRes = await gmail.users.getProfile({ userId: 'me' });
    const emailAddress = profileRes.data.emailAddress;

    user.gmail = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      emailAddress,
    };

    await user.save();
    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8000';
    res.redirect(`${frontendUrl}?gmail_connected=true`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OAuth callback failed' });
  }
};

// GET /api/gmail/messages (list latest N emails)
exports.listMessages = async (req, res) => {
    console.log("hello look here");
  try {
    console.log("hell");
    console.log(req);
    console.log(req.user);
    console.log(req.user.id);
    console.log("hello look here");
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user.gmail || !user.gmail.refreshToken) {
      return res.status(400).json({ message: 'Gmail not connected' });
    }

    const oAuth2Client = createOAuth2Client();
    oAuth2Client.setCredentials({
      access_token: user.gmail.accessToken,
      refresh_token: user.gmail.refreshToken,
      expiry_date: user.gmail.expiryDate,
    });

    // auto refresh if expired
    oAuth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) user.gmail.accessToken = tokens.access_token;
      if (tokens.expiry_date) user.gmail.expiryDate = tokens.expiry_date;
      await user.save();
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const list = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
    });

    const messages = [];

    for (const m of list.data.messages || []) {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: m.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const headers = full.data.payload.headers || [];
      const getHeader = (name) =>
        headers.find((h) => h.name === name)?.value || '';

      messages.push({
        id: full.data.id,
        threadId: full.data.threadId,
        snippet: full.data.snippet,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        date: getHeader('Date'),
      });
    }

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list messages' });
  }
};

// POST /api/gmail/watch - Start watching for new emails (Gmail Push)
exports.startWatch = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.gmail || !user.gmail.refreshToken) {
      return res.status(400).json({ message: 'Gmail not connected' });
    }

    const gmail = await getGmailClient(user);
    
    // Get current historyId first
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const currentHistoryId = profile.data.historyId;

    // Set up Pub/Sub topic (you need to set this in your .env)
    const topicName = process.env.GOOGLE_PUBSUB_TOPIC || `projects/${process.env.GOOGLE_PROJECT_ID}/topics/gmail-notify`;

    // Start watching
    const watchResponse = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: topicName,
        labelIds: ['INBOX'], // Watch INBOX only
        labelFilterAction: 'include'
      }
    });

    // Save watch expiry and historyId
    user.gmail.historyId = currentHistoryId;
    user.gmail.watchExpiry = watchResponse.data.expiration; // Unix timestamp in ms
    await user.save();

    res.json({ 
      message: 'Gmail watch started successfully',
      expiration: watchResponse.data.expiration,
      historyId: currentHistoryId
    });
  } catch (err) {
    console.error('Watch Error:', err);
    res.status(500).json({ message: 'Failed to start watch', error: err.message });
  }
};

// POST /api/gmail/push - Handle Pub/Sub push notifications from Google
exports.pushHandler = async (req, res) => {
  try {
    // Pub/Sub sends data in a specific format
    const message = req.body.message;
    if (!message || !message.data) {
      return res.status(400).json({ message: 'Invalid Pub/Sub message format' });
    }

    // Decode base64 data
    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
    const emailAddress = data.emailAddress;
    const historyId = data.historyId;

    console.log(`📧 Push notification received for: ${emailAddress}, historyId: ${historyId}`);

    // Find user by email
    const user = await User.findOne({ 'gmail.emailAddress': emailAddress });
    if (!user || !user.gmail || !user.gmail.refreshToken) {
      console.log(`User not found for email: ${emailAddress}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Get Gmail client
    const gmail = await getGmailClient(user);

    // Get history since last processed
    const startHistoryId = user.gmail.historyId;
    if (!startHistoryId) {
      console.log('No historyId stored, skipping');
      return res.status(200).json({ message: 'No historyId stored' });
    }

    // Fetch history
    const historyResponse = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: startHistoryId,
      historyTypes: ['messageAdded']
    });

    const newMessages = [];
    const history = historyResponse.data.history || [];

    for (const record of history) {
      if (record.messagesAdded) {
        for (const msgAdded of record.messagesAdded) {
          const messageId = msgAdded.message.id;
          
          // Get full message details
          const messageData = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
          });

          const headers = messageData.data.payload.headers || [];
          const getHeader = (name) => headers.find((h) => h.name === name)?.value || '';

          const emailData = {
            id: messageData.data.id,
            threadId: messageData.data.threadId,
            snippet: messageData.data.snippet,
            subject: getHeader('Subject'),
            from: getHeader('From'),
            date: getHeader('Date'),
            body: extractEmailBody(messageData.data.payload)
          };

          newMessages.push(emailData);
          
          // TODO: Send to ML endpoint for tagging
          // await tagEmailWithML(emailData);
          
          // TODO: Send websocket notification
          // io.to(userSocketId).emit('new_email', emailData);
          
          // TODO: Trigger webhooks (Telegram, Slack, etc.)
          // await triggerWebhooks(user, emailData);
          
          console.log(`📬 New email: ${emailData.subject} from ${emailData.from}`);
        }
      }
    }

    // Update historyId to latest
    if (history.length > 0) {
      user.gmail.historyId = history[history.length - 1].id;
      await user.save();
    }

    res.status(200).json({ 
      message: 'Push notification processed',
      newMessagesCount: newMessages.length 
    });
  } catch (err) {
    console.error('Push Handler Error:', err);
    // Always return 200 to Pub/Sub to avoid retries for our errors
    res.status(200).json({ message: 'Error processing push', error: err.message });
  }
};

// Helper function to extract email body
function extractEmailBody(payload) {
  let body = '';
  
  if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64').toString();
  } else if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString();
        break;
      } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString();
      }
    }
  }
  
  return body;
}