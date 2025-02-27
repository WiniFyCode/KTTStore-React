const UserCoupon = require('../models/UserCoupon');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { format } = require('date-fns');

class UserCouponController {
    // Lấy danh sách mã giảm giá của user
    async getUserCoupons(req, res) {
        try {
            const userID = req.user.userID;
            const { status, page = 1, limit = 10 } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Tạo filter dựa trên status nếu có
            const filter = { userID };
            if (status) {
                filter.status = status;
            }

            // Đếm tổng số mã giảm giá
            const total = await UserCoupon.countDocuments(filter);

            // Sử dụng aggregate để join với bảng Coupon và Categories
            const userCoupons = await UserCoupon.aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: 'coupons',
                        let: { couponID: '$couponID' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$couponID', '$$couponID'] }
                                }
                            }
                        ],
                        as: 'couponInfo'
                    }
                },
                { $unwind: { path: '$couponInfo', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'categories',
                        let: { appliedCategories: '$couponInfo.appliedCategories' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $cond: {
                                            if: { $isArray: '$$appliedCategories' },
                                            then: { $in: ['$categoryID', '$$appliedCategories'] },
                                            else: false
                                        }
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    categoryID: 1,
                                    name: 1
                                }
                            }
                        ],
                        as: 'couponInfo.appliedCategories'
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]);

            res.json({
                userCoupons,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách mã giảm giá',
                error: error.message
            });
        }
    }

    // Lấy chi tiết mã giảm giá của user
    async getUserCouponById(req, res) {
        try {
            const { id } = req.params;
            const userID = req.user.userID;

            // Sử dụng aggregate để join với bảng Coupon
            const [userCoupon] = await UserCoupon.aggregate([
                {
                    $match: {
                        userCouponsID: parseInt(id),
                        userID
                    }
                },
                {
                    $lookup: {
                        from: 'coupons',
                        let: { couponID: '$couponID' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$couponID', '$$couponID'] }
                                }
                            }
                        ],
                        as: 'couponInfo'
                    }
                },
                { $unwind: { path: '$couponInfo', preserveNullAndEmptyArrays: true } }
            ]);

            if (!userCoupon) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            res.json(userCoupon);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin mã giảm giá',
                error: error.message
            });
        }
    }

    // ADMIN: Thêm mã giảm giá cho user
    async addUserCoupon(req, res) {
        try {
            const { userID, couponID, usageLeft, expiryDate } = req.body;

            // Kiểm tra user và coupon tồn tại
            const [user, coupon] = await Promise.all([
                User.findOne({ userID }),
                Coupon.findOne({ couponID })
            ]);

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            if (!coupon) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            // Kiểm tra user đã có mã giảm giá này chưa
            const existingCoupon = await UserCoupon.findOne({ userID, couponID });
            if (existingCoupon) {
                return res.status(400).json({ message: 'Người dùng đã có mã giảm giá này' });
            }

            // Tạo ID mới cho user coupon
            const lastUserCoupon = await UserCoupon.findOne().sort({ userCouponsID: -1 });
            const userCouponsID = lastUserCoupon ? lastUserCoupon.userCouponsID + 1 : 1;

            const userCoupon = new UserCoupon({
                userCouponsID,
                userID,
                couponID,
                usageLeft: usageLeft || coupon.maxUsagePerUser,
                expiryDate: expiryDate || coupon.expiryDate
            });

            await userCoupon.save();

            res.status(201).json({
                message: 'Thêm mã giảm giá cho người dùng thành công',
                userCoupon
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thêm mã giảm giá',
                error: error.message
            });
        }
    }

    // ADMIN: Cập nhật mã giảm giá của user
    async updateUserCoupon(req, res) {
        try {
            const { id } = req.params;
            const { usageLeft, expiryDate, status } = req.body;

            const userCoupon = await UserCoupon.findOne({ userCouponsID: id });
            if (!userCoupon) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            // Cập nhật thông tin
            if (typeof usageLeft === 'number') userCoupon.usageLeft = usageLeft;
            if (expiryDate) userCoupon.expiryDate = expiryDate;
            if (status) userCoupon.status = status;

            await userCoupon.save();

            res.json({
                message: 'Cập nhật mã giảm giá thành công',
                userCoupon
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật mã giảm giá',
                error: error.message
            });
        }
    }

    // ADMIN: Hủy mã giảm giá của user
    async cancelUserCoupon(req, res) {
        try {
            const { id } = req.params;

            const userCoupon = await UserCoupon.findOne({ userCouponsID: id });
            if (!userCoupon) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            // Kiểm tra mã giảm giá đã được sử dụng chưa
            if (userCoupon.usageHistory.length > 0) {
                return res.status(400).json({
                    message: 'Không thể hủy mã giảm giá đã được sử dụng'
                });
            }

            userCoupon.status = 'cancelled';
            await userCoupon.save();

            res.json({
                message: 'Hủy mã giảm giá thành công',
                userCoupon
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi hủy mã giảm giá',
                error: error.message
            });
        }
    }

    // USER: Áp dụng mã giảm giá
    async applyCoupon(req, res) {
        try {
            const userID = req.user.userID;
            const { code, orderValue } = req.body;

            // Tìm mã giảm giá
            const coupon = await Coupon.findOne({
                code: code.toUpperCase(),
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gt: new Date() }
            });

            if (!coupon) {
                return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
            }

            // Kiểm tra thời gian hiệu lực
            const now = new Date();
            const startDate = new Date(coupon.startDate);
            const endDate = new Date(coupon.endDate);

            if (now < startDate) {
                return res.status(400).json({ 
                    message: `Mã giảm giá chưa đến thời gian sử dụng. Bắt đầu từ ${format(startDate, 'dd/MM/yyyy HH:mm')}` 
                });
            }

            if (now > endDate) {
                return res.status(400).json({ 
                    message: `Mã giảm giá đã hết hạn vào ${format(endDate, 'dd/MM/yyyy HH:mm')}` 
                });
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if (orderValue < coupon.minOrderValue) {
                return res.status(400).json({
                    message: `Đơn hàng phải từ ${coupon.minOrderValue.toLocaleString()}đ trở lên để sử dụng mã giảm giá này`
                });
            }

            // Kiểm tra số lần sử dụng tổng
            const totalUsage = await UserCoupon.countDocuments({ couponID: coupon.couponID });
            if (totalUsage >= coupon.maxUsageCount) {
                return res.status(400).json({ 
                    message: 'Mã giảm giá đã hết lượt sử dụng cho phép' 
                });
            }

            // Kiểm tra và cập nhật UserCoupon
            let userCoupon = await UserCoupon.findOne({
                couponID: coupon.couponID,
                userID
            });

            if (userCoupon) {
                // Kiểm tra hết hạn
                if (new Date() > new Date(userCoupon.expiryDate)) {
                    return res.status(400).json({ 
                        message: 'Mã giảm giá của bạn đã hết hạn sử dụng' 
                    });
                }

                // Kiểm tra số lượt còn lại
                if (userCoupon.usageLeft <= 0) {
                    return res.status(400).json({ 
                        message: 'Bạn đã sử dụng hết lượt của mã giảm giá này' 
                    });
                }

                // Cập nhật số lượt còn lại
                // userCoupon.usageLeft -= 1;
                await userCoupon.save();
            } else {
                // Tạo UserCoupon mới
                const lastUserCoupon = await UserCoupon.findOne().sort({ userCouponsID: -1 });
                const userCouponsID = lastUserCoupon ? lastUserCoupon.userCouponsID + 1 : 1;

                userCoupon = new UserCoupon({
                    userCouponsID,
                    couponID: coupon.couponID,
                    userID,
                    usageLeft: coupon.usageLimit,
                    expiryDate: coupon.endDate
                });
                await userCoupon.save();
            }

            // Tính số tiền giảm
            let discountAmount;
            if (coupon.discountType === 'percentage') {
                discountAmount = Math.min(
                    orderValue * (coupon.discountValue / 100),
                    coupon.maxDiscountAmount
                );
            } else {
                discountAmount = Math.min(
                    coupon.discountValue,
                    coupon.maxDiscountAmount
                );
            }

            // Thêm thông tin chi tiết trong response
            res.json({
                message: 'Áp dụng mã giảm giá thành công',
                coupon: {
                    ...coupon.toObject(),
                    discountAmount,
                    remainingUses: userCoupon.usageLeft,
                    expiryDate: userCoupon.expiryDate,
                    appliedValue: discountAmount.toLocaleString() + 'đ',
                    minOrderValue: coupon.minOrderValue.toLocaleString() + 'đ',
                    maxDiscountAmount: coupon.maxDiscountAmount.toLocaleString() + 'đ'
                },
                discountAmount,
                userCouponsID: userCoupon.userCouponsID,
                status: 'success',
                details: {
                    remainingUses: userCoupon.usageLeft,
                    expiryDate: format(new Date(userCoupon.expiryDate), 'dd/MM/yyyy HH:mm'),
                    discountType: coupon.discountType === 'percentage' ? 'Giảm theo phần trăm' : 'Giảm theo số tiền',
                    discountValue: coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}đ`
                }
            });

        } catch (error) {
            console.error('Lỗi khi áp dụng mã giảm giá:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi áp dụng mã giảm giá',
                error: error.message,
                status: 'error'
            });
        }
    }

    // USER: Lấy danh sách mã giảm giá có thể sử dụng
    async getAvailableCoupons(req, res) {
        try {
            const userID = req.user.userID;
            const { orderValue } = req.query;

            // Lấy các coupon thỏa mãn điều kiện:
            // - Đang active
            // - Trong thời gian hiệu lực
            // - Giá trị đơn hàng >= giá trị tối thiểu
            const coupons = await Coupon.find({
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gt: new Date() },
                minOrderValue: { $lte: orderValue || 0 }
            });

            // Kiểm tra thêm điều kiện cho từng coupon:
            // - Số lần sử dụng tổng chưa vượt quá giới hạn
            // - Số lần sử dụng của user chưa vượt quá giới hạn
            const availableCoupons = await Promise.all(coupons.map(async (coupon) => {
                const totalUsage = await UserCoupon.countDocuments({ couponID: coupon.couponID });
                if (totalUsage >= coupon.maxUsageCount) return null;

                const userUsage = await UserCoupon.countDocuments({
                    couponID: coupon.couponID,
                    userID
                });
                if (userUsage >= coupon.maxUsagePerUser) return null;

                return {
                    ...coupon.toJSON(),
                    usageLeft: coupon.maxUsagePerUser - userUsage
                };
            }));

            // Lọc bỏ các coupon không thỏa mãn điều kiện
            const validCoupons = availableCoupons.filter(coupon => coupon !== null);

            res.json(validCoupons);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách mã giảm giá',
                error: error.message
            });
        }
    }

    // ADMIN: Lấy danh sách mã giảm giá của tất cả user
    async getAllUserCoupons(req, res) {
        try {
            const { page = 1, limit = 10, status, userID } = req.query;

            // Tạo filter dựa trên status và userID nếu có
            const filter = {};
            if (status) filter.status = status;
            if (userID) filter.userID = userID;

            const userCoupons = await UserCoupon.find(filter)
                .populate('couponID')
                .populate('userID', 'fullname email phone')
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit);

            // Đếm tổng số mã giảm giá
            const total = await UserCoupon.countDocuments(filter);

            res.json({
                userCoupons,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách mã giảm giá',
                error: error.message
            });
        }
    }
}

module.exports = new UserCouponController();
