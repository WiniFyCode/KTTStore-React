const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Cart
const cartSchema = new Schema({
    cartID: {
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
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
cartSchema.index({ userID: 1 });
cartSchema.index({ SKU: 1 });
cartSchema.index({ userID: 1, SKU: 1 }, { unique: true }); // Mỗi user chỉ có 1 sản phẩm với SKU cụ thể trong giỏ

// Middleware để kiểm tra số lượng tồn kho trước khi thêm vào giỏ
cartSchema.pre('save', async function(next) {
    try {
        const ProductSizeStock = mongoose.model('ProductSizeStock');
        const stockItem = await ProductSizeStock.findOne({ SKU: this.SKU });
        
        if (!stockItem) {
            throw new Error('Sản phẩm không tồn tại');
        }

        if (stockItem.stock < this.quantity) {
            throw new Error('Số lượng sản phẩm trong kho không đủ');
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Tạo model từ schema
const Cart = mongoose.model('Cart', cartSchema, 'carts');

module.exports = Cart;
