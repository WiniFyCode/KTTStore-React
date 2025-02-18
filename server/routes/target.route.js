const express = require('express');
const router = express.Router();
const TargetController = require('../controllers/TargetController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes cho admin (yêu cầu đăng nhập và quyền admin)
router.get('/', TargetController.getTargets); // Lấy tất cả target
router.get('/:id', authenticateToken, isAdmin, TargetController.getTargetById); // Lấy chi tiết target
router.post('/', authenticateToken, isAdmin, TargetController.createTarget); // Tạo target mới
router.put('/:id', authenticateToken, isAdmin, TargetController.updateTarget); // Cập nhật target
router.delete('/:id', authenticateToken, isAdmin, TargetController.deleteTarget); // Xóa target

module.exports = router;
