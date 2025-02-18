const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho ProductColor
const productColorSchema = new Schema({
    colorID: {
        type: Number,
        required: true,
        unique: true
    },
    productID: {
        type: Number,
        required: true,
        ref: 'Product' // Reference đến model Product
    },
    colorName: {
        type: String,
        required: true,
        trim: true
    },
    images: {
        type: [String], // Mảng các đường dẫn hình ảnh
        default: ['default.png'],
        validate: {
            validator: function(array) {
                // Kiểm tra mảng không rỗng và không có phần tử rỗng
                return array.length > 0 && array.every(item => item && item.trim().length > 0);
            },
            message: 'Phải có ít nhất một hình ảnh và không được chứa đường dẫn rỗng'
        }
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
productColorSchema.index({ productID: 1 });
productColorSchema.index({ colorName: 1 });
productColorSchema.index({ productID: 1, colorName: 1 }, { unique: true }); // Mỗi sản phẩm không thể có 2 màu trùng tên

// Middleware để kiểm tra sản phẩm tồn tại trước khi thêm màu
productColorSchema.pre('save', async function(next) {
    try {
        const Product = mongoose.model('Product');
        const product = await Product.findOne({ productID: this.productID });
        
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Virtual field để lấy thông tin sản phẩm
// Xem thêm tại: https://mongoosejs.com/docs/populate.html#populate_virtually
productColorSchema.virtual('productInfo', {
    ref: 'Product',         // Model tham chiếu
    localField: 'productID', // Thuộc tính của model hiện tại
    foreignField: 'productID', // Thuộc tính của model tham chiếu
    justOne: true           // Chỉ lấy 1 kết quả
});

// Tạo model từ schema
const ProductColor = mongoose.model('ProductColor', productColorSchema, 'product_colors');

module.exports = ProductColor;
