const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Favorite
const favoriteSchema = new Schema({
    favoriteID: {
        type: Number,
        required: true,
        unique: true
    },
    userID: {
        type: Number,
        required: true,
        ref: 'User' // Reference đến model User
    },
    SKU: {
        type: String,
        required: true,
        ref: 'ProductSizeStock' // Reference đến model ProductSizeStock
    },
    note: {
        type: String,
        trim: true,
        default: ''
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
favoriteSchema.index({ userID: 1 });
favoriteSchema.index({ SKU: 1 });
favoriteSchema.index({ userID: 1, SKU: 1 }, { unique: true }); // Mỗi user chỉ có thể thêm 1 SKU vào yêu thích một lần
favoriteSchema.index({ addedAt: -1 }); // Index giảm dần theo thời gian thêm

// Middleware để kiểm tra sản phẩm tồn tại trước khi thêm vào yêu thích
favoriteSchema.pre('save', async function(next) {
    try {
        const ProductSizeStock = mongoose.model('ProductSizeStock');
        const stockItem = await ProductSizeStock.findOne({ SKU: this.SKU });
        
        if (!stockItem) {
            throw new Error('Sản phẩm không tồn tại');
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Tạo model từ schema
const Favorite = mongoose.model('Favorite', favoriteSchema, 'favorites');

module.exports = Favorite;
