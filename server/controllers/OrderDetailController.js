const OrderDetail = require('../models/OrderDetail');
const Order = require('../models/Order');
const ProductSizeStock = require('../models/ProductSizeStock');
const ProductColor = require('../models/ProductColor');
const Product = require('../models/Product');
const { getImageLink } = require('../middlewares/ImagesCloudinary_Controller');

class OrderDetailController {
    // Lấy danh sách chi tiết đơn hàng
    async getOrderDetails(req, res) {
        try {
            const { orderID } = req.params;
            const userID = req.user.userID;

            // Kiểm tra đơn hàng tồn tại và thuộc về user
            const order = await Order.findOne({ orderID });
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            // Nếu không phải admin, kiểm tra đơn hàng có thuộc về user không
            if (req.user.role !== 'admin' && order.userID !== userID) {
                return res.status(403).json({
                    message: 'Bạn không có quyền xem chi tiết đơn hàng này'
                });
            }

            // Lấy danh sách chi tiết đơn hàng
            const orderDetails = await OrderDetail.find({ orderID });

            // Lấy thông tin sản phẩm cho từng chi tiết đơn hàng
            const result = await Promise.all(orderDetails.map(async (detail) => {
                // Lấy thông tin kho
                const stock = await ProductSizeStock.findOne({ SKU: detail.SKU });
                if (!stock) return { ...detail.toObject(), productInfo: null };

                // Lấy thông tin màu sắc và sản phẩm
                const color = await ProductColor.findOne({ colorID: stock.colorID });
                if (!color) return { ...detail.toObject(), productInfo: { ...stock.toObject() } };

                const product = await Product.findOne({ productID: color.productID });

                // Trả về thông tin đầy đủ
                return {
                    orderDetailID: detail.orderDetailID,
                    orderID: detail.orderID,
                    SKU: detail.SKU,
                    quantity: detail.quantity,
                    productInfo: {
                        name: product?.name,
                        price: product?.price,
                        thumbnail: product?.thumbnail,
                        colorName: color.colorName,
                        size: stock.size,
                        stock: stock.stock,
                        images: color.images
                    }
                };
            }));

            res.json(result);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy chi tiết đơn hàng',
                error: error.message
            });
        }
    }

    // Lấy chi tiết một sản phẩm trong đơn hàng
    async getOrderDetailById(req, res) {
        try {
            const { orderID, id } = req.params;

            // Tìm chi tiết đơn hàng
            const detail = await OrderDetail.findOne({
                orderDetailID: id,
                orderID
            });

            if (!detail) {
                return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
            }

            // Lấy thông tin kho
            const stock = await ProductSizeStock.findOne({ SKU: detail.SKU });
            if (!stock) return { ...detail.toObject(), productInfo: null };

            // Lấy thông tin màu sắc và sản phẩm
            const color = await ProductColor.findOne({ colorID: stock.colorID });
            if (!color) return { ...detail.toObject(), productInfo: { ...stock.toObject() } };

            const product = await Product.findOne({ productID: color.productID });

            // Trả về thông tin đầy đủ
            res.json({
                orderDetailID: detail.orderDetailID,
                orderID: detail.orderID,
                SKU: detail.SKU,
                quantity: detail.quantity,
                productInfo: {
                    name: product?.name,
                    price: product?.price,
                    thumbnail: product?.thumbnail,
                    colorName: color.colorName,
                    size: stock.size,
                    stock: stock.stock,
                    images: color.images
                }
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy chi tiết đơn hàng',
                error: error.message
            });
        }
    }

    // Thêm sản phẩm vào đơn hàng
    async addOrderDetail(req, res) {
        try {
            const { orderID } = req.params;
            const { SKU, quantity } = req.body;

            // Kiểm tra đơn hàng
            const order = await Order.findOne({ orderID });
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            // Kiểm tra số lượng tồn kho
            const stock = await ProductSizeStock.findOne({ SKU });
            if (!stock || stock.stock < quantity) {
                return res.status(400).json({ message: 'Số lượng sản phẩm không đủ' });
            }

            // Lấy giá sản phẩm
            const color = await ProductColor.findOne({ colorID: stock.colorID });
            const product = await Product.findOne({ productID: color.productID });
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin sản phẩm' });
            }

            // Tạo chi tiết đơn hàng mới
            const lastOrderDetail = await OrderDetail.findOne().sort({ orderDetailID: -1 });
            const orderDetail = new OrderDetail({
                orderDetailID: lastOrderDetail ? lastOrderDetail.orderDetailID + 1 : 1,
                orderID,
                SKU,
                quantity
            });

            // Cập nhật số lượng tồn kho và tổng tiền
            stock.stock -= quantity;
            order.totalAmount += product.price * quantity;

            await Promise.all([
                orderDetail.save(),
                stock.save(),
                order.save()
            ]);

            res.status(201).json(orderDetail);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thêm sản phẩm vào đơn hàng',
                error: error.message
            });
        }
    }

    // Cập nhật số lượng sản phẩm
    async updateOrderDetail(req, res) {
        try {
            const { orderID, id } = req.params;
            const { quantity } = req.body;

            // Tìm chi tiết đơn hàng
            const detail = await OrderDetail.findOne({
                orderDetailID: id,
                orderID
            });

            if (!detail) {
                return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
            }

            // Kiểm tra số lượng tồn kho
            const stock = await ProductSizeStock.findOne({ SKU: detail.SKU });
            const quantityDiff = quantity - detail.quantity;

            if (!stock || stock.stock < quantityDiff) {
                return res.status(400).json({ message: 'Số lượng sản phẩm không đủ' });
            }

            // Cập nhật tổng tiền
            const order = await Order.findOne({ orderID });
            const color = await ProductColor.findOne({ colorID: stock.colorID });
            const product = await Product.findOne({ productID: color.productID });

            // Cập nhật số lượng và tổng tiền
            detail.quantity = quantity;
            stock.stock -= quantityDiff;
            order.totalAmount += product.price * quantityDiff;

            await Promise.all([
                detail.save(),
                stock.save(),
                order.save()
            ]);

            res.json(detail);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật số lượng sản phẩm',
                error: error.message
            });
        }
    }

    // Xóa sản phẩm khỏi đơn hàng
    async deleteOrderDetail(req, res) {
        try {
            const { orderID, id } = req.params;

            // Tìm chi tiết đơn hàng
            const detail = await OrderDetail.findOne({
                orderDetailID: id,
                orderID
            });

            if (!detail) {
                return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
            }

            // Cập nhật số lượng tồn kho
            const stock = await ProductSizeStock.findOne({ SKU: detail.SKU });
            stock.stock += detail.quantity;

            // Cập nhật tổng tiền
            const order = await Order.findOne({ orderID });
            const color = await ProductColor.findOne({ colorID: stock.colorID });
            const product = await Product.findOne({ productID: color.productID });
            order.totalAmount -= product.price * detail.quantity;

            await Promise.all([
                OrderDetail.deleteOne({ orderDetailID: id }),
                stock.save(),
                order.save()
            ]);

            res.json({ message: 'Đã xóa sản phẩm khỏi đơn hàng' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi đơn hàng',
                error: error.message
            });
        }
    }

    // ADMIN: Lấy chi tiết đơn hàng
    async getOrderDetailschoADMIN(req, res) {
        try {
            const { orderID } = req.params;
            

            const orderDetails = await OrderDetail.find({ orderID: orderID });
            

            if (!orderDetails || orderDetails.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
            }

            const detailsWithProducts = await Promise.all(
                orderDetails.map(async (detail) => {
                    const stockItem = await ProductSizeStock.findOne({ SKU: detail.SKU });
                    if (!stockItem) return null;

                    const [productID, colorID] = stockItem.SKU.split('_');

                    const [product, color] = await Promise.all([
                        Product.findOne({ productID: Number(productID) })
                            .select('productID name price images'),
                        ProductColor.findOne({
                            productID: Number(productID),
                            colorID: Number(colorID)
                        }).select('colorName colorID images')
                    ]);

                    // Lấy đường dẫn Cloudinary cho ảnh
                    let cloudinaryImageUrl = null;
                    if (color && color.images && color.images.length > 0) {
                        cloudinaryImageUrl = await getImageLink(color.images[0]);
                    }

                    return {
                        orderDetailID: detail.orderDetailID,
                        quantity: detail.quantity,
                        SKU: detail.SKU,
                        size: stockItem.size,
                        price: stockItem.price,
                        product: product ? {
                            productID: product.productID,
                            name: product.name,
                            price: product.price,
                            color: color ? {
                                colorName: color.colorName,
                                colorID: color.colorID,
                                image: cloudinaryImageUrl // Sử dụng đường dẫn Cloudinary
                            } : null
                        } : {
                            name: 'Sản phẩm không tồn tại',
                            price: 0,
                            images: []
                        }
                    };
                })
            );

            const validDetails = detailsWithProducts.filter(detail => detail !== null);

            // Tính tổng giá trị đơn hàng - xử lý xóa dấu chấm trong giá tiền
            const totalPrice = validDetails.reduce((sum, detail) => {
                // Chuyển giá tiền về dạng số bằng cách xóa dấu chấm
                const price = Number(detail.product.price.toString().replace(/\./g, ''));
                return sum + (price * detail.quantity);
            }, 0);

            res.json({
                orderDetails: validDetails,
                totalPrice: totalPrice
            });
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng cho admin:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy chi tiết đơn hàng',
                error: error.message
            });
        }
    }
}

module.exports = new OrderDetailController();
