const ProductSizeStock = require('../models/ProductSizeStock');
const ProductColor = require('../models/ProductColor');
const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');

class ProductSizeStockController {
   
    // Lấy thông tin tồn kho theo SKU
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

    // Lấy tất cả size và số lượng tồn của một màu sản phẩm
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
            console.error('Error in getSKUInfo:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin SKU',
                error: error.message
            });
        }
    }

    //!ADMIN
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

            

            res.json({
                message: 'Cập nhật số lượng tồn kho thành công'
            });
        } catch (error) {
            console.error('Error in updateStock:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật số lượng tồn kho',
                error: error.message
            });
        }
    }
}

module.exports = new ProductSizeStockController();
