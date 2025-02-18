const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Address
const addressSchema = new Schema({
    addressID: {
        type: Number,
        required: true,
        unique: true
    },
    userID: {
        type: Number,
        required: true,
        ref: 'User' // Reference đến model User
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
addressSchema.index({ userID: 1 });
addressSchema.index({ isDefault: 1 });
addressSchema.index({ isDelete: 1 });

// Middleware để đảm bảo chỉ có một địa chỉ mặc định cho mỗi user
addressSchema.pre('save', async function(next) {
    if (this.isDefault) {
        // Nếu đang set địa chỉ này là mặc định, hủy mặc định của các địa chỉ khác
        await this.constructor.updateMany(
            { 
                userID: this.userID, 
                _id: { $ne: this._id },
                isDelete: false 
            },
            { isDefault: false }
        );
    }
    next();
});

// Tạo model từ schema
const Address = mongoose.model('Address', addressSchema, 'addresses');

module.exports = Address;
