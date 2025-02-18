const express = require('express');
const router = express.Router();
const UserCouponController = require('../controllers/UserCouponController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes cho người dùng
router.get('/my-coupons', authenticateToken, UserCouponController.getUserCoupons); // Lấy danh sách mã giảm giá của user
router.get('/my-coupons/:id', authenticateToken, UserCouponController.getUserCouponById); // Lấy chi tiết mã giảm giá
router.post('/apply', authenticateToken, UserCouponController.applyCoupon); // Sử dụng mã giảm giá
router.get('/available', authenticateToken, UserCouponController.getAvailableCoupons); // Lấy danh sách mã giảm giá có thể sử dụng
// Routes cho admin
router.get('/', authenticateToken, isAdmin, UserCouponController.getAllUserCoupons); // Lấy danh sách mã giảm giá của tất cả user
router.post('/', authenticateToken, isAdmin, UserCouponController.addUserCoupon); // Thêm mã giảm giá cho user
router.put('/:id', authenticateToken, isAdmin, UserCouponController.updateUserCoupon); // Cập nhật mã giảm giá
router.patch('/:id/cancel', authenticateToken, isAdmin, UserCouponController.cancelUserCoupon); // Hủy mã giảm giá

module.exports = router;
