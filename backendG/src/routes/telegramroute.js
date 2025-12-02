// src/routes/telegramroute.js
const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegramController');
const authMiddleware = require('../middleware/auth');
router.get('/connect', authMiddleware, telegramController.generateConnectLink);
router.post('/webhook',telegramController.listen);
module.exports = router;
