// src/utils/telegramBot.js
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN not set. Telegram bot features will be disabled.');
  module.exports = null;
} else {
  // WEBHOOK MODE: Telegram sends POST requests to your server
  const bot = new TelegramBot(BOT_TOKEN);
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  if (WEBHOOK_URL) {
    bot.setWebHook(WEBHOOK_URL).then(() => {
      console.log(`Telegram bot webhook set to: ${WEBHOOK_URL}`);
    }).catch(err => {
      console.error('Error setting webhook:', err);
    });
  } else {
    console.warn('TELEGRAM_WEBHOOK_URL not set. Webhook not configured.');
  }

  bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const token = match[1]; // The connection token from /start TOKEN

    try {
      if (!token) {
        bot.sendMessage(chatId, 
          'Please use the connection link from your web app to connect.'
        );
        return;
      }

      // Find user by connection token
      const user = await User.findOne({
        'telegram.connectionToken': token,
        'telegram.connectionTokenExpiry': { $gt: new Date() }
      });

      if (!user) {
        bot.sendMessage(chatId, 
          'Invalid or expired connection token. Please generate a new one from your web app.'
        );
        return;
      }

      // Save chatId to user
      if (!user.telegram) {
        user.telegram = {};
      }
      user.telegram.chatId = String(chatId);
      user.telegram.username = msg.chat.username || null;
      user.telegram.firstName = msg.chat.first_name || null;
      user.telegram.connectedAt = new Date();
      user.telegram.connectionToken = null;
      user.telegram.connectionTokenExpiry = null;

      await user.save();

      bot.sendMessage(chatId, 
        `Successfully connected!\n\nYour Telegram is now linked to account: ${user.username}\n\nYou will receive notifications here.`
      );

      console.log(`User ${user.username} connected Telegram chatId: ${chatId}`);
    } catch (error) {
      console.error('Error connecting Telegram:', error);
      bot.sendMessage(chatId, 'An error occurred. Please try again.');
    }
  });

  // Function to send message to user by userId (looks up their saved chatId)
  async function sendMessageToUser(userId, message) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.telegram || !user.telegram.chatId) {
        throw new Error('User not connected to Telegram');
      }

      await bot.sendMessage(user.telegram.chatId, message);
      return { success: true };
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
    }
  }

  module.exports = {
    bot,
    sendMessageToUser
  };
}
