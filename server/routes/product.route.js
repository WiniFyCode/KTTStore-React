const express = require('express');
const router = express.Router();
const multer = require('multer');
const ProductController = require('../controllers/ProductController');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { uploadFile, getImageLink } = require('../middlewares/ImagesCloudinary_Controller');

// Cấu hình multer để lưu file tạm thời
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/uploadPendingImages/');
    },
    filename: function (req, file, cb) {
        // Tạo chuỗi ngẫu nhiên 5 ký tự
        const randomString = Math.random().toString(36).substring(2, 7);
        cb(null, randomString);
    }
});
const upload = multer({ storage: storage });

//!ADMIN - UPLOAD ẢNH
router.post('/admin/products/upload-images', 
    authenticateToken, 
    isAdmin, 
    upload.array('images'), 
    async (req, res) => {
        try {
            const files = req.files;
            const imageUrls = [];
            
            // Upload từng file lên Cloudinary
            for (const file of files) {
                const publicId = await uploadFile(file.path);
                const imageUrl = await getImageLink(publicId);
                imageUrls.push(imageUrl);
            }

            res.json({
                success: true,
                imageUrls
            });
        } catch (error) {
            console.error('Error uploading images:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload ảnh'
            });
        }
    }
);

//!ADMIN - DASHBOARD
router.get('/all-by-categories', ProductController.getAllProductsByCategories);
//?CUSTOMER - HOMEPAGE
router.get('/', ProductController.getProducts);
router.get('/basic', ProductController.getAllProductsBasicInfo);
router.get('/gender', ProductController.getProductsByGender);
router.get('/category/:categoryID', ProductController.getProductsByCategory);
router.get('/:id', ProductController.getProductById);

//!ADMIN - PRODUCT MANAGEMENT
router.get('/admin/products', authenticateToken, isAdmin, ProductController.getProductsChoADMIN); // Lấy 
router.get('/admin/products/:id', authenticateToken, isAdmin, ProductController.getProductByIdChoADMIN); // Lấy chi tiết
router.put('/admin/products/update/:id', authenticateToken, isAdmin, ProductController.updateProduct); // Cập nhật
//!ADMIN CALL THÊM /api/product-size-stock ĐỂ CHỈNH TỒN KHO
router.post('/admin/products/create', authenticateToken, isAdmin, ProductController.createProduct); // Tạo
router.delete('/admin/products/delete/:id', authenticateToken, isAdmin, ProductController.deleteProduct); // Xóa
router.patch('/admin/products/toggle/:id', authenticateToken, isAdmin, ProductController.toggleProductStatus); // Bật tắt vô hiệu hoá

module.exports = router;
