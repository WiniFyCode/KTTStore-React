const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Coupon
const couponSchema = new Schema({
    couponID: {
        type: Number,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true // Tự động chuyển thành chữ hoa
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'], // Giảm theo % hoặc số tiền cố định
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function (value) {
                // Nếu là phần trăm, giá trị không được vượt quá 100
                return this.discountType !== 'percentage' || value <= 100;
            },
            message: 'Giá trị phần trăm giảm giá không được vượt quá 100%'
        }
    },
    minOrderValue: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    maxDiscountAmount: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return !this.endDate || value <= this.endDate;
            },
            message: 'Ngày bắt đầu phải trước ngày kết thúc'
        }
    },
    endDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        required: true,
        min: 1, // Số lần sử dụng tối đa cho mỗi user
        default: 1
    },
    totalUsageLimit: {
        type: Number,
        required: true,
        min: 1 // Tổng số lần sử dụng tối đa của mã
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: function (value) {
                // Kiểm tra số lần sử dụng không vượt quá giới hạn
                if (value > this.totalUsageLimit) {
                    return false;
                }
                // Nếu số lần sử dụng bằng giới hạn, tự động set isActive = false
                if (value === this.totalUsageLimit) {
                    this.isActive = false;
                }
                return true;
            },
            message: 'Số lần sử dụng không thể vượt quá giới hạn'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    couponType: {
        type: String,
        required: true,
        enum: [
            'weekend',
            'member', 
            'holiday',
            'seasonal',
            'bundle',
            'new_user',
            'flash_sale',
            'special_event',
            'category',
            'clearance'
        ],
        default: 'general'
    },
    minimumQuantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    appliedCategories: {
        type: [Number], // Mảng các categoryID được áp dụng
        default: []
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

// Virtual field để kiểm tra trạng thái hiệu lực
couponSchema.virtual('isValid').get(function () {
    const now = new Date();
    return this.isActive &&
        this.usedCount < this.totalUsageLimit &&
        now >= this.startDate &&
        now <= this.endDate;
});

// Tạo model từ schema
const Coupon = mongoose.model('Coupon', couponSchema, 'coupons');

module.exports = Coupon;
