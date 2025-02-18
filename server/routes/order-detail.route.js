const express = require('express');
const router = express.Router();
const OrderDetailController = require('../controllers/OrderDetailController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes cho người dùng
router.get('/order/:orderID', authenticateToken, OrderDetailController.getOrderDetails); // Lấy danh sách chi tiết đơn hàng

// Routes cho admin
router.get('/:orderID', authenticateToken, isAdmin, OrderDetailController.getOrderDetailschoADMIN); // Lấy chi tiết đơn hàng
router.get('/order/:orderID/detail/:id', authenticateToken, OrderDetailController.getOrderDetailById); // Lấy chi tiết một sản phẩm
router.post('/order/:orderID', authenticateToken, isAdmin, OrderDetailController.addOrderDetail); // Thêm sản phẩm vào đơn hàng
router.put('/order/:orderID/detail/:id', authenticateToken, isAdmin, OrderDetailController.updateOrderDetail); // Cập nhật số lượng sản phẩm
router.delete('/order/:orderID/detail/:id', authenticateToken, isAdmin, OrderDetailController.deleteOrderDetail); // Xóa sản phẩm khỏi đơn hàng

module.exports = router;
