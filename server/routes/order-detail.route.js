const express = require('express');
const router = express.Router();
const OrderDetailController = require('../controllers/OrderDetailController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes cho người dùng
router.get('/order/:orderID', authenticateToken, OrderDetailController.getOrderDetails); // Lấy danh sách chi tiết đơn hàng


//??
router.get('/order/:orderID/detail/:id', authenticateToken, OrderDetailController.getOrderDetailById); // Lấy chi tiết một sản phẩm


//!ADMIN
router.get('/:orderID', authenticateToken, isAdmin, OrderDetailController.getOrderDetailschoADMIN); // Lấy chi tiết đơn hàng

module.exports = router;
