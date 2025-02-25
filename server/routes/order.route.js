const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

//?CUSTOMER
router.get('/my-orders', authenticateToken, OrderController.getOrders); // Lấy danh sách đơn hàng của user
router.get('/my-orders/:id', authenticateToken, OrderController.getOrderById); // Lấy chi tiết đơn hàng
router.post('/create', authenticateToken, OrderController.createOrder); // Tạo đơn hàng mới
router.post('/cancel/:id', authenticateToken, OrderController.cancelOrder); // Hủy đơn hàng

//!ADMIN - ORDER MANAGEMENT
router.get('/admin/orders', authenticateToken, isAdmin, OrderController.getAllOrdersChoADMIN); // Lấy tất cả đơn hàng
//!Xem chi tiết đơn hàng trong /api/admin/order-details/:orderID trong OrderDetailController
router.patch('/admin/orders/update/:id', authenticateToken, isAdmin, OrderController.updateOrderStatus); // Cập nhật trạng thái đơn hàng
router.delete('/admin/orders/delete/:id', authenticateToken, isAdmin, OrderController.deleteOrder); // Xóa đơn hàng

//!ADMIN XÁC NHẬN THANH TOÁN VÀ GỬI EMAIL
router.post('/confirm-payment/:orderID', OrderController.confirmPayment);

module.exports = router;
