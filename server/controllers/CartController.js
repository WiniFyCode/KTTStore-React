const Cart = require('../models/Cart');
const ProductSizeStock = require('../models/ProductSizeStock');
const Product = require('../models/Product');
const ProductColor = require('../models/ProductColor');
const Promotion = require('../models/Promotion');
const { getImageLink } = require('../middlewares/ImagesCloudinary_Controller');

class CartController {
    // Lấy giỏ hàng của user
    async getCart(req, res) {
        try {
            // Lấy các items trong giỏ hàng
            const userID = req.user.userID;
            const cartItems = await Cart.find({ userID });

            // Lấy ngày hiện tại để kiểm tra khuyến mãi
            const currentDate = new Date();

            // Tính tổng tiền
            let totalAmount = 0;
            const items = await Promise.all(cartItems.map(async (item) => {
                try {
                    // Tìm thông tin size và stock
                    const sizeStock = await ProductSizeStock.findOne({ SKU: item.SKU });
                    if (!sizeStock) {
                        console.warn(`Không tìm thấy thông tin size cho SKU: ${item.SKU}`);
                        return null;
                    }

                    // Parse productID và colorID từ SKU
                    const [productID, colorID] = sizeStock.SKU.split('_');

                    // Lấy thông tin sản phẩm
                    const product = await Product.findOne({ productID: parseInt(productID) })
                        .populate(['targetInfo', 'categoryInfo']);
                    if (!product) {
                        console.warn(`Không tìm thấy thông tin sản phẩm cho productID: ${productID}`);
                        return null;
                    }

                    // Lấy thông tin màu sắc
                    let color = await ProductColor.findOne({ 
                        colorID: parseInt(colorID),
                        productID: parseInt(productID)
                    });

                    // Nếu không tìm thấy màu sắc, tạo object mặc định
                    if (!color) {
                        console.warn(`Không tìm thấy thông tin màu sắc cho colorID: ${colorID}, productID: ${productID}`);
                        color = {
                            colorName: 'Mặc định',
                            images: []
                        };
                    }

                    // Xử lý ảnh với cloudinary
                    const thumbnail = await getImageLink(product.thumbnail);
                    const colorImages = await Promise.all((color.images || []).map(img => getImageLink(img)));

                    // Tìm khuyến mãi áp dụng
                    const activePromotion = await Promotion.findOne({
                        $or: [
                            { products: product._id },
                            { categories: product.categoryInfo.name }
                        ],
                        startDate: { $lte: currentDate },
                        endDate: { $gte: currentDate },
                        status: 'active'
                    }).sort({ discountPercent: -1 });

                    // Tính giá và khuyến mãi
                    const originalPrice = parseInt(product.price.replace(/\./g, ''));
                    let finalPrice = originalPrice;
                    let promotionDetails = null;

                    if (activePromotion) {
                        const discountedValue = Math.round(originalPrice * (1 - activePromotion.discountPercent / 100));
                        finalPrice = discountedValue;
                        promotionDetails = {
                            name: activePromotion.name,
                            discountPercent: activePromotion.discountPercent,
                            discountedPrice: discountedValue.toLocaleString('vi-VN'),
                            endDate: activePromotion.endDate
                        };
                    }

                    // Tính tổng giá trị của mỗi sản phẩm
                    const subtotal = finalPrice * item.quantity;
                    totalAmount += subtotal;

                    // Trả về dữ liệu
                    const productObj = product.toObject();
                    return {
                        cartID: item.cartID,
                        SKU: sizeStock.SKU,
                        product: {
                            ...productObj,
                            imageURL: colorImages[0] || thumbnail,
                            thumbnail: thumbnail,
                            promotion: promotionDetails,
                            description: undefined
                        },
                        size: {
                            name: sizeStock.size
                        },
                        color: {
                            colorName: color.colorName,
                            images: colorImages
                        },
                        quantity: item.quantity,
                        price: finalPrice.toLocaleString('vi-VN'),
                        originalPrice: product.price,
                        subtotal: subtotal.toLocaleString('vi-VN'),
                        stock: sizeStock.stock
                    };
                } catch (error) {
                    console.error(`Lỗi khi xử lý item ${item.cartID}:`, error);
                    return null;
                }
            }));

            // Lọc bỏ các item null và undefined
            const validItems = items.filter(item => item !== null);

            // Tính lại tổng tiền từ các item hợp lệ
            totalAmount = validItems.reduce((sum, item) => sum + parseInt(item.subtotal.replace(/\./g, '')), 0);

            // Trả về dữ liệu
            res.json({
                message: 'Lấy giỏ hàng thành công',
                items: validItems,
                totalAmount: totalAmount.toLocaleString('vi-VN'),
                itemCount: validItems.length
            });
        } catch (error) {
            console.error('Lỗi lấy giỏ hàng:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy giỏ hàng',
                error: error.message
            });
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    async addToCart(req, res) {
        try {
            const userID = req.user.userID;
            const { SKU, quantity = 1 } = req.body;

            // Kiểm tra sản phẩm tồn tại và còn hàng
            const stockItem = await ProductSizeStock.findOne({ SKU });
            if (!stockItem) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            if (stockItem.stock < quantity) {
                return res.status(400).json({ message: 'Số lượng sản phẩm trong kho không đủ' });
            }

            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            let cartItem = await Cart.findOne({ userID, SKU });

            if (cartItem) {
                // Nếu đã có, cập nhật số lượng
                const newQuantity = cartItem.quantity + quantity;
                if (newQuantity > stockItem.stock) {
                    return res.status(400).json({ message: 'Số lượng sản phẩm trong kho không đủ', maxQuantity: stockItem.stock });
                }

                cartItem.quantity = newQuantity;
                await cartItem.save();
            } else {
                // Nếu chưa có, tạo mới
                const lastCart = await Cart.findOne().sort({ cartID: -1 });
                const cartID = lastCart ? lastCart.cartID + 1 : 1;

                cartItem = new Cart({
                    cartID,
                    userID,
                    SKU,
                    quantity
                });
                await cartItem.save();
            }

            res.status(201).json({
                message: 'Thêm vào giỏ hàng thành công',
                cartItem
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thêm vào giỏ hàng',
                error: error.message
            });
        }
    }

    // Cập nhật số lượng sản phẩm trong giỏ
    async updateCartItem(req, res) {
        try {
            const userID = req.user.userID;
            const { id } = req.params;
            const { quantity } = req.body;

            // Kiểm tra item tồn tại trong giỏ
            const cartItem = await Cart.findOne({ cartID: id, userID });
            if (!cartItem) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }

            // Kiểm tra số lượng tồn kho
            const stockItem = await ProductSizeStock.findOne({ SKU: cartItem.SKU });
            if (stockItem.stock < quantity) {
                return res.status(400).json({ message: 'Số lượng sản phẩm trong kho không đủ', maxQuantity: stockItem.stock });
            }

            // Cập nhật số lượng
            cartItem.quantity = quantity;
            await cartItem.save();

            res.json({
                message: 'Cập nhật số lượng thành công',
                cartItem
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật số lượng',
                error: error.message
            });
        }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    async removeFromCart(req, res) {
        try {
            const userID = req.user.userID;
            const { id } = req.params;

            const cartItem = await Cart.findOne({ cartID: id, userID });
            if (!cartItem) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }

            await cartItem.deleteOne();

            res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng',
                error: error.message
            });
        }
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(req, res) {
        try {
            const userID = req.user.userID;
            
            await Cart.deleteMany({ userID });

            res.json({ message: 'Xóa giỏ hàng thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa giỏ hàng',
                error: error.message
            });
        }
    }
}

module.exports = new CartController();
