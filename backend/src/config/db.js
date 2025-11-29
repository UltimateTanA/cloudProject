// src/config/db.js
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://random_insaan:random_rona@cluster0.91w5l1n.mongodb.net/mail_integration"
    );

    console.log("MongoDB Connected (Mongoose)");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
