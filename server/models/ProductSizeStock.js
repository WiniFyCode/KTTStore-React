const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho ProductSizeStock
const productSizeStockSchema = new Schema({
    sizeStockID: {
        type: Number,
        required: true,
        unique: true
    },
    SKU: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                // Kiểm tra định dạng SKU: productID_colorID_size_sizeStockID
                return /^\d+_\d+_[A-Z]+_\d+$/.test(v);
            },
            message: `SKU không đúng định dạng (productID_colorID_size_sizeStockID)`
        }
    },
    colorID: {
        type: Number,
        required: true,
        ref: 'ProductColor' // Reference đến model ProductColor
    },
    size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL', 'XXL'] // Thêm các size khác nếu cần
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Số lượng không được âm']
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
productSizeStockSchema.index({ colorID: 1 });
productSizeStockSchema.index({ size: 1 });
productSizeStockSchema.index({ stock: 1 });
productSizeStockSchema.index({ colorID: 1, size: 1 }, { unique: true }); // Mỗi màu không thể có 2 size trùng nhau

// Middleware để kiểm tra màu sắc tồn tại trước khi thêm size và stock
productSizeStockSchema.pre('save', async function(next) {
    try {
        const ProductColor = mongoose.model('ProductColor');
        const color = await ProductColor.findOne({ colorID: this.colorID });
        
        if (!color) {
            throw new Error('Màu sắc không tồn tại');
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Virtual field để lấy thông tin màu sắc
// Xem thêm tại: https://mongoosejs.com/docs/populate.html#populate_virtually
productSizeStockSchema.virtual('colorInfo', {
    ref: 'ProductColor',    // Model tham chiếu
    localField: 'colorID',  // Thuộc tính của model hiện tại
    foreignField: 'colorID', // Thuộc tính của model tham chiếu
    justOne: true          // Chỉ lấy 1 kết quả
});

// Method để kiểm tra và cập nhật số lượng tồn kho
productSizeStockSchema.methods.updateStock = async function(quantity) {
    if (this.stock + quantity < 0) {
        throw new Error('Số lượng tồn kho không đủ');
    }
    this.stock += quantity;
    return this.save();
};

// Tạo model từ schema
const ProductSizeStock = mongoose.model('ProductSizeStock', productSizeStockSchema, 'product_sizes_stocks');

module.exports = ProductSizeStock;
