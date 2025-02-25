const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/CouponController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

//!ADMIN - COUPON MANAGEMENT
router.get('/admin/coupons', authenticateToken, isAdmin, CouponController.getCouponsChoADMIN); // Lấy tất cả
router.post('/admin/coupons/create', authenticateToken, isAdmin, CouponController.createCoupon); // Tạo
router.put('/admin/coupons/update/:id', authenticateToken, isAdmin, CouponController.updateCoupon); // Cập nhật
router.delete('/admin/coupons/delete/:id', authenticateToken, isAdmin, CouponController.deleteCoupon); // Xóa
router.patch('/admin/coupons/toggle/:id', authenticateToken, isAdmin, CouponController.toggleCouponStatus); // Vô hiệu hóa/Kích hoạt 
//!ADMIN CALL THÊM /api/categories

module.exports = router;
