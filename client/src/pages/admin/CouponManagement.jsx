import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiTag, FiPercent, FiCalendar, FiDollarSign, FiX, FiPower, FiEye, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/AdminThemeContext';
import { formatDate } from '../../utils/dateUtils';

const CouponManagement = () => {
    const { isDarkMode } = useTheme();

    // ===== STATES =====
    const [coupons, setCoupons] = useState([]);// Lưu trữ danh sách mã giảm giá
    const [loading, setLoading] = useState(true);// Trạng thái loading
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [stats, setStats] = useState({
        totalCoupons: 0,
        totalActiveCoupons: 0,
        totalExpiredCoupons: 0,
        totalUsedCount: 0
    });

    // ===== STATE CHO DANH SÁCH CATEGORIES =====
    const [categories, setCategories] = useState([]);

    // ===== STATE CHO TÌM KIẾM VÀ LỌC =====
    const [filters, setFilters] = useState({
        status: 'all',      // all/active/expired/used
        type: 'all',        // all/percentage/fixed
        couponType: 'all',  // all/weekend/member/holiday/seasonal/bundle/new_user/flash_sale/special_event/category/clearance
        sort: 'createAt',   // createAt/endDate/usageLimit/discountValue/code
        order: 'desc'       // asc/desc
    });
    const [searchTerm, setSearchTerm] = useState('');

    // ===== STATE CHO PHÂN TRANG =====
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        startDate: '',
        endDate: '',
        usageLimit: 0,
        totalUsageLimit: 0,
        couponType: 'special_event',
        appliedCategories: []
    });

    // ===== NEW STATE =====
    const [categorySearch, setCategorySearch] = useState('');
    const [previewMode, setPreviewMode] = useState(false);

    // ===== EFFECTS =====
    useEffect(() => {
        fetchCoupons();
        fetchCategories();
    }, []);

    // ===== API CALLS =====
    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/admin/categories');
            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách danh mục(CouponManagement.jsx):', error);
            toast.error('Không thể tải danh sách danh mục');
        }
    };

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/coupons/admin/coupons');

            if (response.data) {
                setCoupons(response.data.coupons || []);
                setStats(response.data.stats || {
                    totalCoupons: 0,
                    totalActiveCoupons: 0,
                    totalExpiredCoupons: 0,
                    totalUsedCount: 0
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách mã giảm giá(CouponManagement.jsx):', error);
            toast.error(error.response?.data?.message || 'Không thể tải danh sách mã giảm giá');
            setCoupons([]);
            setStats({
                totalCoupons: 0,
                totalActiveCoupons: 0,
                totalExpiredCoupons: 0,
                totalUsedCount: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async () => {
        try {
            // Đảm bảo các trường bắt buộc có giá trị
            if (!formData.code || !formData.description || !formData.discountValue ||
                !formData.startDate || !formData.endDate || !formData.usageLimit || !formData.totalUsageLimit) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            // Kiểm tra giá trị hợp lệ
            if (formData.discountType === 'percentage' && formData.discountValue > 100) {
                toast.error('Giá trị giảm giá theo phần trăm không được vượt quá 100%');
                return;
            }

            if (formData.usageLimit < 1 || formData.totalUsageLimit < 1) {
                toast.error('Số lần sử dụng phải lớn hơn 0');
                return;
            }

            // Gửi request tạo coupon
            await axios.post('/api/admin/coupons/admin/coupons/create', {
                ...formData,
                code: formData.code.toUpperCase(),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                usageLimit: parseInt(formData.usageLimit), // Đảm bảo là số nguyên
                totalUsageLimit: parseInt(formData.totalUsageLimit), // Đảm bảo là số nguyên
                minOrderValue: parseInt(formData.minOrderValue) || 0,
                maxDiscountAmount: parseInt(formData.maxDiscountAmount) || 0,
                minimumQuantity: parseInt(formData.minimumQuantity) || 1
            });

            toast.success('Tạo mã giảm giá thành công');
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error) {
            console.error('Lỗi khi tạo mã giảm giá(CouponManagement.jsx):', error);
            toast.error(error.response?.data?.message || 'Không thể tạo mã giảm giá');
        }
    };

    const handleUpdateCoupon = async () => {
        try {
            await axios.put(`/api/admin/coupons/admin/coupons/update/${editingCoupon.couponID}`, formData);
            toast.success('Cập nhật mã giảm giá thành công');
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error) {
            console.error('Lỗi khi cập nhật mã giảm giá(CouponManagement.jsx):', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật mã giảm giá');
        }
    };

    const handleDeleteCoupon = async (couponID) => {
        if (window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
            try {
                await axios.delete(`/api/admin/coupons/admin/coupons/delete/${couponID}`);
                toast.success('Xóa mã giảm giá thành công');
                fetchCoupons();
            } catch (error) {
                console.error('Lỗi khi xóa mã giảm giá(CouponManagement.jsx):', error);
                toast.error(error.response?.data?.message || 'Không thể xóa mã giảm giá');
            }
        }
    };

    // Thêm hàm xử lý toggle status
    const handleToggleStatus = async (couponID, currentStatus) => {
        try {
            const response = await axios.patch(`/api/admin/coupons/admin/coupons/toggle/${couponID}`, {
                isActive: !currentStatus,
            });

            // Cập nhật lại coupon trong state
            const updatedCoupons = coupons.map(coupon => {
                if (coupon.couponID === couponID) {
                    return { ...coupon, isActive: !currentStatus };
                }
                return coupon;
            });
            setCoupons(updatedCoupons);

            // Cập nhật lại stats sử dụng prevStats
            setStats(prevStats => ({
                ...prevStats,
                // Nếu đang active (currentStatus = true) -> vô hiệu hóa -> giảm active đi 1
                totalActiveCoupons: prevStats.totalActiveCoupons + (currentStatus ? -1 : 1)
            }));

            toast.success(response.data.message);
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái mã giảm giá(CouponManagement.jsx):', error);
            toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái mã giảm giá');
        }
    };

    // ===== XỬ LÝ TÌM KIẾM VÀ LỌC =====
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // ===== LỌC VÀ SẮP XẾP COUPON =====
    const getFilteredAndSortedCoupons = () => {
        const now = new Date();

        // Lọc theo từ khóa tìm kiếm
        let filteredCoupons = coupons.filter(coupon =>
            coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Lọc theo trạng thái
        filteredCoupons = filteredCoupons.filter(coupon => {
            const endDate = new Date(coupon.endDate);
            const isActive = endDate >= now;
            const isUsed = coupon.usageLimit === 0;

            switch (filters.status) {
                case 'active': return isActive && !isUsed;
                case 'expired': return endDate < now;
                case 'used': return isUsed;
                default: return true;
            }
        });

        // Lọc theo loại giảm giá
        if (filters.type !== 'all') {
            filteredCoupons = filteredCoupons.filter(
                coupon => coupon.discountType === filters.type
            );
        }

        // Lọc theo loại coupon
        if (filters.couponType !== 'all') {
            filteredCoupons = filteredCoupons.filter(
                coupon => coupon.couponType === filters.couponType
            );
        }

        // Sắp xếp
        if (filters.sort !== 'none' && filters.order !== 'none') {
            filteredCoupons.sort((a, b) => {
                let comparison = 0;
                switch (filters.sort) {
                    case 'createAt':
                        comparison = new Date(a.createdAt) - new Date(b.createdAt);
                        break;
                    case 'endDate':
                        comparison = new Date(a.endDate) - new Date(b.endDate);
                        break;
                    case 'usageLimit':
                        comparison = a.usageLimit - b.usageLimit;
                        break;
                    case 'discountValue':
                        comparison = a.discountValue - b.discountValue;
                        break;
                    case 'code':
                        comparison = a.code.localeCompare(b.code);
                        break;
                }
                return filters.order === 'asc' ? comparison : -comparison;
            });
        }

        return filteredCoupons;
    };

    // Tính toán phân trang
    const filteredAndSortedCoupons = getFilteredAndSortedCoupons();
    const totalPages = Math.ceil(filteredAndSortedCoupons.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCoupons = filteredAndSortedCoupons.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        return (
            <div className="flex justify-center space-x-2 mt-4 mb-6">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`px-4 py-2 border rounded-lg ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                        }`}
                >
                    Trước
                </button>

                {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={`page-${page}`}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 border rounded-lg transition-colors ${currentPage === page
                                    ? 'bg-green-500 text-white border-green-500'
                                    : isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                                        : 'bg-white hover:bg-gray-50 border-gray-300'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    }
                    if (index > 0 && page - [...Array(totalPages)][index - 1] > 1) {
                        return (
                            <React.Fragment key={`ellipsis-${page}`}>
                                <span className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>...</span>
                                <button
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 border rounded-lg transition-colors ${currentPage === page
                                        ? 'bg-green-500 text-white border-green-500'
                                        : isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                                            : 'bg-white hover:bg-gray-50 border-gray-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        );
                    }
                    return null;
                })}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`px-4 py-2 border rounded-lg ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                        }`}
                >
                    Sau
                </button>
            </div>
        );
    };

    // Hàm xử lý hiển thị loại mã giảm giá
    const getCouponTypeDisplay = (type) => {
        switch (type) {
            case 'weekend':
                return {
                    text: 'Cuối tuần',
                    color: 'bg-yellow-100 text-yellow-600'
                };
            case 'member':
                return {
                    text: 'Thành viên',
                    color: 'bg-indigo-100 text-indigo-600'
                };
            case 'holiday':
                return {
                    text: 'Ngày lễ',
                    color: 'bg-red-100 text-red-600'
                };
            case 'seasonal':
                return {
                    text: 'Theo mùa',
                    color: 'bg-orange-100 text-orange-600'
                };
            case 'bundle':
                return {
                    text: 'Combo',
                    color: 'bg-purple-100 text-purple-600'
                };
            case 'new_user':
                return {
                    text: 'Khách hàng mới',
                    color: 'bg-blue-100 text-blue-600'
                };
            case 'flash_sale':
                return {
                    text: 'Flash Sale',
                    color: 'bg-pink-100 text-pink-600'
                };
            case 'special_event':
                return {
                    text: 'Sự kiện đặc biệt',
                    color: 'bg-green-100 text-green-600'
                };
            case 'category':
                return {
                    text: 'Theo danh mục',
                    color: 'bg-teal-100 text-teal-600'
                };
            case 'clearance':
                return {
                    text: 'Thanh lý',
                    color: 'bg-gray-100 text-gray-600'
                };
            default:
                return {
                    text: 'Khác',
                    color: 'bg-gray-100 text-gray-600'
                };
        }
    };

    // ===== HANDLERS =====
    const handleEditClick = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscountAmount: coupon.maxDiscountAmount,
            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
            endDate: new Date(coupon.endDate).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit,
            totalUsageLimit: coupon.totalUsageLimit,
            couponType: coupon.couponType,
            appliedCategories: Object.keys(coupon.appliedCategories || {})
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            startDate: '',
            endDate: '',
            usageLimit: 0,
            totalUsageLimit: 0,
            couponType: 'special_event',
            appliedCategories: []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingCoupon) {
            await handleUpdateCoupon();
        } else {
            await handleCreateCoupon();
        }
    };

    // ===== NEW FUNCTION =====
    const calculateDiscountPreview = (originalPrice) => {
        if (formData.discountType === 'percentage') {
            const discountAmount = (originalPrice * formData.discountValue) / 100;
            return Math.min(discountAmount, formData.maxDiscountAmount || Infinity);
        } else {
            return Math.min(formData.discountValue, formData.maxDiscountAmount || formData.discountValue);
        }
    };

    // ===== RENDER FUNCTIONS =====
    const renderModal = () => {
        if (!isModalOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <div className={`relative w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all`}>
                        {/* Header - Fixed */}
                        <div className="flex-none flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {editingCoupon ? (
                                        <FiEdit2 className="w-5 h-5 text-blue-500" />
                                    ) : (
                                        <FiPlus className="w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold">
                                    {editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Thông tin cơ bản */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                        <FiTag className="w-5 h-5" />
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Mã giảm giá
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                placeholder="Nhập mã giảm giá..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Loại mã giảm giá
                                            </label>
                                            <select
                                                value={formData.couponType}
                                                onChange={(e) => setFormData({ ...formData, couponType: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                            >
                                                <option value="weekend">🌅 Cuối tuần</option>
                                                <option value="member">👥 Thành viên</option>
                                                <option value="holiday">🎉 Ngày lễ</option>
                                                <option value="seasonal">🌸 Theo mùa</option>
                                                <option value="bundle">📦 Combo</option>
                                                <option value="new_user">🎁 Khách hàng mới</option>
                                                <option value="flash_sale">⚡ Flash Sale</option>
                                                <option value="special_event">🌟 Sự kiện đặc biệt</option>
                                                <option value="category">📑 Theo danh mục</option>
                                                <option value="clearance">🏷️ Thanh lý</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
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
                                </div>

                                {/* Giá trị giảm giá */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                        <FiPercent className="w-5 h-5" />
                                        Giá trị giảm giá
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Loại giảm giá
                                            </label>
                                            <select
                                                value={formData.discountType}
                                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                            >
                                                <option value="percentage">📊 Phần trăm</option>
                                                <option value="fixed">💰 Số tiền cố định</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                {formData.discountType === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.discountValue}
                                                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                                    className={`w-full p-3 pl-10 rounded-lg border transition-colors ${isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    min="0"
                                                    max={formData.discountType === 'percentage' ? "100" : undefined}
                                                    required
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    {formData.discountType === 'percentage' ? (
                                                        <FiPercent className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                                    ) : (
                                                        <FiDollarSign className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Giá trị đơn hàng tối thiểu
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.minOrderValue}
                                                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                                    className={`w-full p-3 pl-10 rounded-lg border transition-colors ${isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    min="0"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FiDollarSign className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Giảm giá tối đa
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.maxDiscountAmount}
                                                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                                                    className={`w-full p-3 pl-10 rounded-lg border transition-colors ${isDarkMode
                                                        ? 'bg-gray-600 border-gray-500 text-white'
                                                        : 'bg-white border-gray-300'
                                                        } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                    min="0"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FiDollarSign className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thời gian và giới hạn */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                        <FiCalendar className="w-5 h-5" />
                                        Thời gian và giới hạn
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Ngày bắt đầu
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Ngày kết thúc
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Giới hạn sử dụng/người
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.usageLimit}
                                                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-2">
                                                Tổng giới hạn sử dụng
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.totalUsageLimit}
                                                onChange={(e) => setFormData({ ...formData, totalUsageLimit: Number(e.target.value) })}
                                                className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                                min="0"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Danh mục áp dụng */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-base font-semibold flex items-center gap-2">
                                            <FiTag className="w-5 h-5" />
                                            Danh mục áp dụng
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Đã chọn: {formData.appliedCategories.length}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (formData.appliedCategories.length === categories.length) {
                                                        setFormData({ ...formData, appliedCategories: [] });
                                                    } else {
                                                        setFormData({ ...formData, appliedCategories: categories.map(c => c.categoryID.toString()) });
                                                    }
                                                }}
                                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${isDarkMode
                                                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                {formData.appliedCategories.length === categories.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tìm kiếm danh mục */}
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm danh mục..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            className={`w-full p-2.5 pl-9 rounded-lg border transition-colors ${isDarkMode
                                                ? 'bg-gray-600 border-gray-500 text-white'
                                                : 'bg-white border-gray-300'
                                                } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                        />
                                        <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
                                    </div>

                                    <div className="max-h-48 overflow-y-auto p-2 border rounded-lg dark:border-gray-600">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {categories
                                                .filter(category =>
                                                    category.name.toLowerCase().includes(categorySearch.toLowerCase())
                                                )
                                                .map((category) => (
                                                    <label
                                                        key={category.categoryID}
                                                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${formData.appliedCategories.includes(category.categoryID.toString())
                                                            ? isDarkMode
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-green-50 text-green-600'
                                                            : isDarkMode
                                                                ? 'hover:bg-gray-600'
                                                                : 'hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.appliedCategories.includes(category.categoryID.toString())}
                                                            onChange={(e) => {
                                                                const categoryId = category.categoryID.toString();
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    appliedCategories: e.target.checked
                                                                        ? [...prev.appliedCategories, categoryId]
                                                                        : prev.appliedCategories.filter(id => id !== categoryId)
                                                                }));
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${formData.appliedCategories.includes(category.categoryID.toString())
                                                                ? isDarkMode
                                                                    ? 'border-green-400 bg-green-400'
                                                                    : 'border-green-500 bg-green-500'
                                                                : isDarkMode
                                                                    ? 'border-gray-500'
                                                                    : 'border-gray-300'
                                                                }`}>
                                                                {formData.appliedCategories.includes(category.categoryID.toString()) && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="text-sm">{category.name}</span>
                                                        </div>
                                                    </label>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Preview mã giảm giá */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-base font-semibold flex items-center gap-2">
                                            <FiEye className="w-5 h-5" />
                                            Xem trước mã giảm giá
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode(!previewMode)}
                                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${isDarkMode
                                                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                }`}
                                        >
                                            {previewMode ? 'Ẩn xem trước' : 'Hiện xem trước'}
                                        </button>
                                    </div>

                                    {previewMode && (
                                        <div className="space-y-4">
                                            {/* Card xem trước */}
                                            <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-lg font-bold mb-1">{formData.code || 'EXAMPLE'}</div>
                                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {formData.description || 'Mô tả mã giảm giá sẽ hiển thị ở đây'}
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${formData.discountType === 'percentage'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {formData.discountType === 'percentage' ? 'Giảm %' : 'Giảm tiền'}
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <FiTag className="text-green-500" />
                                                        <span className="font-medium">
                                                            {formData.discountType === 'percentage'
                                                                ? `Giảm ${formData.discountValue}%`
                                                                : `Giảm ${formData.discountValue?.toLocaleString()}đ`}
                                                        </span>
                                                    </div>
                                                    {formData.maxDiscountAmount > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <FiDollarSign className="text-yellow-500" />
                                                            <span>Giảm tối đa {formData.maxDiscountAmount?.toLocaleString()}đ</span>
                                                        </div>
                                                    )}
                                                    {formData.minOrderValue > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <FiShoppingCart className="text-blue-500" />
                                                            <span>Đơn tối thiểu {formData.minOrderValue?.toLocaleString()}đ</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Ví dụ áp dụng */}
                                                <div className="mt-4 p-3 rounded-lg bg-opacity-50 bg-gray-100 dark:bg-gray-700">
                                                    <div className="text-sm font-medium mb-2">Ví dụ áp dụng:</div>
                                                    <div className="space-y-2">
                                                        {[500000, 1000000, 2000000].map((price) => {
                                                            const discount = calculateDiscountPreview(price);
                                                            const finalPrice = price - discount;
                                                            return (
                                                                <div key={price} className="flex justify-between items-center text-sm">
                                                                    <span>Đơn hàng {price.toLocaleString()}đ</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-red-500">-{discount.toLocaleString()}đ</span>
                                                                        <span className="font-medium">=</span>
                                                                        <span className="text-green-500">{finalPrice.toLocaleString()}đ</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Thời hạn */}
                                                <div className="mt-4 pt-4 border-t dark:border-gray-600">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <FiCalendar className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                                            <span>Thời hạn sử dụng:</span>
                                                        </div>
                                                        <span className="font-medium">
                                                            {formData.startDate && formData.endDate
                                                                ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`
                                                                : 'Chưa thiết lập'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="flex-none flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
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
                                {editingCoupon ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCouponStats = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Tổng mã giảm giá */}
                <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Tổng mã giảm giá
                            </h3>
                            <p className="text-3xl font-bold mt-1 text-blue-500">{stats.totalCoupons}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <FiTag className="w-7 h-7 text-blue-600" />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                {/* Mã còn hiệu lực */}
                <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Còn hiệu lực
                            </h3>
                            <p className="text-2xl font-bold mt-1 text-green-500">{stats.totalActiveCoupons}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <FiTag className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(stats.totalActiveCoupons / stats.totalCoupons) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Mã hết hạn */}
                <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Đã hết hạn
                            </h3>
                            <p className="text-2xl font-bold mt-1 text-red-500">{stats.totalExpiredCoupons}</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100">
                            <FiTag className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(stats.totalExpiredCoupons / stats.totalCoupons) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Lượt sử dụng */}
                <div className={`p-6 rounded-xl shadow-sm transition-all duration-300 transform hover:scale-105 
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Lượt sử dụng
                            </h3>
                            <p className="text-2xl font-bold mt-1 text-purple-500">{stats.totalUsedCount}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <FiTag className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${(stats.totalUsedCount / (stats.totalCoupons * 100)) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    const renderFilterControls = () => {
        return (
            <div className={`p-6 rounded-xl shadow-sm mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex flex-wrap gap-4">
                    {/* Tìm kiếm */}
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nhập mã giảm giá hoặc mô tả..."
                                className={`w-full pl-12 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                                value={searchTerm}
                                onChange={handleSearchChange}
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
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">🔄 Tất cả trạng thái</option>
                        <option value="active">✅ Còn hiệu lực</option>
                        <option value="expired">⏰ Đã hết hạn</option>
                        <option value="used">📦 Đã sử dụng</option>
                    </select>

                    {/* Lọc theo loại giảm giá */}
                    <select
                        className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="all">🏷️ Tất cả loại</option>
                        <option value="percentage">📊 Phần trăm</option>
                        <option value="fixed">💰 Số tiền cố định</option>
                    </select>

                    {/* Lọc theo loại coupon */}
                    <select
                        className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                        value={filters.couponType}
                        onChange={(e) => handleFilterChange('couponType', e.target.value)}
                    >
                        <option value="all">🎯 Tất cả loại coupon</option>
                        <option value="weekend">🌅 Cuối tuần</option>
                        <option value="member">👑 Thành viên</option>
                        <option value="holiday">🎉 Ngày lễ</option>
                        <option value="seasonal">🌸 Theo mùa</option>
                        <option value="bundle">🎁 Combo</option>
                        <option value="new_user">🌟 Khách hàng mới</option>
                        <option value="flash_sale">⚡ Flash Sale</option>
                        <option value="special_event">🎊 Sự kiện đặc biệt</option>
                        <option value="category">📑 Theo danh mục</option>
                        <option value="clearance">🏷️ Thanh lý</option>
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
                        <option value="createAt">📅 Ngày tạo</option>
                        <option value="endDate">⏰ Ngày hết hạn</option>
                        <option value="usageLimit">🔄 Lượt sử dụng</option>
                        <option value="discountValue">💰 Giá trị giảm</option>
                        <option value="code">🔤 Mã giảm giá</option>
                    </select>

                    {/* Thứ tự sắp xếp */}
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
        );
    };

    const renderCouponTable = () => {
        return (
            <div className={`overflow-hidden rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    </div>
                ) : currentCoupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                            <FiTag className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <p className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            Không có mã giảm giá nào
                        </p>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            Hãy thêm mã giảm giá mới để bắt đầu
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`text-left ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <th className="px-6 py-4 text-base font-medium">Mã giảm giá</th>
                                    <th className="px-6 py-4 text-base font-medium">Loại</th>
                                    <th className="px-6 py-4 text-base font-medium">Giá trị</th>
                                    <th className="px-6 py-4 text-base font-medium">Thời hạn</th>
                                    <th className="px-6 py-4 text-base font-medium">Trạng thái</th>
                                    <th className="px-6 py-4 text-base font-medium text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentCoupons.map((coupon) => {
                                    const now = new Date();
                                    const endDate = new Date(coupon.endDate);
                                    const isActive = endDate >= now;
                                    const isUsed = coupon.usageLimit === 0;
                                    const couponType = getCouponTypeDisplay(coupon.couponType);

                                    return (
                                        <tr
                                            key={coupon.couponID}
                                            className={`group transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                        <FiTag className="w-5 h-5 text-green-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-base">{coupon.code}</div>
                                                        <div className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {coupon.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${couponType.color}`}>
                                                    {couponType.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-1">
                                                    <span className="font-medium text-green-500">
                                                        {coupon.discountType === 'percentage'
                                                            ? `${coupon.discountValue}%`
                                                            : `${coupon.discountValue.toLocaleString()}đ`
                                                        }
                                                    </span>
                                                    {coupon.maxDiscountAmount > 0 && (
                                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            (Tối đa {coupon.maxDiscountAmount.toLocaleString()}đ)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Đến: {formatDate(coupon.endDate)}
                                                    </span>
                                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Giới hạn sử dụng: {coupon.usageLimit} lần
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full
                                                ${isUsed
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : (isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800')
                                                    }`}
                                                >
                                                    {isUsed
                                                        ? 'Đã dùng hết'
                                                        : (isActive
                                                            ? 'Còn hiệu lực'
                                                            : 'Hết hạn')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(coupon.couponID, coupon.isActive)}
                                                        className={`p-2 rounded-lg transition-colors ${coupon.isActive
                                                            ? isDarkMode
                                                                ? 'bg-green-400/10 hover:bg-green-400/20 text-green-400'
                                                                : 'bg-green-100 hover:bg-green-200 text-green-600'
                                                            : isDarkMode
                                                                ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                                                                : 'bg-red-100 hover:bg-red-200 text-red-600'
                                                            }`}
                                                        title={coupon.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                    >
                                                        <FiPower className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(coupon)}
                                                        className={`p-2 rounded-lg transition-colors ${isDarkMode
                                                            ? 'bg-blue-400/10 hover:bg-blue-400/20 text-blue-400'
                                                            : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                                            }`}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FiEdit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCoupon(coupon.couponID)}
                                                        className={`p-2 rounded-lg transition-colors ${isDarkMode
                                                            ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                                                            : 'bg-red-100 hover:bg-red-200 text-red-600'
                                                            }`}
                                                        title="Xóa"
                                                    >
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Tiêu đề và nút thêm */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-5xl font-bold mb-2">Quản lý mã giảm giá</h1>
                    <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quản lý và theo dõi các mã giảm giá của cửa hàng
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className={`flex items-center justify-center px-6 py-3 text-lg rounded-lg transition-colors duration-300 ${isDarkMode
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                >
                    <FiPlus className="mr-2 w-6 h-6" /> Thêm mã giảm giá
                </button>
            </div>

            {/* Phần còn lại của component */}
            {renderCouponStats()}
            {renderFilterControls()}
            {renderCouponTable()}
            {renderPagination()}
            {renderModal()}
        </div>
    );
};

export default CouponManagement;

