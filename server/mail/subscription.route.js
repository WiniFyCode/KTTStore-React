const express = require('express');
const router = express.Router();
const SubscriptionController = require('./SubscriptionController');

// Route đăng ký nhận tin
router.post('/', SubscriptionController.subscribe);

module.exports = router; 