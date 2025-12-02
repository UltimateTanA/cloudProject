// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("../utils/jwt");

exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      username,
      passwordHash,
    });
    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
    });

  } catch (error) {
    console.log("Signup Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid  password" });
    }
    const token = jwt.generateToken(user._id);
    return res.json({
      message: "Login successful",
      token,
      userId: user._id
    });
  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
