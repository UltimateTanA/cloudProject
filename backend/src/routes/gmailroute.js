const express = require('express');
const router = express.Router();
const gmailController = require('../controllers/gmailController');
const authMiddleware = require('../middleware/auth');

// OAuth flow
router.get('/connect', authMiddleware, gmailController.connectGmail);
router.get('/oauth2/callback', gmailController.oauthCallback);

// Email operations
router.get('/messages', gmailController.listMessages);

// Push notifications
router.post('/watch', gmailController.startWatch);
router.post('/push', gmailController.pushHandler); // No auth - Google calls this directly

module.exports = router;

