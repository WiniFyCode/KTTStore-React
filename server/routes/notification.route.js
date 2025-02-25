const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticateToken);

//!ADMIN - NOTIFICATION MANAGEMENT
router.get('/admin/notifications', authenticateToken, isAdmin, NotificationController.getNotficationChoADMIN); // Lấy tất cả
router.post('/admin/notifications/create', authenticateToken, isAdmin, NotificationController.createNotification); // Tạo
router.put('/admin/notifications/update/:id', authenticateToken, isAdmin, NotificationController.updateNotification); // Cập nhật
router.delete('/admin/notifications/delete/:id', authenticateToken, isAdmin, NotificationController.deleteNotification); // Xóa

module.exports = router;
