const ProductColor = require('../models/ProductColor');
const Product = require('../models/Product');
const ProductSizeStock = require('../models/ProductSizeStock');

class ProductColorController {
    //! ADMIN
    // Lấy tất cả màu của một sản phẩm
    async getProductColors(req, res) {
        try {
            const { productID } = req.params;

            const colors = await ProductColor.find({ productID })
                .populate('productID')
                .sort('colorName');

            // Lấy thông tin tồn kho cho mỗi màu
            const colorsWithStock = await Promise.all(colors.map(async (color) => {
                const stocks = await ProductSizeStock.find({ colorID: color.colorID })
                    .select('size stock')
                    .sort('size');

                return {
                    ...color.toJSON(),
                    sizes: stocks
                };
            }));

            res.json(colorsWithStock);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách màu sắc',
                error: error.message
            });
        }
    }

    //! ADMIN
    // Lấy chi tiết một màu
    async getColorById(req, res) {
        try {
            const { id } = req.params;

            const color = await ProductColor.findOne({ colorID: id })
                .populate('productID');

            if (!color) {
                return res.status(404).json({ message: 'Không tìm thấy màu sắc' });
            }

            // Lấy thông tin tồn kho của màu
            const stocks = await ProductSizeStock.find({ colorID: id })
                .select('size stock')
                .sort('size');

            const colorWithStock = {
                ...color.toJSON(),
                sizes: stocks
            };

            res.json(colorWithStock);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin màu sắc',
                error: error.message
            });
        }
    }

    //! ADMIN
    // Cập nhật thông tin màu
    async updateColor(req, res) {
        try {
            const { id } = req.params;
            const { colorName, images } = req.body;

            const color = await ProductColor.findOne({ colorID: id });
            if (!color) {
                return res.status(404).json({ message: 'Không tìm thấy màu sắc' });
            }

            // Nếu đổi tên màu, kiểm tra tên mới đã tồn tại chưa
            if (colorName && colorName.trim().toLowerCase() !== color.colorName.trim().toLowerCase()) {
                const existingColor = await ProductColor.findOne({
                    productID: color.productID,
                    colorName: { $regex: new RegExp(`^${colorName.trim().toLowerCase()}$`, 'i') },
                    colorID: { $ne: id }
                });
                if (existingColor) {
                    return res.status(400).json({ message: 'Màu này đã tồn tại cho sản phẩm' });
                }
                color.colorName = colorName.trim();
            }

            // Cập nhật hình ảnh nếu có
            if (images) {
                color.images = images;
            }

            await color.save();

            res.json({
                message: 'Cập nhật màu sắc thành công',
                color
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật màu sắc',
                error: error.message
            });
        }
    }

    //!ADMIN
    // ADMIN: Thêm màu mới cho sản phẩm
    async addColor(req, res) {
        try {
            // Lấy id từ params
            const { id } = req.params;
            const { colorName, images, sizes } = req.body;

            // Kiểm tra sản phẩm tồn tại
            const product = await Product.findOne({ productID: id });
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }

            // Kiểm tra màu đã tồn tại
            const existingColor = await ProductColor.findOne({
                productID: id,
                colorName: { $regex: new RegExp(`^${colorName.trim()}$`, 'i') }
            });
            if (existingColor) {
                return res.status(400).json({ message: 'Màu này đã tồn tại cho sản phẩm' });
            }

            // Tạo ID mới cho màu
            const lastColor = await ProductColor.findOne().sort({ colorID: -1 });
            const colorID = lastColor ? lastColor.colorID + 1 : 1;

            const color = new ProductColor({
                colorID,
                productID: id,
                colorName,
                images: images || ['default.png']
            });

            await color.save();

            // Thêm size và stock cho màu mới
            if (sizes && Array.isArray(sizes)) {
                // Lấy sizeStockID lớn nhất hiện tại
                const maxSizeStock = await ProductSizeStock.findOne().sort('-sizeStockID');
                let nextSizeStockID = maxSizeStock ? maxSizeStock.sizeStockID + 1 : 1;

                for (const sizeData of sizes) {
                    await ProductSizeStock.create({
                        sizeStockID: nextSizeStockID++,
                        colorID: color.colorID,
                        size: sizeData.size,
                        stock: sizeData.stock || 0,
                        SKU: `${id}_${colorID}_${sizeData.size}_${nextSizeStockID}`
                    });
                }
            }

            // Log thông tin màu đã tạo với chi tiết về sizes và stock
            const colorInfo = {
                colorID: color.colorID,
                productID: color.productID,
                colorName: color.colorName,
                totalSizes: sizes ? sizes.length : 0,
                sizeDetails: sizes ? sizes.map(size => ({
                    size: size.size,
                    stock: size.stock || 0
                })) : []
            };
            console.log('Đã tạo màu mới:', colorInfo);

            res.status(201).json({ message: 'Thêm màu sắc và size thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Có lỗi xảy ra khi thêm màu sắc' });
        }
    }

    //!ADMIN
    // ADMIN: Xóa màu và tất cả hình ảnh liên quan
    async deleteColor(req, res) {
        try {
            const { id } = req.params;

            const color = await ProductColor.findOne({ colorID: id });
            if (!color) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Không tìm thấy màu sắc' 
                });
            }

            // Import hàm xóa ảnh từ Cloudinary
            const { deleteImage: deleteCloudinaryImage } = require('../middlewares/ImagesCloudinary_Controller');

            // Xóa tất cả hình ảnh trên Cloudinary
            for (const imageUrl of color.images) {
                const isDeleted = await deleteCloudinaryImage(imageUrl);
                if (!isDeleted) {
                    return res.status(500).json({
                        success: false,
                        message: `Không thể xóa hình ảnh: ${imageUrl}`
                    });
                }
            }

            // Xóa tất cả size và stock của màu này
            await ProductSizeStock.deleteMany({ colorID: id });

            // Sau đó xóa màu
            await color.deleteOne();

            res.json({ 
                success: true,
                message: 'Xóa màu sắc, hình ảnh và các size/stock thành công' 
            });
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi xóa màu sắc',
                error: error.message
            });
        }
    }

    //!ADMIN
    // ADMIN: Upload hình ảnh cho màu
    async uploadImages(req, res) {
        try {
            const { id } = req.params;
            const { images } = req.body;

            const color = await ProductColor.findOne({ colorID: id });
            if (!color) {
                return res.status(404).json({ message: 'Không tìm thấy màu sắc' });
            }

            // Thêm hình ảnh mới vào mảng images
            color.images = [...new Set([...color.images, ...images])];
            await color.save();

            res.json({
                message: 'Upload hình ảnh thành công'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi upload hình ảnh',
                error: error.message
            });
        }
    }

    //!ADMIN
    // ADMIN: Xóa hình ảnh của màu
    async deleteImage(req, res) {
        try {
            const { id } = req.params;
            const { imageUrl } = req.body;

            const color = await ProductColor.findOne({ colorID: id });
            if (!color) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Không tìm thấy màu sắc' 
                });
            }

            if (color.images.length <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa hình ảnh cuối cùng của màu sắc'
                });
            }

            // Gọi hàm xóa ảnh trực tiếp với URL
            const { deleteImage: deleteCloudinaryImage } = require('../middlewares/ImagesCloudinary_Controller');
            const isDeleted = await deleteCloudinaryImage(imageUrl);
            
            if (!isDeleted) {
                return res.status(500).json({
                    success: false,
                    message: 'Không thể xóa hình ảnh trên Cloudinary'
                });
            }

            // Xóa hình ảnh khỏi mảng trong database
            color.images = color.images.filter(img => img !== imageUrl);
            await color.save();

            res.json({
                success: true,
                message: 'Xóa hình ảnh thành công'
            });
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi xóa hình ảnh',
                error: error.message
            });
        }
    }
}

module.exports = new ProductColorController();
