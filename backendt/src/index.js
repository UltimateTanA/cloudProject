const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const gmailRoute = require('./routes/gmailroute');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
try {
  require('./utils/telegramBot');
} catch (error) {
  console.log('Telegram bot not initialized:', error.message);
}
app.use('/api/gmail', gmailRoute);

// Start server
const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gmail Service running on port ${PORT}`);
});
