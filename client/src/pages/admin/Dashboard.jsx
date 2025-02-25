import  { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiShoppingBag, FiStar, FiPackage } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import axiosInstance from '../../utils/axios';
import { useTheme } from '../../contexts/AdminThemeContext';

// Đăng ký các components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [productStats, setProductStats] = useState({
        total: 0,
        inStock: 0,
        outOfStock: 0,
        hasPromotion: 0,
        categoryDistribution: {},
        targetDistribution: {}
    });

    // Khai báo extendedStats một lần duy nhất
    const [extendedStats, setExtendedStats] = useState({
        coupons: { total: 0, active: 0, expired: 0, usageCount: 0 },
        promotions: { total: 0, active: 0, upcoming: 0, ended: 0 },
        categories: { total: 0, productsCount: {} },
        reviews: { 
            total: 0, 
            avgRating: 0,
            distribution: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            }
        },
        notifications: { total: 0, unread: 0 }
    });

    // Thêm biểu đồ phân bố sản phẩm theo danh mục
    const [categoryData, setCategoryData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: []
        }]
    });

    // Thêm state cho user stats
    const [userStats, setUserStats] = useState({
        total: 0,
        active: 0,
        disabled: 0,
        newUsers: 0, // Users đăng ký trong tháng này
        customerCount: 0,
        adminCount: 0,
        genderDistribution: {
            male: 0,
            female: 0,
            other: 0
        }
    });

    // Thêm state cho order stats
    const [orderStats, setOrderStats] = useState({
        total: 0,
        totalRevenue: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        orderStatusDistribution: {
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0
        },
        shippingStatusDistribution: {
            pending: 0,
            shipping: 0,
            delivered: 0,
            returned: 0
        }
    });

    // ===== STATE CHO COUPONS =====
    const [coupons, setCoupons] = useState([]);

    // ===== HOOK USE THEME =====
    const { isDarkMode } = useTheme();

    // ===== HOOK USE EFFECT =====
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch categories data với products
                const categoriesResponse = await axiosInstance.get('/api/products/all-by-categories');
                const categoriesData = categoriesResponse.data.categories;

                // Tạo dữ liệu cho biểu đồ
                const categoryData = {
                    labels: categoriesData.map(cat => cat.name),
                    datasets: [{
                        data: categoriesData.map(cat => cat.stats.totalProducts),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',   // Hồng
                            'rgba(54, 162, 235, 0.8)',   // Xanh dương
                            'rgba(255, 206, 86, 0.8)',   // Vàng
                            'rgba(75, 192, 192, 0.8)',   // Xanh lá
                            'rgba(153, 102, 255, 0.8)',  // Tím
                            'rgba(255, 159, 64, 0.8)',   // Cam
                            'rgba(199, 199, 199, 0.8)',  // Xám
                            'rgba(83, 102, 255, 0.8)',   // Xanh tím
                            'rgba(255, 99, 255, 0.8)',   // Hồng tím
                            'rgba(159, 159, 64, 0.8)',   // Vàng xám
                            'rgba(255, 140, 132, 0.8)',  // Hồng nhạt
                            'rgba(54, 200, 235, 0.8)',   // Xanh dương nhạt
                            'rgba(255, 180, 86, 0.8)',   // Vàng nhạt
                            'rgba(75, 220, 192, 0.8)',   // Xanh lá nhạt
                            'rgba(153, 140, 255, 0.8)',  // Tím nhạt
                            'rgba(255, 180, 64, 0.8)',   // Cam nhạt
                            'rgba(180, 180, 180, 0.8)',  // Xám nhạt
                            'rgba(83, 140, 255, 0.8)',   // Xanh tím nhạt
                            'rgba(255, 140, 255, 0.8)',  // Hồng tím nhạt
                            'rgba(180, 180, 64, 0.8)',   // Vàng xám nhạt
                            'rgba(255, 120, 132, 0.8)',  // Thêm màu mới
                            'rgba(54, 180, 235, 0.8)',   // Thêm màu mới
                            'rgba(255, 160, 86, 0.8)',   // Thêm màu mới
                            'rgba(75, 200, 192, 0.8)',   // Thêm màu mới
                        ]
                    }]
                };

                // Cập nhật product stats
                const totalProducts = categoriesData.reduce((sum, cat) => sum + cat.stats.totalProducts, 0);
                const inStockProducts = categoriesData.reduce((sum, cat) => sum + cat.stats.inStockProducts, 0);
                const outOfStockProducts = categoriesData.reduce((sum, cat) => sum + cat.stats.outOfStockProducts, 0);
                const productsOnPromotion = categoriesData.reduce((sum, cat) => sum + cat.stats.productsOnPromotion, 0);

                setProductStats({
                    total: totalProducts,
                    inStock: inStockProducts,
                    outOfStock: outOfStockProducts,
                    hasPromotion: productsOnPromotion,
                    categoryDistribution: categoriesData.reduce((acc, cat) => {
                        acc[cat.name] = cat.stats.totalProducts;
                        return acc;
                    }, {})
                });

                setCategoryData(categoryData);

                // Fetch users data
                const usersResponse = await axiosInstance.get('/api/admin/users/admin/users');
                const users = usersResponse.data.users;
                const totalUsers = usersResponse.data.total;

                // Tính toán thống kê người dùng
                const currentDate = new Date();
                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                const userStatistics = users.reduce((acc, user) => {
                    // Đếm theo trạng thái
                    if (user.isDisabled) acc.disabled++;
                    else acc.active++;

                    // Đếm theo role
                    if (user.role === 'admin') acc.adminCount++;
                    else if (user.role === 'customer') acc.customerCount++;

                    // Đếm theo giới tính
                    acc.genderDistribution[user.gender || 'other']++;

                    // Đếm user mới trong tháng
                    const userCreatedAt = new Date(user.createdAt);
                    if (userCreatedAt >= firstDayOfMonth) {
                        acc.newUsers++;
                    }

                    return acc;
                }, {
                    active: 0,
                    disabled: 0,
                    newUsers: 0,
                    customerCount: 0,
                    adminCount: 0,
                    genderDistribution: {
                        male: 0,
                        female: 0,
                        other: 0
                    }
                });

                setUserStats({
                    ...userStatistics,
                    total: totalUsers
                });

                // Fetch orders data
                const ordersResponse = await axiosInstance.get('/api/admin/orders/admin/orders');
                const orders = ordersResponse.data.orders;
                const orderStats = ordersResponse.data.stats;

                // Tính toán thống kê đơn hàng
                const orderDistribution = orders.reduce((acc, order) => {
                    // Đếm theo trạng thái đơn hàng
                    acc.orderStatusDistribution[order.orderStatus] = 
                        (acc.orderStatusDistribution[order.orderStatus] || 0) + 1;

                    // Đếm theo trạng thái vận chuyển
                    acc.shippingStatusDistribution[order.shippingStatus] = 
                        (acc.shippingStatusDistribution[order.shippingStatus] || 0) + 1;

                    return acc;
                }, {
                    orderStatusDistribution: {},
                    shippingStatusDistribution: {}
                });

                setOrderStats({
                    total: orderStats.totalOrders,
                    totalRevenue: orderStats.totalRevenue,
                    paidOrders: orderStats.totalPaidOrders,
                    unpaidOrders: orderStats.totalUnpaidOrders,
                    ...orderDistribution
                });

                // Fetch coupons data
                const couponsResponse = await axiosInstance.get('/api/admin/coupons/admin/coupons');
                const couponStats = couponsResponse.data.stats;
                const couponsData = couponsResponse.data.coupons;
                setCoupons(couponsData); // Lưu dữ liệu coupons vào state

                // Phân tích chi tiết mã giảm giá
                const couponAnalytics = couponsData.reduce((acc, coupon) => {
                    // Phân loại theo loại giảm giá
                    acc.discountTypes[coupon.discountType] = 
                        (acc.discountTypes[coupon.discountType] || 0) + 1;

                    // Phân loại theo loại mã
                    acc.couponTypes[coupon.couponType] = 
                        (acc.couponTypes[coupon.couponType] || 0) + 1;

                    // Tính tổng giá trị giảm tối đa
                    acc.totalMaxDiscount += coupon.maxDiscountAmount || 0;

                    return acc;
                }, {
                    discountTypes: {},
                    couponTypes: {},
                    totalMaxDiscount: 0
                });

                setExtendedStats(prev => ({
                    ...prev,
                    coupons: {
                        total: couponStats.totalCoupons,
                        active: couponStats.totalActiveCoupons,
                        expired: couponStats.totalExpiredCoupons,
                        usageCount: couponStats.totalUsedCount,
                        analytics: couponAnalytics
                    }
                }));

                // Fetch promotions data
                const promotionsResponse = await axiosInstance.get('/api/admin/promotions/all');
                const promotions = promotionsResponse.data.promotions;
                const promotionStats = promotionsResponse.data.stats;

                // Phân tích chi tiết khuyến mãi
                const promotionAnalytics = promotions.reduce((acc, promo) => {
                    // Đếm theo loại khuyến mãi (normal hoặc flash-sale)
                    acc.types[promo.type] = (acc.types[promo.type] || 0) + 1;

                    // Đếm theo trạng thái (active hoặc inactive)
                    acc.status[promo.status] = (acc.status[promo.status] || 0) + 1;

                    // Tính tổng số danh mục được áp dụng
                    acc.totalCategories += promo.categories.length;

                    // Tính tổng và trung bình phần trăm giảm giá
                    acc.totalDiscount += promo.discountPercent;
                    acc.count++;

                    // Tính số danh mục unique được áp dụng
                    promo.categories.forEach(category => {
                        if (!acc.uniqueCategories.includes(category)) {
                            acc.uniqueCategories.push(category);
                        }
                    });

                    return acc;
                }, {
                    types: {},           // Phân loại theo type (normal/flash-sale)
                    status: {},          // Phân loại theo status (active/inactive)
                    totalCategories: 0,  // Tổng số lần danh mục được sử dụng
                    uniqueCategories: [], // Danh sách unique các danh mục
                    totalDiscount: 0,    // Tổng phần trăm giảm giá
                    count: 0             // Số lượng khuyến mãi
                });

                setExtendedStats(prev => ({
                    ...prev,
                    promotions: {
                        // Sử dụng stats từ API
                        total: promotionStats.totalPromotions,
                        active: promotionStats.activePromotions,
                        upcoming: promotionStats.upcomingPromotions,
                        ended: promotionStats.endedPromotions,
                        
                        // Thông tin phân tích thêm
                        avgDiscount: promotionAnalytics.count > 0 
                            ? (promotionAnalytics.totalDiscount / promotionAnalytics.count).toFixed(1) 
                            : 0,
                        analytics: {
                            ...promotionAnalytics,
                            uniqueCategoriesCount: promotionAnalytics.uniqueCategories.length,
                            typeDistribution: {
                                normal: promotionAnalytics.types['normal'] || 0,
                                flashSale: promotionAnalytics.types['flash-sale'] || 0
                            },
                            statusDistribution: {
                                active: promotionAnalytics.status['active'] || 0,
                                inactive: promotionAnalytics.status['inactive'] || 0
                            }
                        }
                    }
                }));

                // Fetch notifications data
                const notificationsResponse = await axiosInstance.get('/api/admin/notifications/admin/notifications');
                const notifications = notificationsResponse.data.notifications;
                const notificationStats = notificationsResponse.data.stats;

                // Phân tích chi tiết thông báo
                const notificationAnalytics = notifications.reduce((acc, notif) => {
                    // Phân loại theo loại thông báo
                    acc.types[notif.type] = (acc.types[notif.type] || 0) + 1;

                    // Tính tổng lượt đọc
                    acc.totalReads += notif.readCount;

                    // Tính trung bình lượt đọc
                    acc.avgReads = Math.round(acc.totalReads / notifications.length);

                    // Kiểm tra trạng thái
                    const now = new Date();
                    const scheduledFor = new Date(notif.scheduledFor);
                    const expiresAt = new Date(notif.expiresAt);

                    if (now < scheduledFor) acc.pending++;
                    else if (now > expiresAt) acc.expired++;
                    else acc.active++;

                    return acc;
                }, {
                    types: {},
                    totalReads: 0,
                    avgReads: 0,
                    pending: 0,
                    active: 0,
                    expired: 0
                });

                setExtendedStats(prev => ({
                    ...prev,
                    notifications: {
                        total: notificationStats.totalNotifications,
                        pending: notificationStats.totalPendingNotifications,
                        active: notificationStats.totalActiveNotifications,
                        expired: notificationStats.totalExpiredNotifications,
                        analytics: notificationAnalytics
                    }
                }));

                // Fetch reviews data
                const reviewsResponse = await axiosInstance.get('/api/reviews/admin/all');
                const reviewStats = reviewsResponse.data.stats;

                // Cập nhật state với dữ liệu reviews
                setExtendedStats(prev => ({
                    ...prev,
                    reviews: {
                        total: reviewStats.totalReviews,
                        avgRating: reviewStats.averageRating,
                        distribution: reviewStats.ratingDistribution
                    }
                }));

                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu(Dashboard.jsx):', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ===== TÍNH TỔNG GIỚI HẠN SỬ DỤNG CỦA TẤT CẢ MÃ =====
    const totalUsageLimit = coupons.reduce((acc, c) => acc + (c.totalUsageLimit || 0), 0);

    // ===== CẬP NHẬT PHẦN HIỂN THỊ THỐNG KÊ =====
    const stats = [
        {
            title: 'Tổng sản phẩm',
            value: productStats.total,
            icon: <FiPackage className="w-6 h-6" />,
            change: `${productStats.inStock} còn hàng`,
            color: 'bg-blue-500'
        },
        {
            title: 'Sản phẩm hết hàng',
            value: productStats.outOfStock,
            icon: <FiShoppingBag className="w-6 h-6" />,
            change: `${((productStats.outOfStock / productStats.total) * 100).toFixed(1)}%`,
            color: 'bg-red-500'
        },
        {
            title: 'Đang khuyến mãi',
            value: productStats.hasPromotion,
            icon: <FiDollarSign className="w-6 h-6" />,
            change: `${((productStats.hasPromotion / productStats.total) * 100).toFixed(1)}%`,
            color: 'bg-green-500'
        },
        {
            title: 'Tổng người dùng',
            value: userStats.total,
            icon: <FiUsers className="w-6 h-6" />,
            change: `${userStats.newUsers} người dùng mới tháng này`,
            color: 'bg-purple-500'
        },
        {
            title: 'Tổng đơn hàng',
            value: orderStats.total,
            icon: <FiShoppingBag className="w-6 h-6" />,
            change: `${orderStats.paidOrders} đã thanh toán`,
            color: 'bg-orange-500'
        },
        {
            title: 'Doanh thu',
            value: `${(orderStats.totalRevenue / 1000000).toFixed(1)}M`,
            icon: <FiDollarSign className="w-6 h-6" />,
            change: `${orderStats.paidOrders}/${orderStats.total} đơn đã thanh toán`,
            color: 'bg-green-500'
        }
    ];

    // ===== TÍNH TOÁN TỶ LỆ HÀI LÒNG =====
    const satisfactionRate = extendedStats.reviews.total > 0 
        ? (((extendedStats.reviews.distribution[4] || 0) + 
            (extendedStats.reviews.distribution[5] || 0)) / 
            extendedStats.reviews.total * 100).toFixed(1)
        : 0;

    // ===== HIỂN THỊ LOADING =====
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
        <div className={`${isDarkMode ? 'dark:bg-gray-900' : ''} font-sans`}>
            <h1 className={`font-heading text-heading-2 font-bold mb-6 ${isDarkMode ? 'dark:text-white' : ''}`}>
                Tổng quan
            </h1>

            {/* Thống kê chính */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`font-body text-body-small ${isDarkMode ? 'dark:text-gray-400' : 'text-gray-600'}`}>
                                    {stat.title}
                                </p>
                                <p className={`font-heading text-heading-3 font-semibold mt-1 ${isDarkMode ? 'dark:text-white' : ''}`}>
                                    {stat.value}
                                </p>
                                <p className={`font-body text-body-small mt-2 ${isDarkMode ? 'dark:text-gray-400' : 'text-gray-500'}`}>
                                    {stat.change}
                                </p>
                            </div>
                            <div className={`${stat.color} text-white p-3 rounded-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Thống kê mở rộng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Khuyến mãi & Mã giảm giá */}
                <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                    <h3 className={`font-heading text-heading-3 font-semibold mb-4 ${isDarkMode ? 'dark:text-white' : ''}`}>
                        🎫 Khuyến mãi & Mã giảm giá
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="font-body text-body-normal text-gray-500">📊 Tổng số mã giảm giá</p>
                                <p className="font-heading text-heading-3 font-semibold">
                                    {extendedStats.coupons.total}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="font-body text-body-small text-green-600">
                                        ✅ {extendedStats.coupons.active} đang hoạt động
                                    </span>
                                    
                                </div>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="font-body text-body-small text-red-600">
                                        ❌ {extendedStats.coupons.expired} đã hết hạn
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="font-body text-body-normal text-gray-500">📈 Lượt sử dụng</p>
                                <p className="font-heading text-heading-3 font-semibold">
                                    {extendedStats.coupons.usageCount}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="font-body text-body-normal text-gray-500">💰 Loại giảm giá</p>
                                <div className="mt-2 space-y-2">
                                    {Object.entries(extendedStats.coupons.analytics?.discountTypes || {}).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span>
                                                {type === 'percentage' ? '💯 Giảm theo %' : 
                                                 type === 'fixed' ? '💵 Giảm số tiền cố định' : type}
                                            </span>
                                            <span className="font-semibold">
                                                {count} ({((count / extendedStats.coupons.total) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-body text-body-normal text-gray-500">🏷️ Loại mã</p>
                                <div className="mt-2 space-y-2">
                                    {Object.entries(extendedStats.coupons.analytics?.couponTypes || {}).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span>
                                                {type === 'new_user' ? '🌟 Khách hàng mới' :
                                                 type === 'all' ? '🎯 Tất cả loại coupon' :
                                                 type === 'weekend' ? '🌅 Cuối tuần' :
                                                 type === 'member' ? '👑 Thành viên' :
                                                 type === 'holiday' ? '🎉 Ngày lễ' :
                                                 type === 'seasonal' ? '🌸 Theo mùa' :
                                                 type === 'bundle' ? '🎁 Combo' :
                                                 type === 'flash_sale' ? '⚡ Flash Sale' :
                                                 type === 'special_event' ? '🎊 Sự kiện đặc biệt' :
                                                 type === 'category' ? '📑 Theo danh mục' :
                                                 type === 'clearance' ? '🏷️ Thanh lý' : type}
                                            </span>
                                            <span className="font-semibold">
                                                {count} ({((count / extendedStats.coupons.total) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar hiển thị tỷ lệ sử dụng */}
                    <div className="mt-6">
                        <p className="font-body text-body-normal text-gray-500">📊 Tỷ lệ sử dụng</p>
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ 
                                        width: `${(extendedStats.coupons.usageCount / totalUsageLimit) * 100}%` 
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>✅ Đã sử dụng: {extendedStats.coupons.usageCount}</span>
                                <span>🎯 Giới hạn: {totalUsageLimit}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Đánh giá */}
                <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                    <h3 className={`font-heading text-heading-3 font-semibold mb-4 ${isDarkMode ? 'dark:text-white' : ''}`}>
                        ⭐ Đánh giá sản phẩm
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="font-body text-body-normal text-gray-500">📊 Tổng quan đánh giá</p>
                            <div className="mt-4">
                                <div className="flex items-center space-x-4">
                                    <div className="font-heading text-heading-4 font-bold text-gray-900">
                                        {extendedStats.reviews.avgRating.toFixed(1)}
                                    </div>
                                    <div>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={`h-5 w-5 ${
                                                        i < Math.round(extendedStats.reviews.avgRating)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="font-body text-body-small text-gray-500 mt-1">
                                            📝 {extendedStats.reviews.total} đánh giá
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="font-body text-body-normal text-gray-500">📈 Phân bố đánh giá</p>
                            <div className="mt-4 space-y-2">
                                {[5, 4, 3, 2, 1].map(rating => {
                                    const count = extendedStats.reviews.distribution[rating] || 0;
                                    const percentage = extendedStats.reviews.total > 0
                                        ? (count / extendedStats.reviews.total) * 100
                                        : 0;

                                    return (
                                        <div key={rating} className="flex items-center">
                                            <div className="flex items-center w-24">
                                                <span className="font-body text-body-medium text-gray-600">
                                                    ⭐ {rating} sao
                                                </span>
                                                <FiStar className="h-4 w-4 text-yellow-400 ml-1" />
                                            </div>
                                            <div className="flex-1 mx-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-400 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="w-16 text-right whitespace-nowrap">
                                                <span className="font-body text-body-small text-gray-600">
                                                    {count} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Thêm thông tin chi tiết */}
                    <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="font-body text-body-small text-gray-500">🌟 Đánh giá cao nhất</p>
                                <p className="font-heading text-heading-3 font-semibold mt-1">
                                    {Math.max(...Object.keys(extendedStats.reviews.distribution).map(Number))} sao
                                </p>
                            </div>
                            <div>
                                <p className="font-body text-body-small text-gray-500">⚠️ Đánh giá thấp nhất</p>
                                <p className="font-heading text-heading-3 font-semibold mt-1">
                                    {Math.min(...Object.keys(extendedStats.reviews.distribution).map(Number))} sao
                                </p>
                            </div>
                            <div>
                                <p className="font-body text-body-small text-gray-500">😊 Tỷ lệ hài lòng</p>
                                <p className="font-heading text-heading-3 font-semibold mt-1">
                                    {satisfactionRate}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông báo */}
                <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                    <h3 className={`font-heading text-heading-3 font-semibold mb-4 ${isDarkMode ? 'dark:text-white' : ''}`}>
                        🔔 Thống kê thông báo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="font-body text-body-normal text-gray-500">📊 Tổng quan thông báo</p>
                            <div className="mt-2 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span>📬 Tổng số thông báo</span>
                                    <span className="font-semibold">
                                        {extendedStats.notifications.total}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>✅ Đang hoạt động</span>
                                    <span className="font-semibold text-green-600">
                                        {extendedStats.notifications.active}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>⏳ Chờ gửi</span>
                                    <span className="font-semibold text-blue-600">
                                        {extendedStats.notifications.pending}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>❌ Đã hết hạn</span>
                                    <span className="font-semibold text-gray-600">
                                        {extendedStats.notifications.expired}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="font-body text-body-normal text-gray-500">📑 Phân loại thông báo</p>
                            <div className="mt-2 space-y-2">
                                {Object.entries(extendedStats.notifications.analytics?.types || {}).map(([type, count]) => (
                                    <div key={type} className="flex justify-between items-center">
                                        <span>
                                            {type === 'welcome' ? '🎉 Chào mừng' :
                                             type === 'promotion' ? '🏷️ Khuyến mãi' :
                                             type === 'system' ? '⚙️ Hệ thống' :
                                             type === 'new_collection' ? '👕 BST mới' :
                                             type === 'membership' ? '👑 Thành viên' :
                                             type === 'policy' ? '📜 Chính sách' :
                                             type === 'survey' ? '📝 Khảo sát' :
                                             type === 'security' ? '🔒 Bảo mật' :
                                             type === 'holiday' ? '🎊 Ngày lễ' : type}
                                        </span>
                                        <span className="font-semibold">
                                            {count} ({((count / extendedStats.notifications.total) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Thông tin thêm */}
                    <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="font-body text-body-small text-gray-500">👁️ Tổng lượt đọc</p>
                                <p className="font-heading text-heading-3 font-semibold mt-1">
                                    {extendedStats.notifications.analytics?.totalReads || 0}
                                </p>
                            </div>
                            <div>
                                <p className="font-body text-body-small text-gray-500">📈 Trung bình lượt đọc</p>
                                <p className="font-heading text-heading-3 font-semibold mt-1">
                                    {extendedStats.notifications.analytics?.avgReads || 0}
                                    <span className="font-body text-body-small text-gray-500 ml-1">lượt/thông báo</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thống kê người dùng */}
            <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mt-6`}>
                <h3 className={`font-heading text-heading-3 font-semibold mb-4 ${isDarkMode ? 'dark:text-white' : ''}`}>
                    👥 Thống kê người dùng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="font-body text-body-small text-gray-500">🔄 Trạng thái tài khoản</p>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <span>✅ Đang hoạt động</span>
                                <span className="font-semibold text-green-600">
                                    {userStats.active}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>🔒 Bị khóa</span>
                                <span className="font-semibold text-red-600">
                                    {userStats.disabled}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-body text-body-small text-gray-500">👤 Phân loại người dùng</p>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <span>🛍️ Khách hàng</span>
                                <span className="font-semibold  text-green-600">
                                    {userStats.customerCount}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>👨‍💼 Quản trị viên</span>
                                <span className="font-semibold  text-red-600">
                                    {userStats.adminCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-body text-body-small text-gray-500">⚧️ Giới tính</p>
                        <div className="mt-2 space-y-2">
                            {Object.entries(userStats.genderDistribution).map(([gender, count]) => (
                                <div key={gender} className="flex justify-between items-center">
                                    <span>{gender === 'male' ? '👨 Nam' : gender === 'female' ? '👩 Nữ' : '⚪ Khác'}</span>
                                    <span className={`font-semibold ${
                                        gender === 'male' ? 'text-blue-600' : 
                                        gender === 'female' ? 'text-pink-600' : 
                                        ''
                                    }`}>
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ phân bố sản phẩm */}
            <div className="grid grid-cols-1 gap-6 mt-6">
                <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                    <h3 className={`font-heading text-heading-3 font-semibold mb-4 ${isDarkMode ? 'dark:text-white' : ''}`}>
                        Phân bố theo danh mục
                    </h3>
                    <div className="h-[600px]">
                        <Pie 
                            data={categoryData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            color: isDarkMode ? '#fff' : '#000',
                                            font: {
                                                size: 12
                                            },
                                            padding: 20,
                                            boxWidth: 15,
                                            boxHeight: 15
                                        },
                                        align: 'center',
                                        maxHeight: 500,
                                        display: true
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const label = context.label || '';
                                                const value = context.raw || 0;
                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                const percentage = ((value / total) * 100).toFixed(1);
                                                return `${label}: ${value} (${percentage}%)`;
                                            }
                                        }
                                    }
                                },
                                layout: {
                                    padding: {
                                        right: 150
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Thống kê đơn hàng */}
            <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mt-6`}>
                <h3 className={`font-heading text-heading-3 font-semibold mb-4 ${isDarkMode ? 'dark:text-white' : ''}`}>
                    📊 Thống kê đơn hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="font-body text-body-small text-gray-500">📋 Trạng thái đơn hàng</p>
                        <div className="mt-2 space-y-2">
                            {Object.entries(orderStats.orderStatusDistribution).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center">
                                    <span>
                                        {status === 'pending' ? '⏳ Chờ xác nhận đơn' :
                                         status === 'confirmed' ? '✅ Đã xác nhận đơn' :
                                         status === 'processing' ? '🔄 Đang xử lý đơn' :
                                         status === 'shipping' ? '🚚 Đang vận chuyển' :
                                         status === 'completed' ? '🎉 Đã hoàn thành' :
                                         status === 'cancelled' ? '❌ Đã hủy đơn' :
                                         status === 'refunded' ? '💸 Đã hoàn tiền' : '❓ Trạng thái không xác định'}
                                    </span>
                                    <span className={`font-semibold ${
                                        status === 'completed' ? 'text-green-600' :
                                        status === 'cancelled' ? 'text-red-600' :
                                        'text-blue-600'
                                    }`}>
                                        {count} ({((count / orderStats.total) * 100).toFixed(1)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="font-body text-body-small text-gray-500">🚚 Trạng thái vận chuyển</p>
                        <div className="mt-2 space-y-2">
                            {Object.entries(orderStats.shippingStatusDistribution).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center">
                                    <span>
                                        {status === 'pending' ? '📦 Chờ lấy hàng' :
                                         status === 'preparing' ? '📦 Đang chuẩn bị' :
                                         status === 'shipping' ? '🚚 Đang giao hàng' :
                                         status === 'delivered' ? '✅ Đã giao hàng' :
                                         status === 'returned' ? '↩️ Đã hoàn trả' :
                                         status === 'cancelled' ? '❌ Đã hủy vận chuyển' : status}
                                    </span>
                                    <span className={`font-semibold ${
                                        status === 'delivered' ? 'text-green-600' :
                                        status === 'returned' ? 'text-red-600' :
                                        'text-blue-600'
                                    }`}>
                                        {count} ({((count / orderStats.total) * 100).toFixed(1)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Thống kê thanh toán */}
                <div className="mt-6">
                    <p className="font-body text-body-small text-gray-500">💳 Tình trạng thanh toán</p>
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${(orderStats.paidOrders / orderStats.total) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            <span>✅ Đã thanh toán: {orderStats.paidOrders}</span>
                            <span>⏳ Chưa thanh toán: {orderStats.unpaidOrders}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thống kê khuyến mãi */}
            <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mt-6`}>
                <h3 className={`font-heading text-heading-3 font-semibold mb-4 ${isDarkMode ? 'dark:text-white' : ''}`}>
                    🏷️ Thống kê khuyến mãi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="font-body text-body-normal text-gray-500">📊 Tổng quan khuyến mãi</p>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <span>📈 Tổng số khuyến mãi</span>
                                <span className="font-semibold">
                                    {console.log(extendedStats.promotions.total) || extendedStats.promotions.total}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>✅ Đang hoạt động</span>
                                <span className="font-semibold text-green-600">
                                    {extendedStats.promotions.active}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>⏳ Sắp diễn ra</span>
                                <span className="font-semibold text-blue-600">
                                    {extendedStats.promotions.upcoming}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>❌ Đã kết thúc</span>
                                <span className="font-semibold text-gray-600">
                                    {extendedStats.promotions.ended}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-body text-body-normal text-gray-500">🏷️ Phân loại khuyến mãi</p>
                        <div className="mt-2 space-y-2">
                            {Object.entries(extendedStats.promotions.analytics?.types || {}).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center">
                                    <span>
                                        {type === 'normal' ? '🏷️ Khuyến mãi thường' :
                                         type === 'flash-sale' ? '⚡ Flash Sale' : type}
                                    </span>
                                    <span className="font-semibold">
                                        {count} ({((count / extendedStats.promotions.total) * 100).toFixed(1)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Thông tin thêm */}
                <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-body text-body-small text-gray-500">💰 Mức giảm giá trung bình</p>
                            <p className="font-heading text-heading-3 font-semibold mt-1">
                                {extendedStats.promotions.avgDiscount}%
                            </p>
                        </div>
                        <div>
                            <p className="font-body text-body-small text-gray-500">📑 Số danh mục được áp dụng</p>
                            <p className="font-heading text-heading-3 font-semibold mt-1">
                                {extendedStats.promotions.analytics?.totalCategories || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
