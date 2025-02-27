const Promotion = require('../models/Promotion');
const Product = require('../models/Product');

class PromotionController {
    // Helper function để lấy ID tiếp theo

    // Helper function để cập nhật trạng thái các promotion hết hạn
    static async updateExpiredPromotions() {
        const currentDate = new Date();
        try {
            await Promotion.updateMany(
                {
                    status: 'active',
                    endDate: { $lt: currentDate }
                },
                {
                    $set: { status: 'inactive' }
                }
            );
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái promotion hết hạn:', error);
        }
    }

    // Lấy promotion áp dụng cho một sản phẩm
    async getPromotionsForProduct(req, res) {
        try {
            // Cập nhật trạng thái các promotion hết hạn
            await PromotionController.updateExpiredPromotions();

            const { productId } = req.params;
            const currentDate = new Date();

            const promotions = await Promotion.find({
                status: 'active',
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
                $or: [
                    { products: productId },
                    {
                        categories: {
                            $in: await Product.findById(productId).select('category').then(product => product.category)
                        }
                    }
                ]
            });

            return res.status(200).json({
                success: true,
                data: promotions
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // Lấy chi tiết một promotion
    async getPromotionById(req, res) {
        try {
            const { promotionID } = req.params;

            const promotion = await Promotion.findOne({ promotionID })
                .populate('products', 'productID name price')
                .populate('createdBy', 'userID fullName');

            if (!promotion) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy promotion'
                });
            }

            return res.status(200).json({
                success: true,
                data: promotion
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    static async getNextPromotionID() {
        try {
            const lastPromotion = await Promotion.findOne({}, { promotionID: 1 })
                .sort({ promotionID: -1 });

            if (!lastPromotion) {
                return "1"; // Bắt đầu từ 1 nếu chưa có promotion nào
            }

            // Tăng số lên 1
            const nextID = parseInt(lastPromotion.promotionID) + 1;
            return nextID.toString();
        } catch (error) {
            console.error('Lỗi khi nhận được ID khuyến mãi tiếp theo:', error);
            throw error;
        }
    }

    // Helper function để kiểm tra khung giờ Flash Sale
    static isInFlashSaleTimeRange() {
        const now = new Date();
        const currentHour = now.getHours();
        return (currentHour >= 12 && currentHour < 14) ||
            (currentHour >= 20 && currentHour < 22);
    }

    //!ADMIN - Tạo promotion
    async createPromotion(req, res) {
        try {
            console.log('Tạo promotion với dữ liệu:', req.body);
            const {
                name,
                description,
                discountPercent,
                startDate,
                endDate,
                status,
                products,
                categories,
                type = 'normal' // Mặc định là normal
            } = req.body;

            // Validate required fields
            if (!name || !description || !discountPercent || !startDate || !endDate) {
                console.error('Thiếu thông tin bắt buộc');
                return res.status(400).json({
                    message: 'Thiếu thông tin bắt buộc'
                });
            }

            // Kiểm tra ngày bắt đầu và kết thúc
            if (new Date(startDate) >= new Date(endDate)) {
                console.error('Ngày không hợp lệ:', { startDate, endDate });
                return res.status(400).json({
                    message: 'Ngày kết thúc phải sau ngày bắt đầu'
                });
            }

            // Lấy ID tiếp theo
            console.log('Lấy ID khuyến mãi tiếp theo...');
            const nextID = await PromotionController.getNextPromotionID();
            console.log('ID khuyến mãi tiếp theo:', nextID);

            // Tạo promotion mới
            const promotion = new Promotion({
                promotionID: nextID,
                name,
                description,
                discountPercent,
                startDate,
                endDate,
                status: status || 'active',
                products: products || [],
                categories: categories || [],
                type,
                createdBy: req.user._id
            });

            console.log('Lưu promotion:', promotion);
            await promotion.save();
            console.log('Lưu promotion thành công');

            return res.status(201).json({
                message: 'Tạo promotion thành công',
                promotions: promotion
            });
        } catch (error) {
            console.error('Lỗi khi tạo promotion:', error);
            return res.status(500).json({
                message: 'Lỗi server',
                error: error.message,
                stack: error.stack
            });
        }
    }

    //! ADMIN - Lấy tất cả promotion và thống kê
    async getAllPromotions(req, res) {
        try {
            // Cập nhật trạng thái các promotion hết hạn
            await PromotionController.updateExpiredPromotions();
            
            const currentDate = new Date();
            
            // Lấy tất cả promotions
            const promotions = await Promotion.find()
                .populate('products', 'productID name price')
                .populate('createdBy', 'userID fullName email');

            // Tính toán thống kê
            const stats = {
                totalPromotions: promotions.length,
                activePromotions: promotions.filter(promo => 
                    promo.status === 'active' && 
                    new Date(promo.startDate) <= currentDate && 
                    new Date(promo.endDate) >= currentDate
                ).length,
                upcomingPromotions: promotions.filter(promo =>
                    promo.status === 'active' && 
                    new Date(promo.startDate) > currentDate
                ).length,
                endedPromotions: promotions.filter(promo =>
                    new Date(promo.endDate) < currentDate || promo.status === 'inactive'
                ).length
            };

            return res.status(200).json({
                promotions: promotions,
                stats,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    //! ADMIN - Cập nhật promotion
    async updatePromotion(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Kiểm tra ngày nếu có cập nhật
            if (updateData.startDate && updateData.endDate) {
                if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
                    return res.status(400).json({
                        message: 'Ngày kết thúc phải sau ngày bắt đầu'
                    });
                }
            }

            const promotion = await Promotion.findOneAndUpdate(
                { promotionID: id },
                updateData,
                { new: true }
            );

            if (!promotion) {
                return res.status(404).json({
                    message: 'Không tìm thấy promotion'
                });
            }

            return res.status(200).json({
                message: 'Cập nhật promotion thành công'
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    //! ADMIN - Xóa promotion
    async deletePromotion(req, res) {
        try {
            const { id } = req.params;

            const promotion = await Promotion.findOneAndDelete({ promotionID: id });

            if (!promotion) {
                return res.status(404).json({
                    message: 'Không tìm thấy promotion'
                });
            }

            return res.status(200).json({
                message: 'Xóa promotion thành công'
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    //! ADMIN
    // Lấy các promotion đang active
    async getActivePromotions(req, res) {
        try {
            // Cập nhật trạng thái các promotion hết hạn
            await PromotionController.updateExpiredPromotions();

            const currentDate = new Date();

            const activePromotions = await Promotion.find({
                status: 'active',
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate }
            })
                .populate('products', 'productID name price')
                .populate('createdBy', 'userID fullName email');

            return res.status(200).json({
                success: true,
                data: activePromotions
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    //! ADMIN
    // Thêm hàm xử lý toggle status
    async toggleStatus(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra promotion có tồn tại không
            const promotion = await Promotion.findOne({ promotionID: id });
            if (!promotion) {
                return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
            }

            // Tự động chuyển đổi trạng thái
            promotion.status = promotion.status === 'active' ? 'inactive' : 'active';
            await promotion.save();

            res.status(200).json({ 
                message: `Đã ${promotion.status === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} khuyến mãi`,
            });
        } catch (error) {
            console.error('Lỗi khi chuyển đổi trạng thái promotion:', error);
            res.status(500).json({ 
                message: 'Lỗi khi cập nhật trạng thái khuyến mãi',
                error: error.message 
            });
        }
    };
}

module.exports = new PromotionController(); 