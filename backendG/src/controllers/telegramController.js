// src/controllers/telegramController.js
const User = require('../models/User');
const crypto = require('crypto');
const telegramBot = require('../utils/telegramBot');
const { sendMessageToUser } = telegramBot || {};
// Generate connection token and link
exports.generateConnectLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);
    if (!user.telegram) {
      user.telegram = {};
    }
    user.telegram.connectionToken = token;
    user.telegram.connectionTokenExpiry = expiryTime;
    await user.save();
    const botUsername = process.env.BOT_USERNAME;
    const connectLink = `https://t.me/${botUsername.replace('@', '')}?start=${token}`;

    res.json({
      message: 'Connection link generated',
      token,
      connectLink,
      expiresAt: expiryTime,
      instructions: `1. Click the link: ${connectLink}\n2. Or send: /start ${token} to the bot`
    });
  } catch (error) {
    console.error('Error generating connect link:', error);
    res.status(500).json({ message: 'Failed to generate connection link' });
  }
};

// Check connection status
exports.getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isConnected = !!(user.telegram && user.telegram.chatId);
    
    res.json({
      connected: isConnected,
      chatId: user.telegram?.chatId || null,
      connectedAt: user.telegram?.connectedAt || null
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    res.status(500).json({ message: 'Failed to get connection status' });
  }
};

exports.sendMessage = async (userId, message) => {
  try {

    if (!message) {
      throw new Error('Message is required');
    }
    if (!sendMessageToUser) {
      throw new Error('Telegram bot not configured');
    }

    await sendMessageToUser(userId, message);

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    
    if (error.message === 'User not connected to Telegram') {
      return res.status(400).json({ message: 'User not connected to Telegram' });
    }

    res.status(500).json({ message: 'Failed to send message' });
  }
};
exports.listen = async(req,res) =>{
    if (telegramBot && telegramBot.bot) {
        console.log(req.body);
        telegramBot.bot.processUpdate(req.body);
        res.sendStatus(200);
      } else {
        res.status(503).json({ message: 'Telegram bot not configured' });
      }
};
