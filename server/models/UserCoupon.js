const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho lịch sử sử dụng mã giảm giá
const usageHistorySchema = new Schema({
    orderID: {
        type: Number,
        required: true,
        ref: 'Order' // Reference đến model Order
    },
    usedAt: {
        type: Date,
        default: Date.now
    },
    discountAmount: {
        type: Number,
        required: true,
        min: [0, 'Số tiền giảm giá không được âm']
    }
}, { _id: false }); // Không tạo _id cho subdocument

// Định nghĩa schema cho UserCoupon
const userCouponSchema = new Schema({
    userCouponsID: {
        type: Number,
        required: true,
        unique: true
    },
    couponID: {
        type: Number,
        required: true,
        ref: 'Coupon' // Reference đến model Coupon
    },
    userID: {
        type: Number,
        required: true,
        ref: 'User' // Reference đến model User
    },
    usageLeft: {
        type: Number,
        required: true,
        min: [0, 'Số lần sử dụng còn lại không được âm'],
        default: 1,
        validate: {
            validator: function(value) {
                return Number.isInteger(value);
            },
            message: 'Số lần sử dụng phải là số nguyên'
        }
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'used', 'expired', 'cancelled'],
            message: 'Trạng thái không hợp lệ'
        },
        default: 'active'
    },
    usageHistory: [usageHistorySchema], // Mảng các lần sử dụng mã giảm giá
    expiryDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Ngày hết hạn phải sau ngày hiện tại'
        }
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Virtual field để lấy thông tin chi tiết của coupon
userCouponSchema.virtual('couponInfo', {
    ref: 'Coupon',
    localField: 'couponID',
    foreignField: 'couponID',
    justOne: true
});

// Virtual field để lấy thông tin chi tiết của order từ usageHistory
userCouponSchema.virtual('usageHistory.orderInfo', {
    ref: 'Order',
    localField: 'usageHistory.orderID',
    foreignField: 'orderID',
    justOne: true
});

// Đảm bảo virtual fields được hiển thị khi chuyển đổi sang JSON
userCouponSchema.set('toJSON', { virtuals: true });
userCouponSchema.set('toObject', { virtuals: true });

// Thêm index cho các trường thường được tìm kiếm
userCouponSchema.index({ userID: 1, couponID: 1 }, { unique: true }); // Mỗi user chỉ có thể có 1 mã giảm giá một lần
userCouponSchema.index({ status: 1 });
userCouponSchema.index({ expiryDate: 1 });
userCouponSchema.index({ isExpired: 1 });
userCouponSchema.index({ 'usageHistory.orderID': 1 });

// Middleware để kiểm tra user và coupon tồn tại
userCouponSchema.pre('save', async function(next) {
    try {
        const User = mongoose.model('User');
        const Coupon = mongoose.model('Coupon');

        const [user, coupon] = await Promise.all([
            User.findOne({ userID: this.userID }),
            Coupon.findOne({ couponID: this.couponID })
        ]);

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        if (!coupon) {
            throw new Error('Mã giảm giá không tồn tại');
        }

        // Cập nhật trạng thái dựa trên số lần sử dụng và thời hạn
        if (this.usageLeft === 0) {
            this.status = 'used';
        } else if (this.expiryDate < new Date()) {
            this.status = 'expired';
            this.isExpired = true;
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Method để sử dụng mã giảm giá
userCouponSchema.methods.use = async function(orderID, discountAmount) {
    if (this.status !== 'active') {
        throw new Error('Mã giảm giá không còn hiệu lực');
    }

    if (this.usageLeft <= 0) {
        throw new Error('Mã giảm giá đã hết lượt sử dụng');
    }

    if (this.expiryDate < new Date()) {
        this.status = 'expired';
        this.isExpired = true;
        throw new Error('Mã giảm giá đã hết hạn');
    }

    // Thêm vào lịch sử sử dụng
    this.usageHistory.push({
        orderID,
        usedAt: new Date(),
        discountAmount
    });

    // Giảm số lần sử dụng còn lại
    this.usageLeft--;

    // Cập nhật trạng thái nếu hết lượt sử dụng
    if (this.usageLeft === 0) {
        this.status = 'used';
    }

    return this.save();
};

// Tạo model từ schema
const UserCoupon = mongoose.model('UserCoupon', userCouponSchema, 'user_coupons');

module.exports = UserCoupon;
