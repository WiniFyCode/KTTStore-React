const express = require('express');
const router = express.Router();
const AIController = require('../controllers/AIController');

// Route xử lý chat với AI
router.post('/chat', AIController.handleChat);

module.exports = router;
