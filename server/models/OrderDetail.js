const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho OrderDetail
const orderDetailSchema = new Schema({
    orderDetailID: {
        type: Number,
        required: true,
        unique: true
    },
    orderID: {
        type: Number,
        required: true,
        ref: 'Order' // Reference đến model Order
    },
    SKU: {
        type: String,
        required: true,
        ref: 'ProductSizeStock' // Reference đến model ProductSizeStock
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
orderDetailSchema.index({ orderID: 1 });
orderDetailSchema.index({ SKU: 1 });

// Middleware để kiểm tra và cập nhật số lượng tồn kho
orderDetailSchema.pre('save', async function(next) {
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

// Middleware để hoàn lại số lượng tồn kho khi xóa chi tiết đơn hàng
orderDetailSchema.pre('remove', async function(next) {
    try {
        const ProductSizeStock = mongoose.model('ProductSizeStock');
        
        // Hoàn lại số lượng tồn kho
        await ProductSizeStock.updateOne(
            { SKU: this.SKU },
            { $inc: { stock: this.quantity } }
        );

        next();
    } catch (error) {
        next(error);
    }
});

// Virtual field để lấy thông tin sản phẩm
// Xem thêm tại: https://mongoosejs.com/docs/populate.html#populate_virtually
orderDetailSchema.virtual('productInfo', {
    ref: 'ProductSizeStock', // Model tham chiếu
    localField: 'SKU', // Thuộc tính của model hiện tại
    foreignField: 'SKU', // Thuộc tính của model tham chiếu
    justOne: true // Chỉ lấy 1 kết quả
});

// Tạo model từ schema
const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema, 'order_details');

module.exports = OrderDetail;
