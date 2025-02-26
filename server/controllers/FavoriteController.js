const Favorite = require('../models/Favorite');
const ProductSizeStock = require('../models/ProductSizeStock');
const Product = require('../models/Product');
const ProductColor = require('../models/ProductColor');
const Promotion = require('../models/Promotion');
const { getImageLink } = require('../middlewares/ImagesCloudinary_Controller');

//TODO: Xử lý ảnh với Cloudinary + Xử lý promotion cho sản phẩm
class FavoriteController {
    // Lấy danh sách yêu thích của user
    async getFavorites(req, res) {
        try {
            const userID = req.user.userID;
            const { page = 1, limit = 10 } = req.query;

            // Lấy danh sách yêu thích với phân trang
            const favorites = await Favorite.find({ userID })
                .sort('-addedAt')
                .skip((page - 1) * limit)
                .limit(limit);

            // Lấy thông tin chi tiết sản phẩm
            const items = await Promise.all(favorites.map(async (fav) => {
                try {
                    // Tìm thông tin ProductSizeStock
                    const sizeStock = await ProductSizeStock.findOne({ SKU: fav.SKU });
                    if (!sizeStock) {
                        // console.warn(`Không tìm thấy thông tin size cho SKU: ${fav.SKU}`);
                        return null;
                    }

                    // Parse productID và colorID từ SKU
                    const [productID, colorID] = sizeStock.SKU.split('_');

                    // Lấy thông tin sản phẩm
                    const product = await Product.findOne(
                        { productID: parseInt(productID), isActivated: true },
                        'productID name price thumbnail targetInfo categoryInfo isActivated'
                    ).populate('targetInfo').populate('categoryInfo');

                    if (!product) {
                        // console.warn(`FavC - Không tìm thấy thông tin sản phẩm cho productID : ${productID}`);
                        return null;
                    }

                    // Lấy thông tin màu sắc
                    let color = await ProductColor.findOne({
                        colorID: parseInt(colorID),
                        productID: parseInt(productID)
                    });

                    if (!color) {
                        // console.warn(`FavC - Không tìm thấy thông tin màu sắc cho colorID: ${colorID}, productID: ${productID}`);
                        color = {
                            colorName: 'Mặc định',
                            images: []
                        };
                    }

                    // Tính giá
                    const price = product.price;
                    const priceNumber = Number(price.replace(/\./g, ''));

                    // Xử lý ảnh với cloudinary
                    const thumbnail = await getImageLink(product.thumbnail);
                    const colorImages = await Promise.all((color?.images || []).map(img => getImageLink(img)));

                    return {
                        favoriteID: fav.favoriteID,
                        SKU: sizeStock.SKU,
                        product: {
                            productID: product.productID,
                            name: product.name,
                            originalPrice: priceNumber,
                            price: priceNumber,
                            isActivated: product.isActivated,
                            thumbnail: colorImages[0] || thumbnail,
                            images: colorImages.length > 0 ? colorImages : [thumbnail]
                        },
                        size: sizeStock.size,
                        colorName: color?.colorName,
                        note: fav.note
                    };
                } catch (error) {
                    console.error(`Lỗi khi xử lý item ${fav.favoriteID}:`, error);
                    return null;
                }
            }));

            // Lọc bỏ các item null và undefined
            const validItems = items.filter(item => item !== null);

            // Đếm tổng số item yêu thích
            const total = await Favorite.countDocuments({ userID });

            res.json({
                items: validItems,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('Error in getFavorites:', error);
            res.status(500).json({
                error: error.message
            });
        }
    }

    // Thêm sản phẩm vào danh sách yêu thích
    async addToFavorites(req, res) {
        try {
            const userID = req.user.userID;
            const { SKU, note = '' } = req.body;

            // Kiểm tra sản phẩm tồn tại
            const stockItem = await ProductSizeStock.findOne({ SKU });
            if (!stockItem) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            // Kiểm tra sản phẩm đã có trong danh sách yêu thích chưa
            const existingFavorite = await Favorite.findOne({ userID, SKU });
            if (existingFavorite) {
                return res.status(400).json({ message: 'Sản phẩm đã có trong danh sách yêu thích' });
            }

            // Tạo ID mới cho favorite
            const lastFavorite = await Favorite.findOne().sort({ favoriteID: -1 });
            const favoriteID = lastFavorite ? lastFavorite.favoriteID + 1 : 1;

            // Thêm vào danh sách yêu thích
            const favorite = new Favorite({
                favoriteID,
                userID,
                SKU,
                note
            });

            await favorite.save();

            res.status(201).json({
                message: 'Thêm vào danh sách yêu thích thành công',
                favorite
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thêm vào danh sách yêu thích',
                error: error.message
            });
        }
    }

    // Cập nhật ghi chú cho sản phẩm yêu thích
    async updateFavorite(req, res) {
        try {
            const userID = req.user.userID;
            const { id } = req.params;
            const { note } = req.body;

            const favorite = await Favorite.findOne({ favoriteID: id, userID });
            if (!favorite) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong danh sách yêu thích' });
            }

            favorite.note = note;
            await favorite.save();

            res.json({
                message: 'Cập nhật ghi chú thành công',
                favorite
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật ghi chú',
                error: error.message
            });
        }
    }

    // Xóa sản phẩm khỏi danh sách yêu thích
    async removeFromFavorites(req, res) {
        try {
            const userID = req.user.userID;
            const { SKU } = req.params;
            
            console.log('Đang xử lý yêu cầu xóa khỏi danh sách yêu thích:');
            console.log('UserID:', userID);
            console.log('SKU:', SKU);

            const favorite = await Favorite.findOne({ SKU, userID });
            console.log('Kết quả tìm kiếm favorite:', favorite);
            
            if (!favorite) {
                console.log('Không tìm thấy sản phẩm yêu thích');
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong danh sách yêu thích' });
            }

            console.log('Bắt đầu xóa favorite với ID:', favorite.favoriteID);
            await favorite.deleteOne();
            console.log('Đã xóa favorite thành công');

            res.json({ message: 'Xóa khỏi danh sách yêu thích thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa khỏi danh sách yêu thích:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích',
                error: error.message
            });
        }
    }

    // Kiểm tra sản phẩm có trong danh sách yêu thích không
    async checkFavorite(req, res) {
        try {
            const userID = req.user.userID;
            const { SKU } = req.params;

            const favorite = await Favorite.findOne({ userID, SKU });
            console.log('Found favorite:', favorite);

            res.json({
                isFavorite: !!favorite,
                favorite
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi kiểm tra trạng thái yêu thích',
                error: error.message
            });
        }
    }

}

module.exports = new FavoriteController();
