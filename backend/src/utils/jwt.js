// src/utils/jwt.js
const jwt = require("jsonwebtoken");
JWT_SECRET = "abcdefg"
exports.generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" } // 7-day expiry
  );
};
