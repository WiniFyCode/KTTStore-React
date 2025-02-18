const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/CouponController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes cho admin
router.get('/admin/coupons', authenticateToken, isAdmin, CouponController.getCouponsChoADMIN); // Lấy tất cả thông tin mã giảm giá
router.put('/admin/coupons/update/:id', authenticateToken, isAdmin, CouponController.updateCoupon); // Cập nhật mã giảm giá
router.post('/admin/coupons/create', authenticateToken, isAdmin, CouponController.createCoupon); // Tạo mã giảm giá mới
router.delete('/admin/coupons/delete/:id', authenticateToken, isAdmin, CouponController.deleteCoupon); // Xóa mã giảm giá
router.patch('/admin/coupons/toggle/:id', authenticateToken, isAdmin, CouponController.toggleCouponStatus); // Vô hiệu hóa/Kích hoạt mã giảm giá

module.exports = router;
