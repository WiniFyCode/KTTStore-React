const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho UserNotification
const userNotificationSchema = new Schema({
    userNotificationID: {
        type: Number,
        required: true,
        unique: true
    },
    notificationID: {
        type: Number,
        required: true,
        ref: 'Notification' // Reference đến model Notification
    },
    userID: {
        type: Number,
        required: true,
        ref: 'User' // Reference đến model User
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null,
        validate: {
            validator: function(value) {
                // readAt chỉ được set khi isRead là true
                return !value || this.isRead;
            },
            message: 'readAt chỉ được set khi thông báo đã được đọc'
        }
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
userNotificationSchema.index({ userID: 1, notificationID: 1 }, { unique: true }); // Mỗi user chỉ có 1 bản ghi cho mỗi thông báo
userNotificationSchema.index({ userID: 1, isRead: 1 }); // Tìm kiếm thông báo chưa đọc của user
userNotificationSchema.index({ readAt: 1 });

// Virtual field để lấy thông tin thông báo
userNotificationSchema.virtual('notificationInfo', {
    ref: 'Notification',    // Model tham chiếu
    localField: 'notificationID', // Thuộc tính của model hiện tại
    foreignField: 'notificationID', // Thuộc tính của model tham chiếu
    justOne: true          // Chỉ lấy 1 kết quả
});

// Virtual field để lấy thông tin người dùng
userNotificationSchema.virtual('userInfo', {
    ref: 'User',          // Model tham chiếu
    localField: 'userID', // Thuộc tính của model hiện tại
    foreignField: 'userID', // Thuộc tính của model tham chiếu
    justOne: true        // Chỉ lấy 1 kết quả
});

// Static method để lấy số lượng thông báo chưa đọc của user
userNotificationSchema.statics.getUnreadCount = async function(userID) {
    return this.countDocuments({ userID, isRead: false });
};

// Tạo model từ schema
const UserNotification = mongoose.model('UserNotification', userNotificationSchema, 'user_notifications');

module.exports = UserNotification;
