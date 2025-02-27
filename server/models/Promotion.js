const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    // ID của promotion
    promotionID: {
        type: String,
        required: true,
        unique: true
    },
    // Loại promotion (normal/flash-sale)
    type: {
        type: String,
        enum: ['normal', 'flash-sale'],
        default: 'normal'
    },
    // Tên của promotion
    name: {
        type: String,
        required: true
    },
    // Mô tả promotion
    description: {
        type: String,
        required: true
    },
    // Phần trăm giảm giá (%)
    discountPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    // Ngày bắt đầu
    startDate: {
        type: Date,
        required: true
    },
    // Ngày kết thúc
    endDate: {
        type: Date,
        required: true
    },
    // Trạng thái của promotion (active/inactive)
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    // Danh sách sản phẩm được áp dụng
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // Danh mục sản phẩm được áp dụng
    categories: [{
        type: String
    }],
    // Người tạo promotion
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Middleware để tự động cập nhật trạng thái khi hết hạn
promotionSchema.pre('save', function(next) {
    const now = new Date();
    if (this.endDate < now && this.status === 'active') {
        this.status = 'inactive';
    }
    next();
});

// Tạo index cho các trường thường xuyên tìm kiếm
promotionSchema.index({ promotionID: 1, status: 1, type: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion; 