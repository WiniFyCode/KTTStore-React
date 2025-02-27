const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const UserCoupon = require('../models/UserCoupon');
const mongoose = require('mongoose');

class CouponController {
    
    //!ADMIN
    // ADMIN: Lấy danh sách mã giảm giá
    // "coupon" + "stats : tổng mã giảm giá , mã giảm giá đang hoạt động , mã giảm giá hết hạn, tổng lượt sử dụng"
    async getCouponsChoADMIN(req, res) {
        try {
            // Lấy tất cả mã giảm giá
            const coupons = await Coupon.find()
                .select('couponID code description discountType discountValue minOrderValue maxDiscountAmount startDate endDate usageLimit totalUsageLimit usedCount isActive couponType minimumQuantity appliedCategories createdAt updatedAt');

            // Lấy tất cả categories để map với appliedCategories
            const categories = await Category.find().select('categoryID name');
            const categoryMap = categories.reduce((acc, cat) => {
                acc[cat.categoryID] = cat.name;
                return acc;
            }, {});

            // Transform coupons để thêm tên category
            const transformedCoupons = coupons.map(coupon => {
                const couponObj = coupon.toObject();
                if (couponObj.appliedCategories && couponObj.appliedCategories.length > 0) {
                    const categoryNames = {};
                    couponObj.appliedCategories.forEach(catID => {
                        if (categoryMap[catID]) {
                            categoryNames[catID] = categoryMap[catID];
                        }
                    });
                    couponObj.appliedCategories = categoryNames;
                }
                return couponObj;
            });

            const currentDate = new Date();

            // Tính toán thống kê
            const stats = {
                totalCoupons: transformedCoupons.length,
                totalActiveCoupons: transformedCoupons.filter(coupon => 
                    coupon.isActive && 
                    new Date(coupon.endDate) >= currentDate && 
                    coupon.usedCount < coupon.totalUsageLimit
                ).length,
                totalExpiredCoupons: transformedCoupons.filter(coupon => 
                    !coupon.isActive || 
                    new Date(coupon.endDate) < currentDate ||
                    coupon.usedCount >= coupon.totalUsageLimit
                ).length,
                totalUsedCount: transformedCoupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)
            };

            res.json({
                coupons: transformedCoupons,
                stats
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách mã giảm giá',
                error: error.message
            });
        }
    }

    //!ADMIN
    // ADMIN: Tạo mã giảm giá mới
    async createCoupon(req, res) {
        try {
            const {
                code,
                description,
                discountType,
                discountValue,
                minOrderValue,
                maxDiscountAmount,
                startDate,
                endDate,
                usageLimit,
                totalUsageLimit,
                isActive = true,
                couponType,
                minimumQuantity,
                appliedCategories
            } = req.body;

            // Kiểm tra mã đã tồn tại chưa
            const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
            if (existingCoupon) {
                return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
            }

            // Tạo ID mới cho coupon
            const lastCoupon = await Coupon.findOne().sort({ couponID: -1 });
            const couponID = lastCoupon ? lastCoupon.couponID + 1 : 1;

            const coupon = new Coupon({
                couponID,
                code: code.toUpperCase(),
                description,
                discountType,
                discountValue,
                minOrderValue,
                maxDiscountAmount,
                startDate,
                endDate,
                usageLimit,
                totalUsageLimit,
                usedCount: 0,
                isActive,
                couponType,
                minimumQuantity,
                appliedCategories
            });

            await coupon.save();

            res.status(201).json({
                message: 'Tạo mã giảm giá thành công',
                coupon
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi tạo mã giảm giá',
                error: error.message
            });
        }
    }

    //!ADMIN
    // ADMIN: Cập nhật mã giảm giá
    async updateCoupon(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Kiểm tra mã giảm giá tồn tại
            const coupon = await Coupon.findOne({ couponID: id });
            if (!coupon) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            // Nếu cập nhật code, kiểm tra code mới đã tồn tại chưa
            if (updateData.code && updateData.code !== coupon.code) {
                const existingCoupon = await Coupon.findOne({ 
                    code: updateData.code.toUpperCase(),
                    couponID: { $ne: id }
                });
                if (existingCoupon) {
                    return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
                }
            }

            // Cập nhật thông tin
            Object.assign(coupon, updateData);
            await coupon.save();

            res.json({
                message: 'Cập nhật mã giảm giá thành công'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật mã giảm giá',
                error: error.message
            });
        }
    }

    //!ADMIN
    // ADMIN: Xóa mã giảm giá
    async deleteCoupon(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra mã giảm giá tồn tại
            const coupon = await Coupon.findOne({ couponID: id });
            if (!coupon) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            // Xóa tất cả UserCoupon liên quan và Coupon
            await Promise.all([
                UserCoupon.deleteMany({ couponID: id }),
                coupon.deleteOne()
            ]);

            res.json({ message: 'Xóa mã giảm giá thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa mã giảm giá',
                error: error.message
            });
        }
    }

    //!ADMIN
    // ADMIN: Bật/tắt trạng thái mã giảm giá
    async toggleCouponStatus(req, res) {
        try {
            const { id } = req.params;
            // Lấy trạng thái hiện tại của coupon
            const coupon = await Coupon.findOne({ couponID: id });
            if (!coupon) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            // Đảo ngược trạng thái isActive
            coupon.isActive = !coupon.isActive;
            await coupon.save();

            res.json({
                message: coupon.isActive ? 'Đã kích hoạt mã giảm giá' : 'Đã vô hiệu hóa mã giảm giá',
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thay đổi trạng thái mã giảm giá',
                error: error.message
            });
        }
    }
}

module.exports = new CouponController();
