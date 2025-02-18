const Category = require('../models/Category');
const { getImageLink } = require('../middlewares/ImagesCloudinary_Controller');

class CategoryController {
    // Lấy tất cả danh mục
    async getCategories(req, res) {
        try {
            const categories = await Category.find().sort('name');
            const modifiedCategories = await Promise.all(categories.map(async category => {
                const imageURL = await getImageLink(category.imageURL);
                return {
                    categoryID: category.categoryID,
                    name: category.name,
                    description: category.description,
                    imageURL: imageURL
                };
            }));
    
            res.json(modifiedCategories);
            
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách danh mục',
                error: error.message
            });
        }
    }

    // Lấy danh mục theo ID
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findOne({ categoryID: id });

            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }

            res.json(category);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin danh mục',
                error: error.message
            });
        }
    }

    // Tạo danh mục mới
    async createCategory(req, res) {
        try {
            const { name, description, imageURL } = req.body;

            // Tạo ID mới cho danh mục
            const lastCategory = await Category.findOne().sort({ categoryID: -1 });
            const categoryID = lastCategory ? lastCategory.categoryID + 1 : 1;

            const category = new Category({
                categoryID,
                name,
                description,
                imageURL
            });

            await category.save();

            res.status(201).json({
                message: 'Tạo danh mục thành công',
                category
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi tạo danh mục',
                error: error.message
            });
        }
    }

    // Cập nhật danh mục
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const category = await Category.findOne({ categoryID: id });
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }

            Object.assign(category, updateData);
            await category.save();

            res.json({
                message: 'Cập nhật danh mục thành công',
                category
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật danh mục',
                error: error.message
            });
        }
    }

    // Xóa danh mục
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            const category = await Category.findOne({ categoryID: id });
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }

            // Kiểm tra xem có sản phẩm nào đang sử dụng danh mục này không
            const Product = require('../models/Product');
            const productsUsingCategory = await Product.countDocuments({ categoryID: id });
            
            if (productsUsingCategory > 0) {
                return res.status(400).json({
                    message: 'Không thể xóa danh mục này vì đang có sản phẩm sử dụng'
                });
            }

            await category.deleteOne();

            res.json({ message: 'Xóa danh mục thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa danh mục',
                error: error.message
            });
        }
    }
}

module.exports = new CategoryController();
