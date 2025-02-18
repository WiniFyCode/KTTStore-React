const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho Review
const reviewSchema = new Schema({
    reviewID: {
        type: Number,
        required: true,
        unique: true
    },
    userID: {
        type: Number,
        required: true,
        ref: 'User' // Reference đến model User
    },
    productID: {
        type: Number,
        required: true,
        ref: 'Product' // Reference đến model Product
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Đánh giá phải từ 1 đến 5 sao'],
        max: [5, 'Đánh giá phải từ 1 đến 5 sao']
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'Nội dung đánh giá phải có ít nhất 10 ký tự'],
        maxlength: [1000, 'Nội dung đánh giá không được vượt quá 1000 ký tự']
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Thêm index cho các trường thường được tìm kiếm
reviewSchema.index({ userID: 1 });
reviewSchema.index({ productID: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 }); // Index giảm dần theo thời gian tạo
reviewSchema.index({ userID: 1, productID: 1 }, { unique: true }); // Mỗi user chỉ được đánh giá 1 sản phẩm một lần


// Virtual field để lấy thông tin user
reviewSchema.virtual('userInfo', {
    ref: 'User',          // Model tham chiếu
    localField: 'userID', // Thuộc tính của model hiện tại
    foreignField: 'userID', // Thuộc tính của model tham chiếu
    justOne: true        // Chỉ lấy 1 kết quả
});

// Virtual field để lấy thông tin product
reviewSchema.virtual('productInfo', {
    ref: 'Product',        // Model tham chiếu
    localField: 'productID', // Thuộc tính của model hiện tại
    foreignField: 'productID', // Thuộc tính của model tham chiếu
    justOne: true         // Chỉ lấy 1 kết quả
});

// Static method để tính rating trung bình của sản phẩm
reviewSchema.statics.calculateAverageRating = async function(productID) {
    const result = await this.aggregate([
        { $match: { productID: productID } },
        {
            $group: {
                _id: '$productID',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    return result.length > 0 ? {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
        totalReviews: result[0].totalReviews
    } : {
        averageRating: 0,
        totalReviews: 0
    };
};

// Tạo model từ schema
const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;
