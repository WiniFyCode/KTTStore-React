const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Category
const categorySchema = new Schema({
    categoryID: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageURL: {
        type: String,
        default: 'default.png'
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
categorySchema.index({ name: 1 });

// Tạo model từ schema
const Category = mongoose.model('Category', categorySchema, 'categories');

module.exports = Category;
