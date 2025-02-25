const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/PromotionController');
const { authenticateAdmin, authenticateToken } = require('../middlewares/auth.middleware');

//!ADMIN - PROMOTION MANAGEMENT
router.get('/all', authenticateAdmin, promotionController.getAllPromotions); //Lấy tất cả
router.post('/create', authenticateAdmin, promotionController.createPromotion); //Tạo
router.put('/update/:id', authenticateAdmin, promotionController.updatePromotion); //Cập nhật
router.delete('/delete/:id', authenticateAdmin, promotionController.deletePromotion); //Xóa
router.patch('/toggle-status/:id', authenticateAdmin, promotionController.toggleStatus); //Bật tắt
//!ADMIN CALL THÊM /api/categories để chọn danh mục sản phẩm
//!ADMIN CALL THÊM /api/products để chọn sản phẩm


// Routes cho cả admin và customer
router.get('/active', promotionController.getActivePromotions);
router.get('/:promotionID', promotionController.getPromotionById);
router.get('/product/:productId', promotionController.getPromotionsForProduct);

module.exports = router; 