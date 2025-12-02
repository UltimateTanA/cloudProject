const { google } = require('googleapis');
const User = require('../models/User');
const { createOAuth2Client, getAuthUrl } = require('../utils/googleClient');
require('dotenv').config();
const classifyEmail = require('../controllers/MLclasify').classifyEmail;
const sendMessageToUser = require('../utils/telegramBot').sendMessageToUser;
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

async function startWatchForUser(user) 
{
  try {
    const gmail = await getGmailClient(user);
    const response = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: process.env.GOOGLE_TOPIC_NAME,
        labelIds: ["INBOX"],
      },
    });

    user.gmail.historyId = response.data.historyId;
    user.gmail.watchStartedAt = Date.now();
    await user.save();

    console.log("Gmail watch started for:", user.gmail.emailAddress);
  } catch (err) {
    console.error("Failed to start Gmail watch:", err.message);
}
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
    await startWatchForUser(user);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}?gmail_connected=true`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OAuth callback failed' });
  }
};
exports.getMessages = async (req, res) => {
  try{
      const message = req.body.message;
    if (!message) return res.status(400).send("No message");
    const data = Buffer.from(message.data, "base64").toString();
    const notification = JSON.parse(data);
    console.log("New Gmail notification:", notification);
    res.status(200).send("OK");
    const user = await User.findOne({ 'gmail.emailAddress': notification.emailAddress });
    if (!user) {
      console.log("No user found for email:", notification.emailAddress);
      return;
    }
    const gmailClient = await getGmailClient(user);
    const resss = await gmailClient.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: 1,
      orderBy: "descending" 
    });

    const messages = resss.data.messages;
    console.log("Fetched email for user:", user.gmail.emailAddress, messages);
    const msgId = messages[0].id;
    const msgRes = await gmailClient.users.messages.get({
      userId: "me",
      id: msgId,
      format: "full"
    });

    const payload = msgRes.data.payload;
    const headers = payload.headers;
    const subjectHeader = headers.find(h => h.name === "Subject");
    const fromHeader = headers.find(h => h.name === "From");

    const latestEmail = {
      id: msgRes.data.id,
      threadId: msgRes.data.threadId,
      from: fromHeader ? fromHeader.value : "",
      subject: subjectHeader ? subjectHeader.value : "",
      snippet: msgRes.data.snippet,
    };
    console.log("Latest email fetched:", latestEmail);
    const classification = await classifyEmail(latestEmail.snippet);
    console.log("Email classified as:", classification);
    const predictedLabel = classification.label[0];
    if(predictedLabel === '__label__verify_code' || predictedLabel === '__label__updates')
    {
      if(user.telegram && user.telegram.chatId)
      {
        
        const messageText = `New Email from: ${latestEmail.from}\nSubject: ${latestEmail.subject}\nSnippet: ${latestEmail.snippet}`;
        await sendMessageToUser(user._id, messageText);
        console.log("Notification sent to Telegram for user:", user.telegram.username);
      }
      else{
        console.log("User not connected to Telegram:", user.username);
      }
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};
