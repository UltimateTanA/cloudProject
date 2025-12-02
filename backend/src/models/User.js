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
      type: String, 
    },
    firstName: {
      type: String, 
    },
    connectedAt: {
      type: Date, 
    },
    connectionToken: {
      type: String, 
      index: true,
    },
    connectionTokenExpiry: {
      type: Date,
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
