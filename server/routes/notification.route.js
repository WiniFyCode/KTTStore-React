const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticateToken);

// Routes cho admin (đặt sau routes user để tránh conflict)
router.get('/admin/notifications', authenticateToken, isAdmin, NotificationController.getNotficationChoADMIN); // Lấy tất cả thông báo cho admin
router.put('/admin/notifications/update/:id', authenticateToken, isAdmin, NotificationController.updateNotification); // Cập nhật thông báo
router.post('/admin/notifications/create', authenticateToken, isAdmin, NotificationController.createNotification); // Tạo thông báo mới
router.delete('/admin/notifications/delete/:id', authenticateToken, isAdmin, NotificationController.deleteNotification); // Xóa thông báo

module.exports = router;
