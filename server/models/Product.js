const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Product
const productSchema = new Schema({
    productID: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Tên sản phẩm phải có ít nhất 3 ký tự'],
        maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự']
    },
    targetID: {
        type: Number,
        required: true,
        ref: 'Target' // Reference đến model Target
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'Mô tả sản phẩm phải có ít nhất 10 ký tự']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Giá sản phẩm không được âm'],
        get: function (value) {
            // Định dạng giá tiền với dấu phẩy ngăn cách hàng nghìn
            return value.toLocaleString('vi-VN');
        }
    },
    categoryID: {
        type: Number,
        required: true,
        ref: 'Category' // Reference đến model Category
    },
    thumbnail: {
        type: String,
        default: 'default.png',
        validate: {
            validator: function (value) {
                // Kiểm tra URL hình ảnh hoặc đuôi file hợp lệ
                return (
                    // Kiểm tra nếu là URL
                    /^https?:\/\/.+/.test(value) ||
                    // Hoặc kiểm tra đuôi file
                    /\.(webp|jpg|jpeg|png|gif)$/i.test(value)
                );
            },
            message: 'Định dạng hình ảnh không hợp lệ hoặc URL không hợp lệ'
        }
    },
    isActivated: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    toJSON: { getters: true } // Cho phép sử dụng getter khi chuyển đổi sang JSON
});

// Thêm index cho các trường thường được tìm kiếm
productSchema.index({ name: 'text' }); // Index fulltext cho tìm kiếm theo tên
productSchema.index({ targetID: 1 });
productSchema.index({ categoryID: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActivated: 1 });

// Middleware để kiểm tra target và category tồn tại
productSchema.pre('save', async function (next) {
    try {
        const Target = mongoose.model('Target');
        const Category = mongoose.model('Category');

        const [target, category] = await Promise.all([
            Target.findOne({ targetID: this.targetID }),
            Category.findOne({ categoryID: this.categoryID })
        ]);

        if (!target) {
            throw new Error('Target không tồn tại');
        }

        if (!category) {
            throw new Error('Category không tồn tại');
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Virtual field để lấy thông tin target
productSchema.virtual('targetInfo', {
    ref: 'Target',         // Model tham chiếu
    localField: 'targetID', // Thuộc tính của model hiện tại
    foreignField: 'targetID', // Thuộc tính của model tham chiếu
    justOne: true          // Chỉ lấy 1 kết quả
});

// Virtual field để lấy thông tin category
productSchema.virtual('categoryInfo', {
    ref: 'Category',       // Model tham chiếu
    localField: 'categoryID', // Thuộc tính của model hiện tại
    foreignField: 'categoryID', // Thuộc tính của model tham chiếu
    justOne: true         // Chỉ lấy 1 kết quả
});

// Virtual field để lấy danh sách màu sắc
productSchema.virtual('colors', {
    ref: 'ProductColor',   // Model tham chiếu
    localField: 'productID', // Thuộc tính của model hiện tại
    foreignField: 'productID', // Thuộc tính của model tham chiếu
    justOne: false        // Lấy tất cả kết quả
});

// Tạo model từ schema
const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;
