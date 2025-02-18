import React, { useState, useEffect } from 'react';
import { FiSearch, FiPackage, FiDollarSign, FiTrendingUp, FiFilter, FiCalendar, FiTag, FiEye, FiEdit, FiList, FiPlus, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useTheme } from '../../contexts/AdminThemeContext';
import { formatDate } from '../../utils/dateUtils';
import ImageUpload from '../../components/ImageUpload';
import MultipleImageUpload from '../../components/MultipleImageUpload';

const ProductManagement = () => {
    const { isDarkMode } = useTheme();

    // ===== STATES =====
    // ===== UI =====
    const [loading, setLoading] = useState(false);

    // ===== PRODUCT =====
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [targets, setTargets] = useState([]);

    // ===== FILTER & SEARCH =====
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        target: 'all',
        priceRange: 'all',
        sort: 'createAt',
        order: 'desc'
    });

    // ===== PAGINATION =====
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // ===== STATS =====
    const [stats, setStats] = useState({
        total: 0,
        totalMaleProducts: 0,
        totalFemaleProducts: 0,
        totalDeactivatedProducts: 0,
        totalRevenue: 0
    });

    // ===== DETAIL MODAL =====
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // ===== PRODUCT DETAIL =====
    const [productDetail, setProductDetail] = useState(null);

    // ===== EDIT MODAL =====
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // ===== IMAGE UPLOAD =====
    const [uploadedImages, setUploadedImages] = useState([]);

    // ===== COLOR & SIZE =====
    const [isColorSizeModalOpen, setIsColorSizeModalOpen] = useState(false);
    const [selectedProductForColorSize, setSelectedProductForColorSize] = useState(null);
    const [colorSizeDetail, setColorSizeDetail] = useState(null);

    // ===== EDIT SIZE =====
    const [editingSize, setEditingSize] = useState(null);

    // ===== UPLOAD COLOR IMAGE =====
    const [uploadingColorImages, setUploadingColorImages] = useState(null);

    // ===== ADD COLOR MODAL =====
    const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false);
    const [newColorData, setNewColorData] = useState({
        colorName: '',
        sizes: [
            { size: 'S', stock: 0 },
            { size: 'M', stock: 0 },
            { size: 'L', stock: 0 },
        ],
        images: []
    });

    // ===== ADD PRODUCT MODAL =====
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        thumbnail: '',
        categoryID: '',
        targetID: '',
        colors: [
            {
                colorName: '',
                images: [],
                sizes: [
                    { size: 'S', stock: 0 },
                    { size: 'M', stock: 0 },
                    { size: 'L', stock: 0 }
                ]
            }
        ]
    });

    // ===== EFFECTS =====
    // ===== INITIAL DATA FETCH =====
    useEffect(() => {
        fetchProducts();
    }, []);

    // ===== SORT =====
    const sortByNewest = (products) => {
        return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);

            // Gọi đồng thời cả 3 API
            const [productsResponse, categoriesResponse, targetsResponse] = await Promise.all([
                axios.get('/api/admin/products/admin/products'),
                axios.get('/api/categories'),
                axios.get('/api/targets')
            ]);

            const { products, stats } = productsResponse.data;
            const categories = categoriesResponse.data;
            const targets = targetsResponse.data;

            // Map categories và targets từ API riêng
            const uniqueCategories = categories.map(category => ({
                categoryID: category.categoryID,
                name: category.name
            }));

            const uniqueTargets = targets.map(target => ({
                targetID: target.targetID,
                name: target.name
            }));

            // Đảm bảo price là string và format với dấu chấm
            const processedProducts = products.map(product => ({
                ...product,
                price: String(product.price).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }));

            // Sắp xếp sản phẩm theo ngày tạo mới nhất
            const sortedProducts = sortByNewest(processedProducts);

            setAllProducts(sortedProducts);
            setDisplayedProducts(sortedProducts);
            setCategories(uniqueCategories);
            setTargets(uniqueTargets);
            setStats({
                total: stats?.total || 0,
                totalMaleProducts: stats?.totalMaleProducts || 0,
                totalFemaleProducts: stats?.totalFemaleProducts || 0,
                totalDeactivatedProducts: stats?.totalDeactivatedProducts || 0,
                totalRevenue: stats?.totalRevenue || 0
            });

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            toast.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // 2. Filter & Search Effect
    useEffect(() => {
        let result = [...allProducts];

        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.target.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.category !== 'all') {
            result = result.filter(product => product.category === filters.category);
        }

        if (filters.target !== 'all') {
            result = result.filter(product => product.target === filters.target);
        }

        if (filters.priceRange !== 'all') {
            switch (filters.priceRange) {
                case 'under500':
                    result = result.filter(product => parseFloat(product.price.replace(/\./g, '')) < 500000);
                    break;
                case '500to1000':
                    result = result.filter(product => {
                        const price = parseFloat(product.price.replace(/\./g, ''));
                        return price >= 500000 && price <= 1000000;
                    });
                    break;
                case 'above1000':
                    result = result.filter(product => parseFloat(product.price.replace(/\./g, '')) > 1000000);
                    break;
                default:
                    break;
            }
        }

        // Sắp xếp sản phẩm
        result.sort((a, b) => {
            const priceA = parseFloat((a.price || '0').toString().replace(/\./g, ''));
            const priceB = parseFloat((b.price || '0').toString().replace(/\./g, ''));

            switch (filters.sort) {
                case 'name':
                    return filters.order === 'asc'
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                case 'price':
                    return filters.order === 'asc'
                        ? priceA - priceB
                        : priceB - priceA;
                case 'createAt':
                    return filters.order === 'asc'
                        ? new Date(a.createdAt) - new Date(b.createdAt)
                        : new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        setDisplayedProducts(result);
    }, [searchTerm, filters, allProducts]);

    // ===== HANDLERS =====
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = displayedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);

    // Thêm hàm xử lý xem chi tiết
    const handleViewDetail = async (product) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/products/admin/products/${product.productID}`);
            setProductDetail(response.data.product);
            setSelectedProduct(response.data.product);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error('Lỗi khi tải thông tin chi tiết sản phẩm:', error);
            toast.error('Lỗi khi tải thông tin chi tiết sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý mở modal chỉnh sửa
    const handleEditClick = (product) => {
        setEditingProduct({
            ...product,
            category: product.category,
            target: product.target,
        });
        setIsEditModalOpen(true);
    };

    // Thêm hàm xử lý format giá
    const formatPrice = (price) => {
        return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const unformatPrice = (price) => {
        return String(price).replace(/\./g, '');
    };

    // Thêm hàm xử lý cập nhật sản phẩm
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Tìm categoryID và targetID từ tên
            const selectedCategory = categories.find(cat => cat.name === editingProduct.category);
            const selectedTarget = targets.find(target => target.name === editingProduct.target);

            if (!selectedCategory || !selectedTarget) {
                toast.error('Danh mục hoặc đối tượng không hợp lệ');
                return;
            }

            // Tạo payload với thông tin cập nhật
            const updatePayload = {
                ...editingProduct,
                price: unformatPrice(editingProduct.price),
                thumbnail: uploadedImages[0] || editingProduct.thumbnail,
                categoryID: selectedCategory.categoryID,
                targetID: selectedTarget.targetID
            };

            // Xóa các trường không cần thiết
            delete updatePayload.category;
            delete updatePayload.target;

            const response = await axios.put(
                `/api/admin/products/admin/products/update/${editingProduct.productID}`,
                updatePayload
            );

            toast.success('Cập nhật sản phẩm thành công!');
            setIsEditModalOpen(false);
            await fetchProducts();

        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            toast.error('Lỗi khi cập nhật sản phẩm: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý xem màu và size
    const handleViewColorAndSize = async (product) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/products/admin/products/${product.productID}`);
            setColorSizeDetail(response.data.product);
            setSelectedProductForColorSize(response.data.product);
            setIsColorSizeModalOpen(true);
        } catch (error) {
            console.error('Lỗi khi tải thông tin chi tiết sản phẩm:', error);
            toast.error('Lỗi khi tải thông tin chi tiết sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý cập nhật số lượng
    const handleUpdateStock = async (colorIndex, sizeIndex, newStock) => {
        try {
            // Lấy SKU của size cần cập nhật
            const SKU = colorSizeDetail.colors[colorIndex].sizes[sizeIndex].SKU;
            const stockValue = parseInt(newStock);

            // Gọi API cập nhật số lượng
            const response = await axios.put(`/api/admin/product-size-stock/admin/product-size-stock/update/${SKU}`, {
                stock: stockValue
            });

            // Nếu cập nhật thành công, cập nhật lại state
            if (response.data) {
                // Tạo bản sao của dữ liệu hiện tại
                const updatedColorSizeDetail = { ...colorSizeDetail };
                updatedColorSizeDetail.colors[colorIndex].sizes[sizeIndex].stock = stockValue;

                // Cập nhật state
                setColorSizeDetail(updatedColorSizeDetail);
                setEditingSize(null);

                toast.success('Cập nhật số lượng thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật số lượng';
            toast.error(errorMessage);
        }
    };

    // Xử lý cập nhật hình ảnh cho màu
    const handleUpdateColorImages = async (colorIndex, imageUrls) => {
        try {
            const color = colorSizeDetail.colors[colorIndex];
            const response = await axios.put(
                `/api/admin/product-colors/admin/product-colors/add/${color.colorID}/images`,
                { images: imageUrls }
            );

            if (response.data) {
                // Cập nhật state local
                const updatedColorSizeDetail = { ...colorSizeDetail };
                updatedColorSizeDetail.colors[colorIndex].images = imageUrls;
                setColorSizeDetail(updatedColorSizeDetail);
                setUploadingColorImages(null);
                toast.success('Cập nhật hình ảnh thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật hình ảnh:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật hình ảnh';
            toast.error(errorMessage);
        }
    };

    // Xử lý xóa hình ảnh
    const handleDeleteColorImage = async (colorIndex, imageIndex) => {
        try {
            const color = colorSizeDetail.colors[colorIndex];
            const imageUrl = color.images[imageIndex];

            const response = await axios.delete(
                `/api/admin/product-colors/admin/product-colors/delete/${color.colorID}/images`,
                { data: { imageUrl } }  // Gửi imageUrl trong data của request
            );

            if (response.data) {
                // Cập nhật state local
                const updatedColorSizeDetail = { ...colorSizeDetail };
                updatedColorSizeDetail.colors[colorIndex].images = response.data.color.images;
                setColorSizeDetail(updatedColorSizeDetail);
                toast.success('Xóa hình ảnh thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi xóa hình ảnh:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi xóa hình ảnh';
            toast.error(errorMessage);
        }
    };

    // Thêm hàm xử lý thêm màu mới
    const handleAddNewColor = async () => {
        try {
            if (!newColorData.colorName) {
                toast.error('Vui lòng nhập tên màu!');
                return;
            }

            if (newColorData.images.length === 0) {
                toast.error('Vui lòng tải lên ít nhất một hình ảnh!');
                return;
            }

            setLoading(true);

            // Tạo payload với đầy đủ thông tin cần thiết
            const payload = {
                productID: selectedProductForColorSize.productID,
                colorName: newColorData.colorName,
                images: newColorData.images,
                sizes: newColorData.sizes
            };

            const response = await axios.post(
                `/api/admin/product-colors/admin/product-colors/add/${selectedProductForColorSize.productID}`,
                payload
            );

            if (response.data) {
                // Cập nhật lại thông tin màu và size
                const updatedProduct = await axios.get(
                    `/api/admin/products/admin/products/${selectedProductForColorSize.productID}`
                );
                setColorSizeDetail(updatedProduct.data.product);
                setIsAddColorModalOpen(false);
                setNewColorData({
                    colorName: '',
                    sizes: [
                        { size: 'S', stock: 0 },
                        { size: 'M', stock: 0 },
                        { size: 'L', stock: 0 },
                    ],
                    images: []
                });
                toast.success('Thêm màu mới thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi thêm màu mới:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi thêm màu mới');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý xóa màu
    const handleDeleteColor = async (colorIndex) => {
        try {
            const color = colorSizeDetail.colors[colorIndex];

            // Hiển thị confirm dialog
            if (!window.confirm(`Bạn có chắc chắn muốn xóa màu ${color.colorName} và tất cả hình ảnh liên quan?`)) {
                return;
            }

            setLoading(true);
            const response = await axios.delete(
                `/api/admin/product-colors/admin/product-colors/delete/${color.colorID}`
            );

            if (response.data) {
                // Cập nhật lại thông tin màu và size
                const updatedProduct = await axios.get(
                    `/api/admin/products/admin/products/${selectedProductForColorSize.productID}`
                );
                setColorSizeDetail(updatedProduct.data.product);
                toast.success('Xóa màu và hình ảnh thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi xóa màu:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi xóa màu';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý tạo sản phẩm mới
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validate dữ liệu
            if (!newProduct.name || !newProduct.price || !newProduct.description ||
                !newProduct.thumbnail || !newProduct.categoryID || !newProduct.targetID) {
                toast.error('Vui lòng điền đầy đủ thông tin sản phẩm!');
                return;
            }

            // Validate colors
            if (!newProduct.colors[0].colorName || newProduct.colors[0].images.length === 0) {
                toast.error('Vui lòng thêm ít nhất một màu với hình ảnh!');
                return;
            }

            // Tìm category và target từ danh sách có sẵn
            const selectedCategory = categories.find(cat => cat.name === newProduct.categoryID);
            const selectedTarget = targets.find(target => target.name === newProduct.targetID);

            if (!selectedCategory || !selectedTarget) {
                toast.error('Danh mục hoặc đối tượng không hợp lệ');
                return;
            }

            // Log để debug
            console.log('Selected Category:', selectedCategory);
            console.log('Selected Target:', selectedTarget);

            const processedPayload = {
                name: newProduct.name,
                price: parseInt(unformatPrice(newProduct.price)), // Đảm bảo price là số
                description: newProduct.description,
                thumbnail: newProduct.thumbnail,
                categoryID: parseInt(selectedCategory.categoryID), // Đảm bảo là số
                targetID: parseInt(selectedTarget.targetID), // Đảm bảo là số
                colors: newProduct.colors.map(color => ({
                    colorName: color.colorName,
                    images: color.images,
                    sizes: color.sizes.map(size => ({
                        ...size,
                        stock: parseInt(size.stock) // Đảm bảo stock là số
                    }))
                }))
            };

            // Log payload cuối cùng để kiểm tra
            console.log('Final processed payload:', processedPayload);

            const response = await axios.post('/api/admin/products/admin/products/create', processedPayload);

            if (response.data) {
                toast.success('Tạo sản phẩm mới thành công!');
                setIsAddProductModalOpen(false);
                // Reset form
                setNewProduct({
                    name: '',
                    price: '',
                    description: '',
                    thumbnail: '',
                    categoryID: '',
                    targetID: '',
                    colors: [
                        {
                            colorName: '',
                            images: [],
                            sizes: [
                                { size: 'S', stock: 0 },
                                { size: 'M', stock: 0 },
                                { size: 'L', stock: 0 }
                            ]
                        }
                    ]
                });
                await fetchProducts();
            }
        } catch (error) {
            console.error('Lỗi khi tạo sản phẩm mới:', error);
            console.error('Chi tiết lỗi:', error.response?.data);
            toast.error(error.response?.data?.message || 'Lỗi khi tạo sản phẩm mới');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý xóa sản phẩm
    const handleDeleteProduct = async (product) => {
        try {
            // Hiển thị confirm dialog
            if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan!`)) {
                return;
            }

            setLoading(true);

            const response = await axios.delete(`/api/admin/products/admin/products/delete/${product.productID}`);

            if (response.data) {
                toast.success('Xóa sản phẩm thành công!');
                await fetchProducts();
            }
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý toggle status
    const handleToggleStatus = async (product) => {
        try {
            setLoading(true);

            const response = await axios.patch(`/api/admin/products/admin/products/toggle/${product.productID}`);

            if (response.data) {
                toast.success(response.data.message);
                // Cập nhật lại danh sách sản phẩm
                await fetchProducts();
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái sản phẩm:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} py-8`}>
            <div className="container mx-auto px-4">
                {/* Header */}
            <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-5xl font-bold mb-2">Quản lý sản phẩm</h1>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Quản lý và theo dõi tất cả sản phẩm của bạn
                        </p>
                    </div>
                <button
                    onClick={() => setIsAddProductModalOpen(true)}
                        className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-300"
                >
                        <FiPlus className="mr-2" /> Thêm sản phẩm
                </button>
            </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Tổng sản phẩm */}
                    <div className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tổng sản phẩm
                                </p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                    </div>
                            <div className="p-3 rounded-xl bg-blue-100/80">
                                <FiPackage className="text-2xl text-blue-600" />
                </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    {/* Sản phẩm nam */}
                    <div className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Sản phẩm nam
                                </p>
                                <p className="text-3xl font-bold mt-1">{stats.totalMaleProducts}</p>
                    </div>
                            <div className="p-3 rounded-xl bg-indigo-100/80">
                                <FiUser className="text-2xl text-indigo-600" />
                </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" 
                                 style={{ width: `${(stats.totalMaleProducts / stats.total) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Sản phẩm nữ */}
                    <div className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Sản phẩm nữ
                                </p>
                                <p className="text-3xl font-bold mt-1">{stats.totalFemaleProducts}</p>
                    </div>
                            <div className="p-3 rounded-xl bg-pink-100/80">
                                <FiUser className="text-2xl text-pink-600" />
                </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 rounded-full" 
                                 style={{ width: `${(stats.totalFemaleProducts / stats.total) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Tổng doanh thu */}
                    <div className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tổng doanh thu
                                </p>
                                <p className="text-3xl font-bold mt-1">{formatPrice(stats.totalRevenue)}đ</p>
                    </div>
                            <div className="p-3 rounded-xl bg-green-100/80">
                                <FiDollarSign className="text-2xl text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                </div>
            </div>

                {/* Bộ lọc và tìm kiếm */}
                <div className={`p-6 rounded-xl shadow-sm mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex flex-wrap gap-4">
                        {/* Tìm kiếm */}
                        <div className="flex-1">
                <div className="relative">
                    <input
                        type="text"
                                    placeholder="Nhập tên sản phẩm, mã sản phẩm..."
                                    className={`w-full pl-12 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                                <FiSearch className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
                </div>
                        </div>

                        {/* Lọc theo danh mục */}
                    <select
                            className={`min-w-[210px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                            <option value="all">📁 Tất cả danh mục</option>
                        {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                        ))}
                    </select>

                        {/* Lọc theo giới tính */}
                        <select
                            className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                            value={filters.target}
                            onChange={(e) => handleFilterChange('target', e.target.value)}
                        >
                            <option value="all">👤 Tất cả giới tính</option>
                            <option value="Nam">👨 Nam</option>
                            <option value="Nữ">👩 Nữ</option>
                        </select>

                        {/* Sắp xếp */}
                    <select
                            className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <option value="createdAt">📅 Ngày tạo</option>
                            <option value="name">📝 Tên sản phẩm</option>
                            <option value="price">💰 Giá bán</option>
                    </select>

                        {/* Thứ tự */}
                    <select
                            className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                                isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        value={filters.order}
                        onChange={(e) => handleFilterChange('order', e.target.value)}
                    >
                            <option value="desc">⬇️ Giảm dần</option>
                            <option value="asc">⬆️ Tăng dần</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
                <div className={`overflow-hidden rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                    <thead>
                                <tr className={`text-left ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <th className="px-6 py-4 text-sm font-medium">Tên sản phẩm</th>
                                    <th className="px-6 py-4 text-sm font-medium">Giá</th>
                                    <th className="px-6 py-4 text-sm font-medium">Danh mục</th>
                                    <th className="px-6 py-4 text-sm font-medium">Đối tượng</th>
                                    <th className="px-6 py-4 text-sm font-medium">Ngày tạo</th>
                                    <th className="px-6 py-4 text-sm font-medium">Trạng thái</th>
                                    <th className="px-6 py-4 text-sm font-medium text-center">Thao tác</th>
                        </tr>
                    </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8">
                                            <div className="flex justify-center items-center space-x-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <FiPackage className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                                <p className="mt-2 text-sm text-gray-500">Không có sản phẩm nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentProducts.map(product => (
                                        <tr key={product.productID} className={`group transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <FiPackage className="w-5 h-5 text-green-500" />
                                                    <span className="text-sm font-medium">{product.name}</span>
                                    </div>
                                </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-green-600">{product.price}đ</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                                        {product.category}
                                    </span>
                                </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    product.target === 'Nam' 
                                                        ? 'bg-indigo-100 text-indigo-600' 
                                                        : 'bg-pink-100 text-pink-600'
                                        }`}>
                                        {product.target}
                                    </span>
                                </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm">{formatDate(product.createdAt)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    product.isActivated
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                }`}>
                                        {product.isActivated ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleViewDetail(product)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            isDarkMode
                                                                ? 'bg-blue-400/10 hover:bg-blue-400/20 text-blue-400'
                                                                : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                                        }`}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FiEye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(product)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            isDarkMode
                                                                ? 'bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400'
                                                                : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600'
                                                        }`}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FiEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleViewColorAndSize(product)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            isDarkMode
                                                                ? 'bg-purple-400/10 hover:bg-purple-400/20 text-purple-400'
                                                                : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                                                        }`}
                                                        title="Màu & Size"
                                                    >
                                                        <FiList className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(product)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            product.isActivated
                                                                ? isDarkMode
                                                                    ? 'bg-green-400/10 hover:bg-green-400/20 text-green-400'
                                                                    : 'bg-green-100 hover:bg-green-200 text-green-600'
                                                                : isDarkMode
                                                                    ? 'bg-gray-400/10 hover:bg-gray-400/20 text-gray-400'
                                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                        }`}
                                                        title={product.isActivated ? 'Đang bật' : 'Đang tắt'}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                            className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={product.isActivated
                                                        ? "M5 13l4 4L19 7"
                                                        : "M6 18L18 6M6 6l12 12"
                                                    }
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            isDarkMode
                                                                ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                                                                : 'bg-red-100 hover:bg-red-200 text-red-600'
                                                        }`}
                                                        title="Xóa"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                                    ))
                                )}
                    </tbody>
                </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center space-x-2 mt-4 mb-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={`px-4 py-2 border border-gray-300 rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600' : 'bg-white border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'}`}
                    >
                        Trước
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 border rounded-lg transition-colors ${currentPage === page ? 'bg-green-500 text-white border-green-500' : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                                >
                                    {page}
                                </button>
                            );
                        }
                        if (page === 2 || page === totalPages - 1) {
                            return <span key={page} className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>...</span>;
                        }
                        return null;
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600' : 'bg-white border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'}`}
                    >
                        Sau
                    </button>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
                        <div className={`relative w-full max-w-4xl p-8 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Chi tiết sản phẩm
                                    </h3>
                                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Thông tin chi tiết về sản phẩm và các biến thể
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isDarkMode 
                                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="space-y-6">
                                {productDetail ? (
                                    <>
                                        {/* Thông tin cơ bản */}
                                        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Thông tin cơ bản
                                            </h4>
                                            <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        ID sản phẩm
                                                    </label>
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                    {productDetail.productID}
                                                </div>
                                            </div>
                                            <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        MongoDB ID
                                                    </label>
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                    {productDetail._id}
                                                </div>
                                            </div>
                                                <div className="col-span-2">
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Tên sản phẩm
                                                    </label>
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                {productDetail.name}
                                            </div>
                                        </div>
                                        <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Giá
                                                    </label>
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} text-green-500 font-medium`}>
                                                {productDetail.price}đ
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Trạng thái
                                                    </label>
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            productDetail.isActivated
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-red-100 text-red-600'
                                                        }`}>
                                                            {productDetail.isActivated ? 'Hoạt động' : 'Đã khóa'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Danh mục và đối tượng */}
                                        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Phân loại
                                            </h4>
                                            <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Danh mục
                                                    </label>
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                                                    {productDetail.category}
                                                        </span>
                                                </div>
                                            </div>
                                            <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Đối tượng
                                                    </label>
                                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            productDetail.target === 'Nam'
                                                                ? 'bg-indigo-100 text-indigo-600'
                                                                : 'bg-pink-100 text-pink-600'
                                                        }`}>
                                                    {productDetail.target}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Màu sắc và kích thước */}
                                        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Màu sắc và kích thước
                                            </h4>
                                            <div className="space-y-6">
                                                {productDetail.colors?.map((color) => (
                                                    <div key={color.colorID} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                        <h5 className={`text-base font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            Màu: {color.colorName}
                                                        </h5>

                                                        {/* Sizes */}
                                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                                            {color.sizes.map((size, idx) => (
                                                                <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                            Size {size.size}
                                                                        </span>
                                                                        <span className="text-green-500 font-medium">
                                                                            {size.stock} cái
                                                                        </span>
                                                                    </div>
                                                                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        SKU: {size.SKU}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Images */}
                                                        <div>
                                                            <h6 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                Hình ảnh
                                                            </h6>
                                                            <div className="grid grid-cols-3 gap-4">
                                                            {color.images.map((image, idx) => (
                                                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                                                                <img
                                                                    src={image}
                                                                    alt={`${productDetail.name} - ${color.colorName} - ${idx + 1}`}
                                                                            className="w-full h-full object-cover"
                                                                />
                                                                    </div>
                                                            ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Khuyến mãi */}
                                        {productDetail.promotion && (
                                            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    Khuyến mãi
                                                </h4>
                                                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                    <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                Tên khuyến mãi
                                                            </label>
                                                            <div className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {productDetail.promotion.name}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                Phần trăm giảm
                                                            </label>
                                                            <div className="text-green-500 font-medium">
                                                                {productDetail.promotion.discountPercent}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                Giá sau khuyến mãi
                                                            </label>
                                                            <div className="text-green-500 font-medium">
                                                                {productDetail.promotion.discountedPrice}đ
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                Ngày kết thúc
                                                            </label>
                                                            <div className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {formatDate(productDetail.promotion.endDate)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mô tả và ảnh đại diện */}
                                        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Mô tả và ảnh đại diện
                                            </h4>
                                            <div className="space-y-6">
                                        <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Mô tả
                                                    </label>
                                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} whitespace-pre-wrap`}>
                                                {productDetail.description}
                                            </div>
                                        </div>
                                        <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Ảnh đại diện
                                                    </label>
                                                    <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                                                <img
                                                    src={productDetail.thumbnail}
                                                    alt={productDetail.name}
                                                            className="w-full h-full object-cover"
                                                />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className={`px-6 py-2.5 rounded-lg transition-colors ${
                                        isDarkMode
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black opacity-50"></div>
                        <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Chỉnh sửa sản phẩm</h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleUpdateProduct} className="space-y-4">
                                {/* Tên sản phẩm */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        value={editingProduct.name}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                </div>

                                {/* Giá */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giá</label>
                                    <input
                                        type="text"
                                        value={formatPrice(editingProduct.price)}
                                        onChange={(e) => {
                                            const unformattedValue = unformatPrice(e.target.value);
                                            if (/^\d*$/.test(unformattedValue)) {
                                                setEditingProduct({
                                                    ...editingProduct,
                                                    price: unformattedValue
                                                });
                                            }
                                        }}
                                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                </div>

                                {/* Danh mục */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Danh mục</label>
                                    <select
                                        value={editingProduct.category}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.categoryID} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Đối tượng */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Đối tượng</label>
                                    <select
                                        value={editingProduct.target}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, target: e.target.value })}
                                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    >
                                        {targets.map(target => (
                                            <option key={target.targetID} value={target.name}>{target.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Upload ảnh */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ảnh sản phẩm</label>
                                    <ImageUpload
                                        currentImage={editingProduct.thumbnail}
                                        onImageUpload={(imageUrls) => {
                                            setUploadedImages(imageUrls);
                                            setEditingProduct({
                                                ...editingProduct,
                                                thumbnail: imageUrls[0] || '' // Sử dụng ảnh đầu tiên làm thumbnail
                                            });
                                        }}
                                    />
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                                    <textarea
                                        value={editingProduct.description}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        rows="4"
                                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700`}
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal màu và size */}
            {isColorSizeModalOpen && colorSizeDetail && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black opacity-50"></div>
                        <div className={`relative w-full max-w-4xl p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                            }`}>
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Quản lý Màu & Size - {colorSizeDetail.name}</h3>
                                <button
                                    onClick={() => setIsColorSizeModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                                {colorSizeDetail.colors?.map((color, colorIndex) => (
                                    <div key={colorIndex} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">Màu: {color.colorName}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setUploadingColorImages(colorIndex)}
                                                    className={`px-3 py-1 rounded text-sm ${isDarkMode
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'bg-green-500 hover:bg-green-600'
                                                        } text-white`}
                                                >
                                                    Cập nhật ảnh
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteColor(colorIndex)}
                                                    className={`px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm flex items-center gap-1`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Xóa màu
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sizes Grid */}
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {color.sizes.map((size, sizeIndex) => (
                                                <div key={sizeIndex} className={`p-2 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">Size {size.size}</span>
                                                        <span className="text-xs text-gray-500">SKU: {size.SKU}</span>
                                                        {editingSize === `${colorIndex}-${sizeIndex}` ? (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className={`w-20 px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'
                                                                        }`}
                                                                    defaultValue={size.stock}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleUpdateStock(colorIndex, sizeIndex, e.target.value);
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        handleUpdateStock(colorIndex, sizeIndex, e.target.value);
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    className="text-green-500 hover:text-green-600"
                                                                    onClick={(e) => {
                                                                        const input = e.target.previousSibling;
                                                                        handleUpdateStock(colorIndex, sizeIndex, input.value);
                                                                    }}
                                                                >
                                                                    ✓
                                                                </button>
                                                                <button
                                                                    className="text-red-500 hover:text-red-600"
                                                                    onClick={() => setEditingSize(null)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span
                                                                    className="text-green-500 cursor-pointer hover:text-green-600"
                                                                    onClick={() => setEditingSize(`${colorIndex}-${sizeIndex}`)}
                                                                >
                                                                    {size.stock} cái
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Images Grid với chức năng upload */}
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h5 className="font-medium">Hình ảnh</h5>
                                                <button
                                                    onClick={() => setUploadingColorImages(colorIndex)}
                                                    className={`px-3 py-1 rounded text-sm ${isDarkMode
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'bg-green-500 hover:bg-green-600'
                                                        } text-white`}
                                                >
                                                    Cập nhật ảnh
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                {color.images.map((image, imageIndex) => (
                                                    <div key={imageIndex} className="relative group">
                                                        <img
                                                            src={image}
                                                            alt={`${colorSizeDetail.name} - ${color.colorName} - ${imageIndex + 1}`}
                                                            className="w-full h-32 object-cover rounded"
                                                        />
                                                        <button
                                                            onClick={() => handleDeleteColorImage(colorIndex, imageIndex)}
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Upload Modal */}
                                        {uploadingColorImages === colorIndex && (
                                            <div className="fixed inset-0 z-[60] flex items-center justify-center">
                                                <div className="absolute inset-0 bg-black opacity-50"></div>
                                                <div className={`relative w-full max-w-lg p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                                                    }`}>
                                                    <h3 className="text-lg font-medium mb-4">Cập nhật hình ảnh cho màu {color.colorName}</h3>
                                                    <MultipleImageUpload
                                                        currentImages={color.images}
                                                        onImageUpload={(imageUrls) => handleUpdateColorImages(colorIndex, imageUrls)}
                                                    />
                                                    <div className="mt-4 flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => setUploadingColorImages(null)}
                                                            className={`px-4 py-2 rounded ${isDarkMode
                                                                    ? 'bg-gray-600 hover:bg-gray-700'
                                                                    : 'bg-gray-200 hover:bg-gray-300'
                                                                }`}
                                                        >
                                                            Đóng
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-6 flex justify-between">
                                <button
                                    onClick={() => setIsAddColorModalOpen(true)}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-green-500 hover:bg-green-600'
                                        } text-white`}
                                >
                                    Thêm màu mới
                                </button>
                                <button
                                    onClick={() => setIsColorSizeModalOpen(false)}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode
                                            ? 'bg-gray-600 hover:bg-gray-700'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thêm màu mới */}
            {isAddColorModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className={`relative w-full max-w-lg p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                        }`}>
                        <h3 className="text-lg font-medium mb-4">Thêm màu mới</h3>

                        {/* Form thêm màu */}
                        <div className="space-y-4">
                            {/* Tên màu */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên màu</label>
                                <input
                                    type="text"
                                    value={newColorData.colorName}
                                    onChange={(e) => setNewColorData({
                                        ...newColorData,
                                        colorName: e.target.value
                                    })}
                                    className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                    placeholder="Nhập tên màu..."
                                />
                            </div>

                            {/* Sizes */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Số lượng theo size</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {newColorData.sizes.map((size, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <span className="w-8">Size {size.size}:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={size.stock}
                                                onChange={(e) => {
                                                    const updatedSizes = [...newColorData.sizes];
                                                    updatedSizes[index].stock = parseInt(e.target.value);
                                                    setNewColorData({
                                                        ...newColorData,
                                                        sizes: updatedSizes
                                                    });
                                                }}
                                                className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upload ảnh */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Hình ảnh</label>
                                <MultipleImageUpload
                                    currentImages={newColorData.images}
                                    onImageUpload={(imageUrls) => setNewColorData({
                                        ...newColorData,
                                        images: imageUrls
                                    })}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                onClick={() => setIsAddColorModalOpen(false)}
                                className={`px-4 py-2 rounded ${isDarkMode
                                        ? 'bg-gray-600 hover:bg-gray-700'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddNewColor}
                                disabled={loading}
                                className={`px-4 py-2 rounded ${isDarkMode
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-green-500 hover:bg-green-600'
                                    } text-white`}
                            >
                                {loading ? 'Đang thêm...' : 'Thêm màu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thêm sản phẩm mới */}
            {isAddProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
                    <div className={`relative w-full max-w-4xl p-8 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Thêm sản phẩm mới
                                </h3>
                                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Điền đầy đủ thông tin để tạo sản phẩm mới
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddProductModalOpen(false)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode 
                                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-6">
                            {/* Thông tin cơ bản */}
                            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Thông tin cơ bản
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Tên sản phẩm
                                        </label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className={`w-full p-3 rounded-lg border transition-colors ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                            placeholder="Nhập tên sản phẩm..."
                                />
                            </div>
                            <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Giá
                                        </label>
                                <input
                                    type="text"
                                    value={formatPrice(newProduct.price)}
                                    onChange={(e) => {
                                        const unformattedValue = unformatPrice(e.target.value);
                                        if (/^\d*$/.test(unformattedValue)) {
                                            setNewProduct({
                                                ...newProduct,
                                                price: unformattedValue
                                            });
                                        }
                                    }}
                                            className={`w-full p-3 rounded-lg border transition-colors ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                            placeholder="Nhập giá sản phẩm..."
                                />
                            </div>
                                <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Danh mục
                                        </label>
                                    <select
                                        value={newProduct.categoryID}
                                        onChange={(e) => setNewProduct({ ...newProduct, categoryID: e.target.value })}
                                            className={`w-full p-3 rounded-lg border transition-colors ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat.categoryID} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Đối tượng
                                        </label>
                                    <select
                                        value={newProduct.targetID}
                                        onChange={(e) => setNewProduct({ ...newProduct, targetID: e.target.value })}
                                            className={`w-full p-3 rounded-lg border transition-colors ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                    >
                                        <option value="">Chọn đối tượng</option>
                                        {targets.map(target => (
                                            <option key={target.targetID} value={target.name}>{target.name}</option>
                                        ))}
                                    </select>
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả và ảnh đại diện */}
                            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Mô tả và ảnh đại diện
                                </h4>
                                <div className="space-y-6">
                            <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Mô tả
                                        </label>
                                        <textarea
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            rows="4"
                                            className={`w-full p-3 rounded-lg border transition-colors ${
                                                isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                            placeholder="Nhập mô tả sản phẩm..."
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Ảnh đại diện
                                        </label>
                                <ImageUpload
                                    currentImage={newProduct.thumbnail}
                                    onImageUpload={(imageUrls) => {
                                        setNewProduct({
                                            ...newProduct,
                                            thumbnail: imageUrls[0] || ''
                                        });
                                    }}
                                />
                            </div>
                                </div>
                            </div>

                            {/* Màu sắc và kích thước */}
                            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-center mb-4">
                            <div>
                                        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Màu sắc và kích thước
                                        </h4>
                                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Thêm các màu sắc và kích thước cho sản phẩm
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewProduct({
                                                ...newProduct,
                                                colors: [...newProduct.colors, {
                                                    colorName: '',
                                                    images: [],
                                                    sizes: [
                                                        { size: 'S', stock: 0 },
                                                        { size: 'M', stock: 0 },
                                                        { size: 'L', stock: 0 }
                                                    ]
                                                }]
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg transition-colors ${
                                            isDarkMode
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-green-500 hover:bg-green-600'
                                        } text-white flex items-center gap-2`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Thêm màu mới
                                    </button>
                                </div>
                                <div className="space-y-6">
                                {newProduct.colors.map((color, colorIndex) => (
                                        <div key={colorIndex} className={`p-6 rounded-xl relative ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                        {newProduct.colors.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedColors = newProduct.colors.filter((_, index) => index !== colorIndex);
                                                    setNewProduct({ ...newProduct, colors: updatedColors });
                                                }}
                                                    className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                                                        isDarkMode
                                                            ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                                                            : 'bg-red-100 hover:bg-red-200 text-red-600'
                                                    }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}

                                            <div className="space-y-4">
                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Tên màu
                                                    </label>
                                        <input
                                            type="text"
                                                        placeholder="Nhập tên màu..."
                                            value={color.colorName}
                                            onChange={(e) => {
                                                const updatedColors = [...newProduct.colors];
                                                updatedColors[colorIndex].colorName = e.target.value;
                                                setNewProduct({ ...newProduct, colors: updatedColors });
                                            }}
                                                        className={`w-full p-3 rounded-lg border transition-colors ${
                                                            isDarkMode
                                                                ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Hình ảnh màu
                                                    </label>
                                        <MultipleImageUpload
                                            currentImages={color.images}
                                            onImageUpload={(imageUrls) => {
                                                const updatedColors = [...newProduct.colors];
                                                updatedColors[colorIndex].images = imageUrls;
                                                setNewProduct({ ...newProduct, colors: updatedColors });
                                            }}
                                        />
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Số lượng theo size
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-4">
                                            {color.sizes.map((size, sizeIndex) => (
                                                <div key={sizeIndex}>
                                                                <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    Size {size.size}
                                                                </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={size.stock}
                                                        onChange={(e) => {
                                                            const updatedColors = [...newProduct.colors];
                                                            updatedColors[colorIndex].sizes[sizeIndex].stock = parseInt(e.target.value);
                                                            setNewProduct({ ...newProduct, colors: updatedColors });
                                                        }}
                                                                    className={`w-full p-3 rounded-lg border transition-colors ${
                                                                        isDarkMode
                                                                            ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                                            : 'bg-white border-gray-300 hover:border-gray-400'
                                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    />
                                                </div>
                                            ))}
                                                    </div>
                                                </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddProductModalOpen(false)}
                                    className={`px-6 py-2.5 rounded-lg transition-colors ${
                                        isDarkMode
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-2.5 rounded-lg transition-colors ${
                                        isDarkMode
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-green-500 hover:bg-green-600'
                                    } text-white flex items-center gap-2`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Đang tạo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Tạo sản phẩm</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
