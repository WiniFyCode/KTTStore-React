const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes cho người dùng
router.get('/', CategoryController.getCategories); // Lấy tất cả danh mục
router.get('/:id', CategoryController.getCategoryById); // Lấy chi tiết danh mục

// Routes cho admin (yêu cầu đăng nhập và quyền admin)
router.post('/', authenticateToken, isAdmin, CategoryController.createCategory); // Tạo danh mục mới
router.put('/:id', authenticateToken, isAdmin, CategoryController.updateCategory); // Cập nhật danh mục
router.delete('/:id', authenticateToken, isAdmin, CategoryController.deleteCategory); // Xóa danh mục

module.exports = router;
