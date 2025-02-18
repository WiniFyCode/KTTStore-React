const express = require('express');
const router = express.Router();
const EmailController = require('./EmailController');

// Route gửi email liên hệ
router.post('/contact', EmailController.sendContactEmail);

module.exports = router; 