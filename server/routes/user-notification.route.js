const express = require('express');
const router = express.Router();
const userNotificationController = require('../controllers/UserNotificationController');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Tất cả routes đều cần xác thực token
router.use(authenticateToken);

router.get('/', userNotificationController.getNotifications);// Lấy danh sách thông báo của user
router.put('/:userNotificationID/read', userNotificationController.markAsRead);// Đánh dấu thông báo đã đọc
router.put('/read-all', userNotificationController.markAllAsRead);// Đánh dấu tất cả thông báo đã đọc
router.get('/unread/count', userNotificationController.getUnreadCount);// Lấy số lượng thông báo chưa đọc

module.exports = router;
