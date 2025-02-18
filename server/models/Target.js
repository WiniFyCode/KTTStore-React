const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Target
const targetSchema = new Schema({
    targetID: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        enum: {
            values: ['Nam', 'Nữ'], // Chỉ chấp nhận các giá trị Nam hoặc Nữ
            message: 'Giới tính phải là Nam hoặc Nữ'
        },
        trim: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
targetSchema.index({ name: 1 });

// Virtual field để lấy danh sách sản phẩm của target
targetSchema.virtual('products', {
    ref: 'Product',        // Model tham chiếu
    localField: 'targetID', // Thuộc tính của model hiện tại
    foreignField: 'targetID', // Thuộc tính của model tham chiếu
    justOne: false        // Lấy tất cả kết quả
});

// Static method để lấy số lượng sản phẩm theo target
targetSchema.statics.getProductCount = async function() {
    const Product = mongoose.model('Product');
    const result = await Product.aggregate([
        { $match: { isActivated: true } }, // Chỉ đếm sản phẩm đang hoạt động
        {
            $group: {
                _id: '$targetID',
                count: { $sum: 1 }
            }
        }
    ]);

    // Chuyển đổi kết quả thành object với key là targetID
    const counts = {};
    result.forEach(item => {
        counts[item._id] = item.count;
    });

    return counts;
};

// Tạo model từ schema
const Target = mongoose.model('Target', targetSchema, 'targets');

module.exports = Target;