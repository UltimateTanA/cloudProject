// src/controllers/userController.js
const User = require('../models/User');

exports.getIntegrationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hasTelegram = !!(user.telegram && user.telegram.chatId);
    const hasGmail = !!(user.gmail && user.gmail.refreshToken); 
    res.json({
      hasTelegram,
      hasGmail,
      email: user.gmail.emailAddress || null,
      telegram: user.telegram.chatId || null,
      userId: user.username || null,
      telegramUsername: user.telegram.username || null
    });

  } catch (error) {
    console.error('Error fetching integration status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};