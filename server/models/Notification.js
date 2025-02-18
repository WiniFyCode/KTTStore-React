const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Notification
const notificationSchema = new Schema({
    notificationID: {
        type: Number,
        required: true,
        unique: true,
        index: true // Thêm index trực tiếp vào field
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'welcome',        // Chào mừng
            'promotion',     // Khuyến mãi
            'system',        // Thông báo hệ thống
            'new_collection', // Sản phẩm mới
            'membership',    // Thông báo về membership
            'policy',        // Chính sách
            'survey',        // Thông báo về khảo sát
            'security',      // Thông báo về security
            'holiday',        // Ngày lễ
        ],
        default: 'system'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    readCount: {
        type: Number,
        default: 0,
        min: 0
    },
    scheduledFor: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                // Thời gian gửi phải sau thời gian tạo
                return !this.createdAt || value >= this.createdAt;
            },
            message: 'Thời gian gửi phải sau thời gian tạo thông báo'
        }
    },
    expiresAt: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                // Thời gian hết hạn phải sau thời gian gửi
                return value > this.scheduledFor;
            },
            message: 'Thời gian hết hạn phải sau thời gian gửi thông báo'
        }
    },
    createdBy: {
        type: String,
        required: true,
        ref: 'User' // Reference đến model User (Admin)
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ createdBy: 1 });

// Virtual field để kiểm tra trạng thái hiệu lực
notificationSchema.virtual('isActive').get(function() {
    const now = new Date();
    return now >= this.scheduledFor && now <= this.expiresAt;
});

// Virtual field để kiểm tra trạng thái đã hết hạn
notificationSchema.virtual('isExpired').get(function() {
    return new Date() > this.expiresAt;
});

// Virtual field để kiểm tra trạng thái chưa gửi
notificationSchema.virtual('isPending').get(function() {
    return new Date() < this.scheduledFor;
});

// Tạo model từ schema
const Notification = mongoose.model('Notification', notificationSchema, 'notifications');

module.exports = Notification;
