const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const telegramRoute = require('./routes/telegramroute');
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
app.use('/api/telegram', telegramRoute);
const PORT = process.env.PORT;
app.listen(PORT,'0.0.0.0' ,() => {
    console.log(`Telegram Service running on port ${PORT}`);
});
