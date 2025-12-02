// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
  },
  gmail:{
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    expiryDate: {
      type: Number, 
    },
    emailAddress: {
      type: String,
    },
    historyId: {
      type: String, 
    },
    watchExpiry: {
      type: Number,
    },
  },
  telegram: {
    chatId: {
      type: String,
    },
    username: {
      type: String, // Telegram username (optional)
    },
    firstName: {
      type: String, // Telegram first name
    },
    connectedAt: {
      type: Date, // Timestamp when connected
    },
    connectionToken: {
      type: String, // Temporary token for connecting (expires after use)
      index: true,
    },
    connectionTokenExpiry: {
      type: Date, // When the connection token expires
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
