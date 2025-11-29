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
      type: Number, // Store as timestamp (milliseconds)
    },
    emailAddress: {
      type: String,
    },
    historyId: {
      type: String, // For tracking last processed email
    },
    watchExpiry: {
      type: Number, // Timestamp when watch expires (needs renewal)
    },
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
