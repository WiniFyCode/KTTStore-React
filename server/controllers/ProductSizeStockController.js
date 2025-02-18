const ProductSizeStock = require('../models/ProductSizeStock');
const ProductColor = require('../models/ProductColor');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');

class ProductSizeStockController {
    /**
     * Lấy thông tin tồn kho theo SKU
     * @route GET /api/admin/product-size-stock/sku/:SKU
     */
    async getStockBySKU(req, res) {
        try {
            const { SKU } = req.params;

            // Validate SKU format
            if (!/^\d+_\d+_[SML]_\d+$/.test(SKU)) {
                return res.status(400).json({ 
                    message: 'SKU không đúng định dạng (productID_colorID_size_sizeStockID)' 
                });
            }

            const stockItem = await ProductSizeStock.findOne({ SKU });
            if (!stockItem) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin tồn kho' });
            }

            // Lấy thông tin màu sắc
            const color = await ProductColor.findOne({ colorID: stockItem.colorID });
            if (!color) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin màu sắc' });
            }

            // Lấy thông tin sản phẩm
            const product = await Product.findOne({ productID: color.productID })
                .populate(['targetInfo', 'categoryInfo']);
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin sản phẩm' });
            }

            res.json({
                ...stockItem.toObject(),
                colorInfo: {
                    ...color.toObject(),
                    productID: product
                }
            });
        } catch (error) {
            console.error('Lỗi trong getstockbysku:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin tồn kho',
                error: error.message
            });
        }
    }

    /**
     * Lấy tất cả size và số lượng tồn của một màu sản phẩm
     * @route GET /api/admin/product-size-stock/color/:colorID
     */
    async getStockByColor(req, res) {
        try {
            const colorID = parseInt(req.params.colorID);

            // Validate colorID
            if (!Number.isInteger(colorID) || colorID < 1) {
                return res.status(400).json({ message: 'ColorID không hợp lệ' });
            }

            // Kiểm tra màu sắc tồn tại
            const color = await ProductColor.findOne({ colorID });
            if (!color) {
                return res.status(404).json({ message: 'Không tìm thấy màu sản phẩm' });
            }

            // Lấy thông tin sản phẩm
            const product = await Product.findOne({ productID: color.productID });
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin sản phẩm' });
            }

            const stockItems = await ProductSizeStock.find({ colorID });

            const result = stockItems.map(item => ({
                ...item.toObject(),
                colorInfo: {
                    ...color.toObject(),
                    productID: product
                }
            }));

            res.json(result);
        } catch (error) {
            console.error('Lỗi trong getstockbycolor:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin tồn kho',
                error: error.message
            });
        }
    }

    /**
     * ADMIN: Thêm size và số lượng tồn kho cho màu sản phẩm
     * @route POST /api/admin/product-size-stock
     */
    async addStock(req, res) {
        try {
            let { colorID, size, stock } = req.body;
            colorID = parseInt(colorID);

            // Validate input
            if (!colorID || !size || stock === undefined) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            if (!['S', 'M', 'L'].includes(size)) {
                return res.status(400).json({ message: 'Size không hợp lệ' });
            }

            if (!Number.isInteger(stock) || stock < 0) {
                return res.status(400).json({ message: 'Số lượng tồn kho phải là số nguyên không âm' });
            }

            // Kiểm tra màu sản phẩm tồn tại
            const color = await ProductColor.findOne({ colorID });
            if (!color) {
                return res.status(404).json({ message: 'Không tìm thấy màu sản phẩm' });
            }

            // Kiểm tra size đã tồn tại chưa
            const existingStock = await ProductSizeStock.findOne({ colorID, size });
            if (existingStock) {
                return res.status(400).json({ message: 'Size này đã tồn tại cho màu sản phẩm' });
            }

            // Tạo sizeStockID mới (lấy max hiện tại + 1)
            const maxSizeStock = await ProductSizeStock.findOne().sort('-sizeStockID');
            const sizeStockID = maxSizeStock ? maxSizeStock.sizeStockID + 1 : 1;

            // Tạo SKU mới: productID_colorID_size_sizeStockID
            const SKU = `${color.productID}_${colorID}_${size}_${sizeStockID}`;

            const stockItem = new ProductSizeStock({
                sizeStockID,
                colorID,
                size,
                stock,
                SKU
            });

            await stockItem.save();

            // Lấy thông tin sản phẩm
            const product = await Product.findOne({ productID: color.productID });

            const result = {
                ...stockItem.toObject(),
                colorInfo: {
                    ...color.toObject(),
                    productID: product
                }
            };

            res.status(201).json({
                message: 'Thêm size và số lượng tồn kho thành công',
                stockItem: result
            });
        } catch (error) {
            console.error('Lỗi khi thêm size và số lượng tồn kho:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thêm size và số lượng tồn kho',
                error: error.message
            });
        }
    }

    /**
     * ADMIN: Cập nhật số lượng tồn kho
     * @route PUT /api/admin/product-size-stock/:SKU
     */
    async updateStock(req, res) {
        try {
            const { SKU } = req.params;
            const { stock } = req.body;

            // Validate input
            if (!Number.isInteger(stock) || stock < 0) {
                return res.status(400).json({ message: 'Số lượng tồn kho phải là số nguyên không âm' });
            }

            const stockItem = await ProductSizeStock.findOne({ SKU });
            if (!stockItem) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin tồn kho' });
            }

            // Sử dụng phương thức updateStock có sẵn trong model
            const difference = stock - stockItem.stock;
            await stockItem.updateStock(difference);

            // Lấy thông tin màu sắc và sản phẩm
            const color = await ProductColor.findOne({ colorID: stockItem.colorID });
            const product = await Product.findOne({ productID: color.productID });

            const result = {
                ...stockItem.toObject(),
                colorInfo: {
                    ...color.toObject(),
                    productID: product
                }
            };

            res.json({
                message: 'Cập nhật số lượng tồn kho thành công',
                stockItem: result
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng tồn kho:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật số lượng tồn kho',
                error: error.message
            });
        }
    }

    /**
     * ADMIN: Xóa size
     * @route DELETE /api/admin/product-size-stock/:SKU
     */
    async deleteStock(req, res) {
        try {
            const { SKU } = req.params;

            const stockItem = await ProductSizeStock.findOne({ SKU });
            if (!stockItem) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin tồn kho' });
            }

            // Kiểm tra có đơn hàng nào đang sử dụng size này không
            const ordersUsingStock = await OrderDetail.countDocuments({ SKU });
            if (ordersUsingStock > 0) {
                return res.status(400).json({
                    message: 'Không thể xóa size này vì đã có đơn hàng sử dụng'
                });
            }

            await stockItem.deleteOne();

            res.json({ message: 'Xóa size thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa size:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa size',
                error: error.message
            });
        }
    }

    /**
     * ADMIN: Kiểm tra tồn kho hàng loạt
     * @route POST /api/admin/product-size-stock/check-batch
     */
    async checkStockBatch(req, res) {
        try {
            const { items } = req.body; // Array of { SKU, quantity }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
            }

            const results = await Promise.all(items.map(async (item) => {
                if (!item.SKU || !Number.isInteger(item.quantity) || item.quantity < 1) {
                    return {
                        SKU: item.SKU,
                        isAvailable: false,
                        message: 'Thông tin sản phẩm không hợp lệ'
                    };
                }

                const stockItem = await ProductSizeStock.findOne({ SKU: item.SKU });
                if (!stockItem) {
                    return {
                        SKU: item.SKU,
                        isAvailable: false,
                        message: 'Sản phẩm không tồn tại'
                    };
                }

                // Lấy thông tin màu sắc và sản phẩm
                const color = await ProductColor.findOne({ colorID: stockItem.colorID });
                const product = await Product.findOne({ productID: color.productID });

                const isAvailable = stockItem.stock >= item.quantity;
                return {
                    SKU: item.SKU,
                    productName: product.name,
                    size: stockItem.size,
                    color: color.colorName,
                    requestedQuantity: item.quantity,
                    availableStock: stockItem.stock,
                    isAvailable,
                    message: isAvailable ? 'Đủ hàng' : 'Không đủ hàng'
                };
            }));

            res.json(results);
        } catch (error) {
            console.error('Lỗi khi kiểm tra tồn kho:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi kiểm tra tồn kho',
                error: error.message
            });
        }
    }

    // Lấy thông tin SKU từ productID, colorName và size
    async getSKUInfo(req, res) {
        try {
            const { productID, colorName, size } = req.params;

            // Tìm color theo productID và colorName
            const color = await ProductColor.findOne({
                productID: parseInt(productID),
                colorName: colorName
            });

            if (!color) {
                return res.status(404).json({
                    message: 'Không tìm thấy màu sắc'
                });
            }

            // Tìm size stock theo colorID và size
            const sizeStock = await ProductSizeStock.findOne({
                colorID: color.colorID,
                size: size
            });

            if (!sizeStock) {
                return res.status(404).json({
                    message: 'Không tìm thấy kích thước'
                });
            }

            // Lấy thông tin sản phẩm
            const product = await Product.findOne({ productID: parseInt(productID) })
                .populate(['targetInfo', 'categoryInfo']);

            if (!product) {
                return res.status(404).json({
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            res.json({
                message: 'Lấy thông tin SKU thành công',
                SKU: sizeStock.SKU,
                stock: sizeStock.stock,
                sizeStockID: sizeStock.sizeStockID,
                product: {
                    productID: product.productID,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    description: product.description,
                    target: product.targetInfo,
                    category: product.categoryInfo
                },
                color: {
                    colorID: color.colorID,
                    colorName: color.colorName,
                    images: color.images
                },
                size: size
            });

        } catch (error) {
            console.error('Lỗi khi lấy thông tin SKU:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin SKU',
                error: error.message
            });
        }
    }
}

module.exports = new ProductSizeStockController();
