// src/config/db.js
const mongoose = require("mongoose");
require('dotenv').config();
async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || ""
    );

    console.log("MongoDB Connected (Mongoose)");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
