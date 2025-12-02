const express = require('express');
const router = express.Router();
const gmailController = require('../controllers/gmailController');
const authMiddleware = require('../middleware/auth');
const getIntegrationStatus = require('../controllers/integrate');

// OAuth flow
router.get('/connect', authMiddleware, gmailController.connectGmail);
router.get('/int',authMiddleware, getIntegrationStatus.getIntegrationStatus);
router.get('/oauth2/callback', gmailController.oauthCallback);
router.post('/pub-sub', gmailController.getMessages);
module.exports = router;

