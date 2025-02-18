const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/FavoriteController');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticateToken);

// Routes cho danh sách yêu thích
router.get('/', FavoriteController.getFavorites); // Lấy danh sách yêu thích của user
router.post('/add', FavoriteController.addToFavorites); // Thêm sản phẩm vào yêu thích
router.put('/:id', FavoriteController.updateFavorite); // Cập nhật ghi chú
router.delete('/:SKU', FavoriteController.removeFromFavorites); // Xóa khỏi yêu thích
router.get('/check/:SKU', FavoriteController.checkFavorite); // Kiểm tra với param

module.exports = router;
