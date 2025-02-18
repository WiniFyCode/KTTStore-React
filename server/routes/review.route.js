const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { authenticateAdmin, authenticateCustomer } = require('../middlewares/auth.middleware');

// Public routes
router.get('/product/:productID', ReviewController.getByProduct); // Lấy đánh giá của sản phẩm (ai cũng xem được)

// Customer routes (yêu cầu đăng nhập)
router.post('/', authenticateCustomer, ReviewController.create); // Tạo đánh giá mới
router.put('/:reviewID', authenticateCustomer, ReviewController.update); // Cập nhật đánh giá
router.delete('/:reviewID', authenticateCustomer, ReviewController.delete); // Xóa đánh giá
router.get('/user', authenticateCustomer, ReviewController.getByUser); // Lấy đánh giá của user hiện tại

// Admin routes (yêu cầu là admin)
router.get('/admin/all', authenticateAdmin, ReviewController.getAll); // Lấy tất cả đánh giá
router.delete('/admin/:reviewID', authenticateAdmin, ReviewController.adminDelete); // Admin xóa đánh giá

module.exports = router;
