const express = require('express');
const router = express.Router();
const ProductSizeStockController = require('../controllers/ProductSizeStockController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes cho người dùng
router.get('/sku/:SKU', ProductSizeStockController.getStockBySKU); // Lấy thông tin tồn kho theo SKU
router.get('/color/:colorID', ProductSizeStockController.getStockByColor); // Lấy tồn kho theo màu
router.get('/info/:productID/:colorName/:size', ProductSizeStockController.getSKUInfo);
// Routes cho admin
router.put('/admin/product-size-stock/update/:SKU', authenticateToken, isAdmin, ProductSizeStockController.updateStock); // Cập nhật số lượng

module.exports = router;
