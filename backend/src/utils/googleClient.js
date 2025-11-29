const { google } = require('googleapis');

// TODO: Move these to .env file for security
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "633627124684-jfgt456h9hi057283f1stka0u713imr5.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "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";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/gmail/oauth2/callback";

function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

function getAuthUrl() {
  const oAuth2Client = createOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify', // Needed for watch
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  return url;
}

module.exports = {
  createOAuth2Client,
  getAuthUrl,
};