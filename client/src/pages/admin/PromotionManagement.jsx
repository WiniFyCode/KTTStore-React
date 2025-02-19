import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiPercent, FiCalendar, FiTag, FiPackage, FiGrid, FiZap, FiArrowRight, FiClock, FiXCircle, FiX, FiInbox, FiPower } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useTheme } from '../../contexts/AdminThemeContext';
import { formatDate } from '../../utils/dateUtils';

const PromotionManagement = () => {
    const { isDarkMode } = useTheme();

    // ===== STATES =====
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');

    // ===== STATE CHO TÌM KIẾM VÀ LỌC =====
    const [filters, setFilters] = useState({
        status: 'all',      // all/active/inactive/expired
        type: 'all',        // all/normal/flash-sale
        sort: 'none',       // none/createAt/endDate/discountPercent
        order: 'desc'       // asc/desc
    });
    const [searchTerm, setSearchTerm] = useState('');

    // ===== STATE CHO PHÂN TRANG =====
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        discountPercent: 0,
        startDate: '',
        endDate: '',
        status: 'active',
        type: 'normal',
        products: [],
        categories: []
    });

    // Thêm state thống kê
    const [promotionStats, setPromotionStats] = useState({
        totalPromotions: 0,
        activePromotions: 0,
        upcomingPromotions: 0,
        expiredPromotions: 0,
        totalDiscount: 0,
        totalProducts: 0
    });

    // ===== EFFECTS =====
    useEffect(() => {
        fetchPromotions();
        fetchProducts();
        fetchCategories();
    }, []);

    // ===== API CALLS =====
    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/promotions/all');
            if (response.data) {
                setPromotions(response.data.promotions || []);
                // Cập nhật stats trực tiếp từ response
                setPromotionStats({
                    totalPromotions: response.data.stats.totalPromotions,
                    activePromotions: response.data.stats.activePromotions,
                    upcomingPromotions: response.data.stats.upcomingPromotions,
                    expiredPromotions: response.data.stats.endedPromotions,
                    // Giữ lại các trường khác nếu cần
                    totalDiscount: 0,
                    totalProducts: 0
                });
            } else {
                toast.error('Dữ liệu không hợp lệ');
                setPromotions([]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tải danh sách khuyến mãi');
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/products?limit=1000');
            if (response.data && response.data.products) {
                setProducts(response.data.products || []);
            } else {
                toast.error('Dữ liệu sản phẩm không hợp lệ');
            }
        } catch (error) {
            toast.error('Không thể tải danh sách sản phẩm');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                toast.error('Dữ liệu danh mục không hợp lệ');
            }
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục');
        }
    };

    const handleCreatePromotion = async () => {
        try {
            // Validate Flash Sale
            if (formData.type === 'flash-sale') {
                const startDate = new Date(formData.startDate);
                const endDate = new Date(formData.endDate);
                const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

                if (diffDays > 30) {
                    toast.error('Flash Sale không thể kéo dài quá 30 ngày');
                    return;
                }
            }

            const response = await axios.post('/api/admin/promotions/create', formData);
            toast.success('Tạo khuyến mãi thành công');
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tạo khuyến mãi');
        }
    };

    const handleUpdatePromotion = async () => {
        try {
            await axios.put(`/api/admin/promotions/update/${editingPromotion.promotionID}`, formData);
            toast.success('Cập nhật khuyến mãi thành công');
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật khuyến mãi');
        }
    };

    const handleDeletePromotion = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
            try {
                await axios.delete(`/api/admin/promotions/delete/${id}`);
                toast.success('Xóa khuyến mãi thành công');
                fetchPromotions();
            } catch (error) {
                console.error('Lỗi khi xóa khuyến mãi:', error);
                toast.error('Không thể xóa khuyến mãi');
            }
        }
    };

    // ===== HANDLERS =====
    const handleEditClick = (promotion) => {
        setEditingPromotion(promotion);
        setFormData({
            name: promotion.name,
            description: promotion.description,
            discountPercent: promotion.discountPercent,
            startDate: new Date(promotion.startDate).toISOString().split('T')[0],
            endDate: new Date(promotion.endDate).toISOString().split('T')[0],
            status: promotion.status || 'active',
            type: promotion.type || 'normal',
            products: promotion.products.map(product => product._id || product),
            categories: promotion.categories.map(category => category.name || category)
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingPromotion(null);
        setFormData({
            name: '',
            description: '',
            discountPercent: 0,
            startDate: '',
            endDate: '',
            status: 'active',
            type: 'normal',
            products: [],
            categories: []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingPromotion) {
            await handleUpdatePromotion();
        } else {
            await handleCreatePromotion();
        }
    };

    const handleToggleStatus = async (promotionId) => {
        try {
            const promotion = promotions.find(p => p.promotionID === promotionId);
            if (!promotion) return;

            const response = await axios.patch(`/api/admin/promotions/toggle-status/${promotion.promotionID}`);
            
            if (response.data && response.data.success) {
                // Cập nhật UI ngay lập tức
                setPromotions(promotions.map(p => 
                    p.promotionID === promotionId 
                        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
                        : p
                ));

                // Cập nhật lại stats
                setPromotionStats(prevStats => ({
                    ...prevStats,
                    // Nếu đang active -> inactive: giảm active đi 1
                    // Nếu đang inactive -> active: tăng active lên 1
                    activePromotions: prevStats.activePromotions + (promotion.status === 'active' ? -1 : 1)
                }));

                toast.success(response.data.message);
            } else {
                toast.error('Không thể thay đổi trạng thái khuyến mãi');
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái khuyến mãi:', error);
            toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái khuyến mãi');
        }
    };

    // ===== FILTER & SORT =====
    const getFilteredAndSortedPromotions = () => {
        const now = new Date();

        // Lọc theo từ khóa tìm kiếm
        let filteredPromotions = promotions.filter(promo =>
            promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Lọc theo loại
        if (filters.type !== 'all') {
            filteredPromotions = filteredPromotions.filter(promo => promo.type === filters.type);
        }

        // Lọc theo trạng thái
        if (filters.status !== 'all') {
            filteredPromotions = filteredPromotions.filter(promo => {
                const startDate = new Date(promo.startDate);
                const endDate = new Date(promo.endDate);

                switch (filters.status) {
                    case 'active':
                        return promo.status === 'active' && startDate <= now && endDate >= now;
                    case 'inactive':
                        return promo.status === 'inactive';
                    case 'expired':
                        return endDate < now;
                    default:
                        return true;
                }
            });
        }

        // Sắp xếp
        if (filters.sort !== 'none' && filters.order !== 'none') {
            filteredPromotions.sort((a, b) => {
                let comparison = 0;
                switch (filters.sort) {
                    case 'createAt':
                        comparison = new Date(a.createdAt) - new Date(b.createdAt);
                        break;
                    case 'endDate':
                        comparison = new Date(a.endDate) - new Date(b.endDate);
                        break;
                    case 'discountPercent':
                        comparison = a.discountPercent - b.discountPercent;
                        break;
                    default:
                        comparison = 0;
                }
                return filters.order === 'asc' ? comparison : -comparison;
            });
        }

        return filteredPromotions;
    };

    // ===== PAGINATION =====
    const filteredPromotions = getFilteredAndSortedPromotions();
    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
    const currentPromotions = filteredPromotions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const renderPageButton = (pageNum) => (
            <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-colors ${currentPage === pageNum
                        ? isDarkMode
                            ? 'bg-green-500 text-white'
                            : 'bg-green-500 text-white'
                        : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
            >
                {pageNum}
            </button>
        );

        const renderEllipsis = (key) => (
            <span
                key={key}
                className={`px-3 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
            >
                ...
            </span>
        );

        let buttons = [];
        if (totalPages <= 7) {
            // Show all pages if total pages is 7 or less
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(renderPageButton(i));
            }
        } else {
            // Always show first page
            buttons.push(renderPageButton(1));

            if (currentPage > 3) {
                // Show ellipsis if current page is far from start
                buttons.push(renderEllipsis('start-ellipsis'));
            }

            // Show pages around current page
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
                buttons.push(renderPageButton(i));
            }

            if (currentPage < totalPages - 2) {
                // Show ellipsis if current page is far from end
                buttons.push(renderEllipsis('end-ellipsis'));
            }

            // Always show last page
            buttons.push(renderPageButton(totalPages));
        }

        return (
            <div className="flex flex-col items-center gap-4 mt-8">
                <div className="flex items-center gap-2">
                    {/* Previous Page */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`h-10 px-4 rounded-lg transition-colors ${currentPage === 1
                                ? isDarkMode
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Trước
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                        {buttons}
                    </div>

                    {/* Next Page */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`h-10 px-4 rounded-lg transition-colors ${currentPage === totalPages
                                ? isDarkMode
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Sau
                    </button>
                </div>

                {/* Page Info */}
                <div className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Trang {currentPage} / {totalPages}
                </div>
            </div>
        );
    };

    // Lọc sản phẩm theo từ khóa tìm kiếm
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.productID.toString().includes(productSearch)
    );

    // Lọc danh mục theo từ khóa tìm kiếm
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    // Thêm hàm tính giá sau khi giảm
    const calculateDiscountedPrice = (originalPrice, discountPercent) => {
        const discount = (originalPrice * discountPercent) / 100;
        return originalPrice - discount;
    };

    // Hàm format giá tiền
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // ===== RENDER COMPONENTS =====
    const renderPromotionModal = () => {
        if (!isModalOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>

                <div className="flex min-h-full items-center justify-center p-4">
                    <div className={`relative w-full max-w-4xl rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } transition-all`}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                    }`}>
                                    {editingPromotion ? (
                                        <FiEdit2 className="w-5 h-5 text-blue-500" />
                                    ) : (
                                        <FiPlus className="w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold">
                                    {editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Loại khuyến mãi */}
                                <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Loại khuyến mãi
                                            </label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                disabled={editingPromotion}
                                            >
                                                <option value="normal">📌 Khuyến mãi thường</option>
                                                <option value="flash-sale">⚡ Flash Sale</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Trạng thái
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                            >
                                                <option value="active">✅ Hoạt động</option>
                                                <option value="inactive">❌ Không hoạt động</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin cơ bản */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <FiTag className="w-5 h-5" />
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Tên khuyến mãi
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                placeholder="Nhập tên khuyến mãi..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Mô tả
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                rows="3"
                                                placeholder="Nhập mô tả chi tiết..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Phần trăm giảm giá (%)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.discountPercent}
                                                    onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })}
                                                    className={`w-full p-3 pl-12 rounded-lg border transition-colors ${isDarkMode
                                                            ? 'bg-gray-600 border-gray-500 text-white'
                                                            : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    min="0"
                                                    max="100"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FiPercent className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thời gian */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <FiCalendar className="w-5 h-5" />
                                        Thời gian áp dụng
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Ngày bắt đầu
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="datetime-local"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                    className={`w-full p-3 pl-12 rounded-lg border transition-colors ${isDarkMode
                                                            ? 'bg-gray-600 border-gray-500 text-white'
                                                            : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    required
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FiCalendar className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Ngày kết thúc
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="datetime-local"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                    className={`w-full p-3 pl-12 rounded-lg border transition-colors ${isDarkMode
                                                            ? 'bg-gray-600 border-gray-500 text-white'
                                                            : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    required
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FiCalendar className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Phạm vi áp dụng */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <FiGrid className="w-5 h-5" />
                                        Phạm vi áp dụng
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Sản phẩm */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="font-medium">
                                                    Sản phẩm áp dụng
                                                </label>
                                                <span className="text-base text-gray-500">
                                                    Đã chọn: {formData.products.length}
                                                </span>
                                            </div>
                                            <div className="relative mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tìm kiếm sản phẩm..."
                                                    value={productSearch}
                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                    className={`w-full p-3 pl-10 rounded-lg border transition-colors ${isDarkMode
                                                            ? 'bg-gray-600 border-gray-500 text-white'
                                                            : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                />
                                                <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            </div>
                                            <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                                }`}>
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    {products.filter(product =>
                                                        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                                        product.productID.toString().includes(productSearch)
                                                    ).map(product => (
                                                        <div
                                                            key={product._id}
                                                            className={`flex items-center p-3 border-b last:border-b-0 transition-colors ${isDarkMode
                                                                    ? 'border-gray-600 hover:bg-gray-600'
                                                                    : 'border-gray-200 hover:bg-gray-50'
                                                                } ${formData.products.includes(product._id)
                                                                    ? isDarkMode
                                                                        ? 'bg-gray-700'
                                                                        : 'bg-green-50'
                                                                    : ''
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.products.includes(product._id)}
                                                                onChange={(e) => {
                                                                    const newProducts = e.target.checked
                                                                        ? [...formData.products, product._id]
                                                                        : formData.products.filter(id => id !== product._id);
                                                                    setFormData({ ...formData, products: newProducts });
                                                                }}
                                                                className="mr-3 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium">{product.name}</div>
                                                                <div className="text-base text-gray-500">
                                                                    ID: {product.productID}
                                                                </div>
                                                                <div className="text-base mt-1">
                                                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                                        Giá gốc: {formatPrice(product.price)}đ
                                                                    </span>
                                                                    {formData.discountPercent > 0 && formData.products.includes(product._id) && (
                                                                        <span className="ml-2 text-green-500">
                                                                            → {formatPrice(calculateDiscountedPrice(product.price, formData.discountPercent))}đ
                                                                            <span className="ml-1 text-red-500">(-{formData.discountPercent}%)</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Danh mục */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="font-medium">
                                                    Danh mục áp dụng
                                                </label>
                                                <span className="text-base text-gray-500">
                                                    Đã chọn: {formData.categories.length}
                                                </span>
                                            </div>
                                            <div className="relative mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tìm kiếm danh mục..."
                                                    value={categorySearch}
                                                    onChange={(e) => setCategorySearch(e.target.value)}
                                                    className={`w-full p-3 pl-10 rounded-lg border transition-colors ${isDarkMode
                                                            ? 'bg-gray-600 border-gray-500 text-white'
                                                            : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                />
                                                <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            </div>
                                            <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                                }`}>
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    {categories.filter(category =>
                                                        category.name.toLowerCase().includes(categorySearch.toLowerCase())
                                                    ).map(category => (
                                                        <div
                                                            key={category._id}
                                                            className={`flex items-center p-3 border-b last:border-b-0 transition-colors ${isDarkMode
                                                                    ? 'border-gray-600 hover:bg-gray-600'
                                                                    : 'border-gray-200 hover:bg-gray-50'
                                                                } ${formData.categories.includes(category.name)
                                                                    ? isDarkMode
                                                                        ? 'bg-gray-700'
                                                                        : 'bg-green-50'
                                                                    : ''
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.categories.includes(category.name)}
                                                                onChange={(e) => {
                                                                    const newCategories = e.target.checked
                                                                        ? [...formData.categories, category.name]
                                                                        : formData.categories.filter(name => name !== category.name);
                                                                    setFormData({ ...formData, categories: newCategories });
                                                                }}
                                                                className="mr-3 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                            />
                                                            <div>
                                                                <div className="font-medium">{category.name}</div>
                                                                <div className="text-base text-gray-500">
                                                                    ID: {category.categoryID || category._id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin Flash Sale */}
                                {formData.type === 'flash-sale' && (
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
                                        }`}>
                                        <h3 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'
                                            }`}>
                                            <FiZap size={24} />
                                            Thông tin Flash Sale
                                        </h3>
                                        <ul className={`space-y-2 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
                                            }`}>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                Flash Sale chỉ diễn ra trong 2 khung giờ: 12h-14h và 20h-22h
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                Thời gian Flash Sale không được quá 30 ngày
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                Nên chọn mức giảm giá hấp dẫn (30-70%)
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                Chỉ áp dụng cho một số sản phẩm được chọn
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDarkMode
                                        ? 'bg-green-600 text-white hover:bg-green-500'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                            >
                                {editingPromotion ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Thêm component thống kê
    const renderStats = () => {
        const stats = [
            {
                title: 'Tổng khuyến mãi',
                value: promotionStats.totalPromotions,
                icon: <FiTag className="w-6 h-6" />,
                color: 'blue'
            },
            {
                title: 'Đang hoạt động',
                value: promotionStats.activePromotions,
                icon: <FiZap className="w-6 h-6" />,
                color: 'green'
            },
            {
                title: 'Sắp diễn ra',
                value: promotionStats.upcomingPromotions,
                icon: <FiClock className="w-6 h-6" />,
                color: 'yellow'
            },
            {
                title: 'Đã kết thúc',
                value: promotionStats.expiredPromotions,
                icon: <FiXCircle className="w-6 h-6" />,
                color: 'red'
            }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                                {React.cloneElement(stat.icon, {
                                    className: `text-${stat.color}-600`
                                })}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                            
                            <div className={`h-2 rounded-full bg-${stat.color}-100`}>
                                <div
                                    className={`h-2 rounded-full bg-${stat.color}-500`}
                                    style={{
                                        width: `${(stat.value / promotionStats.totalPromotions) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Cải thiện phần filters
    const renderFilters = () => {
        return (
            <div className={`p-6 rounded-xl shadow-sm mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex flex-wrap gap-4">
                    {/* Tìm kiếm */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nhập tên hoặc mô tả khuyến mãi..."
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

                    {/* Lọc theo trạng thái */}
                    <select
                        className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="all">🔄 Tất cả trạng thái</option>
                        <option value="active">✅ Đang hoạt động</option>
                        <option value="inactive">❌ Không hoạt động</option>
                        <option value="expired">⏰ Đã hết hạn</option>
                    </select>

                    {/* Lọc theo loại khuyến mãi */}
                    <select
                        className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                        <option value="all">🏷️ Tất cả loại</option>
                        <option value="normal">📌 Khuyến mãi thường</option>
                        <option value="flash-sale">⚡ Flash Sale</option>
                    </select>

                    {/* Sắp xếp */}
                    <select
                        className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        value={filters.sort}
                        onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                    >
                        <option value="createAt">📅 Ngày tạo</option>
                        <option value="endDate">⏰ Ngày kết thúc</option>
                        <option value="discountPercent">💰 Phần trăm giảm</option>
                    </select>

                    {/* Thứ tự sắp xếp */}
                    <select
                        className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        value={filters.order}
                        onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value }))}
                    >
                        <option value="desc">⬇️ Giảm dần</option>
                        <option value="asc">⬆️ Tăng dần</option>
                    </select>
                </div>
            </div>
        );
    };

    const renderPromotionCard = (promotion) => {
        const isExpired = new Date(promotion.endDate) < new Date();
        const isActive = promotion.status === 'active' && !isExpired;
        const currentDate = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        const isUpcoming = startDate > currentDate;

        return (
            <div className={`rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                {/* Status Badge */}
                <div className="absolute top-5 right-5">
                    {isUpcoming ? (
                        <span className="px-3 py-1.5 rounded-full text-base font-medium bg-blue-100 text-blue-800">
                            Sắp diễn ra
                        </span>
                    ) : isActive ? (
                        <span className="px-3 py-1.5 rounded-full text-base font-medium bg-green-100 text-green-800">
                            Đang diễn ra
                        </span>
                    ) : isExpired ? (
                        <span className="px-3 py-1.5 rounded-full text-base font-medium bg-red-100 text-red-800">
                            Đã kết thúc
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 rounded-full text-base font-medium bg-red-100 text-red-800">
                            Không hoạt động
                        </span>
                    )}
                </div>

                {/* Type Badge */}
                <div className={`absolute -top-2 -left-2 px-4 py-1.5 rounded-lg shadow-md transform -rotate-12 ${promotion.type === 'flash-sale'
                        ? 'bg-red-500 text-white'
                        : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {promotion.type === 'flash-sale' ? (
                        <div className="flex items-center gap-2">
                            <FiZap size={18} />
                            <span className="text-base font-medium">Flash Sale</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <FiTag size={18} />
                            <span className="text-base font-medium">Khuyến mãi</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mt-8 m-6">
                    {/* Header */}
                    <div className="mb-4">
                        <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {promotion.name}
                        </h3>
                        <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {promotion.description}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                            <div className="text-center px-4">
                                <span className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}>
                                    {promotion.discountPercent}%
                                </span>
                                <span className={`block text-base mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Giảm giá
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FiPackage className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                                    <div>
                                        <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            {promotion.products.length}
                                        </span>
                                        <span className={`ml-1 text-base ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            sản phẩm
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiGrid className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                                    <div>
                                        <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            {promotion.categories.length}
                                        </span>
                                        <span className={`ml-1 text-base ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            danh mục
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className={`text-base font-medium block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Bắt đầu
                                </span>
                                <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {formatDate(promotion.startDate)}
                                </span>
                            </div>
                            <div className="flex-1 mx-4 flex items-center justify-center">
                                <div className={`h-1 w-full ${isActive
                                        ? 'bg-green-500'
                                        : isExpired
                                            ? 'bg-gray-300'
                                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}></div>
                                <FiArrowRight className={`mx-2 ${isActive
                                        ? 'text-green-500'
                                        : isExpired
                                            ? 'text-gray-300'
                                            : isDarkMode ? 'text-gray-600' : 'text-gray-200'
                                    }`} size={24} />
                                <div className={`h-1 w-full ${isActive
                                        ? 'bg-green-500'
                                        : isExpired
                                            ? 'bg-gray-300'
                                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}></div>
                            </div>
                            <div>
                                <span className={`text-base font-medium block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Kết thúc
                                </span>
                                <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {formatDate(promotion.endDate)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t dark:border-gray-700">
                        <button
                            onClick={() => handleToggleStatus(promotion.promotionID)}
                            className={`p-2.5 rounded-lg transition-colors ${
                                promotion.status === 'active'
                                    ? isDarkMode
                                        ? 'bg-green-400/10 hover:bg-green-400/20 text-green-400'
                                        : 'bg-green-100 hover:bg-green-200 text-green-600'
                                    : isDarkMode
                                        ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                            }`}
                            title={promotion.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                            <FiPower className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => handleEditClick(promotion)}
                            className={`p-2.5 rounded-lg transition-colors ${
                                isDarkMode
                                    ? 'bg-blue-400/10 hover:bg-blue-400/20 text-blue-400'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                            }`}
                            title="Chỉnh sửa"
                        >
                            <FiEdit2 className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => handleDeletePromotion(promotion._id)}
                            className={`p-2.5 rounded-lg transition-colors ${
                                isDarkMode
                                    ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                            }`}
                            title="Xóa"
                        >
                            <FiTrash2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-5xl font-bold mb-3">Quản lý khuyến mãi</h1>
                    <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quản lý và theo dõi các chương trình khuyến mãi của cửa hàng
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center justify-center px-6 py-3 text-lg rounded-lg transition-colors duration-300 bg-green-500 hover:bg-green-600 text-white"
                >
                    <FiPlus className="mr-2 w-6 h-6" /> Thêm khuyến mãi
                </button>
            </div>

            {/* Thêm phần thống kê */}
            {renderStats()}

            {renderFilters()}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex space-x-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-5 h-5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-5 h-5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                </div>
            ) : currentPromotions.length === 0 ? (
                <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <FiInbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">Không có khuyến mãi nào</p>
                    <p className="mt-2 text-lg">Hãy thêm khuyến mãi mới để bắt đầu</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentPromotions.map(promotion => renderPromotionCard(promotion))}
                </div>
            )}
            {renderPagination()}
            {renderPromotionModal()}
        </div>
    );
};

export default PromotionManagement;
