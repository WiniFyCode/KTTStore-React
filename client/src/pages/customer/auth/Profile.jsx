// Profile.jsx - Trang thông tin cá nhân
import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaPhone, FaCog, FaGift, FaBell, FaHeadset, FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaTicketAlt, FaBox, FaCheckCircle, FaStar, FaVenusMars, FaShoppingBag, FaKey, FaEye, FaEyeSlash,
} from "react-icons/fa";
import { useTheme } from "../../../contexts/CustomerThemeContext";
import PageBanner from "../../../components/PageBanner";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axios";

// Component hiển thị thống kê nhanh
const QuickStats = ({ stats, onNavigate }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {stats.map((stat, index) => (
      <button
        key={index}
        onClick={() => onNavigate(stat.path)}
        className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <div className={`inline-flex p-3 rounded-lg bg-${stat.color}-50`}>
          <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
        </div>
        <h3 className="mt-4 text-lg font-medium">{stat.label}</h3>
        <p className={`mt-2 text-${stat.color}-600 font-semibold`}>
          {stat.value}
        </p>
      </button>
    ))}
  </div>
);

const Profile = () => {
  // Hook điều hướng trang
  const navigate = useNavigate();
  // Lấy theme từ context để áp dụng giao diện
  const { theme } = useTheme();

  // Các state quản lý trạng thái của component
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa thông tin
  const [isLoading, setIsLoading] = useState(false); // Loading chung
  const [updatingAddressId, setUpdatingAddressId] = useState(null); // Lưu ID của địa chỉ đang cập nhật
  const [addresses, setAddresses] = useState([]); // Danh sách địa chỉ
  const [showAddressModal, setShowAddressModal] = useState(false); // Hiển thị modal thêm/sửa địa chỉ
  const [editingAddress, setEditingAddress] = useState(null); // ID địa chỉ đang chỉnh sửa
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Hiển thị xác nhận xóa
  const [addressToDelete, setAddressToDelete] = useState(null); // ID địa chỉ cần xóa
  const [error, setError] = useState(null); // Lưu thông tin lỗi

  // State lưu thông tin người dùng
  const [userInfo, setUserInfo] = useState({
    fullname: "",
    email: "",
    phone: "",
    gender: "male",
  });

  // State quản lý form địa chỉ
  const [addressForm, setAddressForm] = useState({
    addressID: null,
    address: "",
    isDefault: false,
  });

  // State lưu các thống kê của người dùng
  const [stats, setStats] = useState({
    totalOrders: 0, // Tổng số đơn hàng
    totalSpent: 0, // Tổng tiền đã chi
    totalFavorites: 0, // Số sản phẩm yêu thích
    totalReviews: 0, // Số đánh giá đã viết
  });

  // State lưu thống kê đơn hàng theo trạng thái
  const [orderStats, setOrderStats] = useState([
    {
      status: "pending",
      count: 0,
      label: "Chờ xác nhận",
      icon: FaBox,
      color: "yellow",
    },
    {
      status: "confirmed",
      count: 0,
      label: "Đã xác nhận",
      icon: FaCheckCircle,
      color: "blue",
    },
    {
      status: "processing",
      count: 0,
      label: "Đang xử lý",
      icon: FaCog,
      color: "indigo",
    },
    {
      status: "completed",
      count: 0,
      label: "Hoàn thành",
      icon: FaCheck,
      color: "green",
    },
    {
      status: "cancelled",
      count: 0,
      label: "Đã hủy",
      icon: FaTimes,
      color: "red",
    },
  ]);

  // State lưu các hoạt động gần đây
  const [recentActivities, setRecentActivities] = useState([]);

  // State lưu các thông tin bổ sung
  const [promotionCount, setPromotionCount] = useState(0); // Số chương trình khuyến mãi
  const [notificationCount, setNotificationCount] = useState(0); // Số thông báo chưa đọc
  const [couponCount, setCouponCount] = useState(0); // Số mã giảm giá
  const [recentReviews, setRecentReviews] = useState([]); // Các đánh giá gần đây

  // State quản lý form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // State lưu các lỗi validation
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
    password: "",
  });

  // Thêm state để theo dõi trạng thái cập nhật địa chỉ
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  // Thêm state để theo dõi trạng thái xóa
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  // Thêm state để theo dõi trạng thái đổi mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Thêm state để quản lý hiển thị mật khẩu
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Thêm state để quản lý lỗi validation form mật khẩu
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Thêm state để theo dõi trạng thái cập nhật thông tin
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Kiểm tra đăng nhập khi component được mount
  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập để xem thông tin cá nhân");
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Hàm lấy thông tin người dùng từ API
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("customerToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axiosInstance.get("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data;

      setUserInfo({
        fullname: userData.fullname || "",
        email: userData.email || "",
        phone: userData.phone || "",
        gender: userData.gender || "",
      });

      // Lấy danh sách địa chỉ
      const addressResponse = await axiosInstance.get("/api/address");
      setAddresses(addressResponse.data);
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng(Profile.jsx):", error);
      toast.error("Không thể tải thông tin người dùng");
    }
  };

  // Hàm lấy các thống kê từ API
  const fetchStats = async () => {
    try {
      const [ordersRes, favoritesRes, reviewsRes] = await Promise.all([
        axiosInstance.get("/api/order/my-orders"),
        axiosInstance.get("/api/favorite"),
        axiosInstance.get("/api/reviews/user"),
      ]);

      setStats({
        totalOrders: ordersRes.data.total || 0,
        totalSpent:
          ordersRes.data.orders?.reduce(
            (sum, order) => sum + order.paymentPrice,
            0
          ) || 0,
        totalFavorites: favoritesRes.data.total || 0,
        totalReviews: reviewsRes.data.totalReviews || 0,
      });
    } catch (error) {
      console.error("Lỗi khi tải thống kê(Profile.jsx):", error);
    }
  };

  // Hàm lấy thông tin mã giảm giá từ API
  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get("/api/user-coupon/my-coupons");
      if (response.data && response.data.userCoupons) {
        // Đếm số mã giảm giá còn hiệu lực và còn lượt sử dụng
        const activeCoupons = response.data.userCoupons.filter((coupon) => {
          const now = new Date();
          const expiry = new Date(coupon.expiryDate);
          return (
            now <= expiry &&
            coupon.status === "active" &&
            coupon.usageLeft > 0 &&
            coupon.couponInfo.isActive
          );
        });
        setCouponCount(activeCoupons.length);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách mã giảm giá(Profile.jsx):", error);
      setCouponCount(0);
    }
  };

  // Hàm lấy thông tin thông báo từ API
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get("/api/user-notification");
      if (response.data && response.data.data) {
        setNotificationCount(response.data.data.unread);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo(Profile.jsx):", error);
      setNotificationCount(0);
    }
  };

  // Hàm lấy các đánh giá gần đây từ API
  const fetchRecentReviews = async () => {
    try {
      const response = await axiosInstance.get("/api/reviews/user?limit=4");
      setRecentReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá gần đây(Profile.jsx):", error);
    }
  };

  // Hàm lấy thống kê đơn hàng từ API
  const fetchOrderStats = async () => {
    try {
      const response = await axiosInstance.get("/api/order/my-orders");
      const orders = response.data.orders || [];

      setOrderStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          count: orders.filter((order) => order.orderStatus === stat.status)
            .length,
        }))
      );
    } catch (error) {
      console.error("Lỗi khi tải thống kê đơn hàng(Profile.jsx):", error);
    }
  };

  // Hàm lấy hoạt động gần đây từ API
  const fetchRecentActivities = async () => {
    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        axiosInstance.get("/api/order/my-orders?limit=6")
      ]);

      const recentOrders = (ordersRes.data.orders || []).map((order) => ({
        type: "order",
        orderID: order.orderID,
        title: `Đơn hàng #${order.orderID}`,
        detail: `Trạng thái: ${getOrderStatus(order.orderStatus)}`,
        time: order.createdAt,
      }));

      // Kết hợp và sắp xếp theo thời gian
      const activities = [...recentOrders, ...recentReviews]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6);

      setRecentActivities(activities);
    } catch (error) {
      console.error("Lỗi khi tải hoạt động gần đây(Profile.jsx):", error);
    }
  };

  // Hàm lấy thông tin khuyến mãi từ API
  const fetchPromotions = async () => {
    try {
      const response = await axiosInstance.get("/api/promotions/active");
      if (response.data && response.data.success) {
        setPromotionCount(response.data.data.length || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách khuyến mãi(Profile.jsx):", error);
    }
  };

  // Hàm format thời gian hiển thị
  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // Đổi sang giây

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
    return `${Math.floor(diff / 31536000)} năm trước`;
  };

  // Hàm xử lý lỗi chung
  const handleError = (error) => {
    console.error("Lỗi khi tải thông tin cá nhân(Profile.jsx):", error);
    setError(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
  };

  // Hàm fetch tất cả dữ liệu cần thiết
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserInfo(),
        fetchStats(),
        fetchOrderStats(),
        fetchRecentActivities(),
        fetchCoupons(),
        fetchNotifications(),
        fetchRecentReviews(),
        fetchPromotions(),
      ]);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi fetchData khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Cập nhật hàm handleSetDefaultAddress
  const handleSetDefaultAddress = async (addressID) => {
    try {
      setUpdatingAddressId(addressID); // Set ID của địa chỉ đang cập nhật
      const response = await axiosInstance.patch(`/api/address/${addressID}/default`);

      if (response.data) {
        setAddresses(prevAddresses =>
          prevAddresses.map(addr => ({
            ...addr,
            isDefault: addr.addressID === addressID
          }))
        );

        toast.success('Đã đặt địa chỉ mặc định thành công');
      }
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      toast.error(error.response?.data?.message || 'Không thể đặt địa chỉ mặc định');
    } finally {
      setUpdatingAddressId(null); // Reset ID khi hoàn thành
    }
  };

  // Thêm hàm xử lý cập nhật địa chỉ
  const handleUpdateAddress = async () => {
    try {
      setIsUpdatingAddress(true);

      // Nếu đang chỉnh sửa địa chỉ
      if (editingAddress) {
        const response = await axiosInstance.put(`/api/address/${editingAddress}`, {
          address: addressForm.address,
          isDefault: addressForm.isDefault
        });

        if (response.data) {
          // Cập nhật state addresses trực tiếp
          setAddresses(prevAddresses =>
            prevAddresses.map(addr => {
              if (addr.addressID === editingAddress) {
                return {
                  ...addr,
                  address: addressForm.address,
                  isDefault: addressForm.isDefault
                };
              }
              // Nếu địa chỉ hiện tại được set mặc định, các địa chỉ khác phải bỏ mặc định
              if (addressForm.isDefault && addr.isDefault) {
                return { ...addr, isDefault: false };
              }
              return addr;
            })
          );

          toast.success('Cập nhật địa chỉ thành công');
          setShowAddressModal(false);
          setEditingAddress(null);
          setAddressForm({
            addressID: null,
            address: "",
            isDefault: false,
          });
        }
      } else {
        // Thêm địa chỉ mới
        const response = await axiosInstance.post('/api/address', {
          address: addressForm.address,
          isDefault: addressForm.isDefault
        });

        if (response.data) {
          // Thêm địa chỉ mới vào state
          const newAddress = response.data.address;
          setAddresses(prevAddresses => {
            // Nếu địa chỉ mới là mặc định, cập nhật các địa chỉ khác
            if (newAddress.isDefault) {
              return [...prevAddresses.map(addr => ({
                ...addr,
                isDefault: false
              })), newAddress];
            }
            return [...prevAddresses, newAddress];
          });

          toast.success('Thêm địa chỉ mới thành công');
          setShowAddressModal(false);
          setAddressForm({
            addressID: null,
            address: "",
            isDefault: false,
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật địa chỉ');
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  // Thêm hàm xử lý xóa địa chỉ
  const handleDeleteAddress = async () => {
    try {
      setIsDeletingAddress(true);
      const response = await axiosInstance.delete(`/api/address/${addressToDelete}`);

      if (response.data) {
        // Cập nhật state addresses trực tiếp bằng cách lọc bỏ địa chỉ đã xóa
        setAddresses(prevAddresses =>
          prevAddresses.filter(addr => addr.addressID !== addressToDelete)
        );

        toast.success('Xóa địa chỉ thành công');
        setShowDeleteConfirm(false);
        setAddressToDelete(null);
      }
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa địa chỉ');
    } finally {
      setIsDeletingAddress(false);
    }
  };

  // Cập nhật hàm handleChangePassword với validation chi tiết
  const handleChangePassword = async () => {
    try {
      // Reset lỗi
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Validate
      let hasError = false;
      const newErrors = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };

      if (!passwordForm.currentPassword) {
        newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        hasError = true;
      }

      if (!passwordForm.newPassword) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        hasError = true;
      } else if (passwordForm.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        hasError = true;
      } else if (passwordForm.newPassword === passwordForm.currentPassword) {
        newErrors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
        hasError = true;
      }

      if (!passwordForm.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        hasError = true;
      } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        hasError = true;
      }

      if (hasError) {
        setPasswordErrors(newErrors);
        return;
      }

      setIsChangingPassword(true);
      const response = await axiosInstance.put('/api/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data) {
        toast.success('Đổi mật khẩu thành công');
        setShowPasswordModal(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Reset show passwords state
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        });
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      // Xử lý lỗi từ server
      if (error.response?.data?.message === 'Mật khẩu hiện tại không đúng') {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: 'Mật khẩu hiện tại không đúng'
        });
      } else {
        toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Thêm hàm xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = async () => {
    try {
      // Validate
      let hasError = false;
      const newErrors = { ...errors };

      // Validate phone
      if (userInfo.phone) {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(userInfo.phone)) {
          newErrors.phone = 'Số điện thoại không hợp lệ';
          hasError = true;
        }
      }

      if (hasError) {
        setErrors(newErrors);
        return;
      }

      setIsUpdatingProfile(true);
      const response = await axiosInstance.put('/api/user/profile', {
        fullname: userInfo.fullname,
        phone: userInfo.phone,
        gender: userInfo.gender
      });

      if (response.data) {
        toast.success('Cập nhật thông tin thành công');
        setIsEditing(false);
        // Cập nhật thông tin mới vào state
        setUserInfo(prev => ({
          ...prev,
          ...response.data.user
        }));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      if (error.response?.data?.message === 'Số điện thoại đã được sử dụng') {
        setErrors({
          ...errors,
          phone: 'Số điện thoại đã được sử dụng'
        });
      } else {
        toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Hàm chuyển đổi trạng thái đơn hàng
  const getOrderStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status; // Trả về trạng thái gốc nếu không khớp
    }
  };

  // Nếu có lỗi, hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-12">
          <FaTimes className="text-red-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Đã có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="text-blue-500 hover:underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme === "tet" ? "bg-red-50" : "bg-blue-50"}`}
    >
      <PageBanner
        theme={theme}
        icon={FaUser}
        title="THÔNG TIN CÁ NHÂN"
        subtitle={`Xin chào, ${userInfo.fullname}`}
        breadcrumbText="Thông tin cá nhân"
      />

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Thống kê nhanh */}
            <QuickStats
              stats={[
                {
                  icon: FaGift,
                  label: "Khuyến mãi",
                  value: `${promotionCount} chương trình`,
                  path: "/promotion",
                  color: "green",
                },
                {
                  icon: FaTicketAlt,
                  label: "Mã giảm giá",
                  value: `${couponCount} mã`,
                  path: "/coupons",
                  color: "orange",
                },
                {
                  icon: FaBell,
                  label: "Thông báo",
                  value: `${notificationCount} chưa đọc`,
                  path: "/notifications",
                  color: "yellow",
                },
                {
                  icon: FaHeadset,
                  label: "Hỗ trợ",
                  value: "Liên hệ ngay",
                  path: "/support",
                  color: "purple",
                },
              ]}
              onNavigate={(path) => path && navigate(path)}
            />

            {/* Thống kê đơn hàng */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-6">
                Trạng thái đơn hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {orderStats.map((stat, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${stat.count > 0
                      ? `bg-${stat.color}-50 border border-${stat.color}-200`
                      : "bg-gray-50 opacity-60"
                      }`}
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${stat.color}-100 mb-4`}
                    >
                      <stat.icon
                        className={`w-6 h-6 text-${stat.color}-500`}
                      />
                    </div>
                    <h4 className="font-medium">{stat.label}</h4>
                    <p
                      className={`text-2xl font-bold mt-2 text-${stat.color}-600`}
                    >
                      {stat.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hoạt động gần đây và đánh giá gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Hoạt động gần đây */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6">
                  Hoạt động gần đây
                </h3>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          navigate(`/order/${activity.orderID}`)
                        }}
                        className="flex items-start p-4 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200"
                      >
                        <div
                          className={`p-3 rounded-lg ${activity.type === "order"
                            ? "bg-blue-50 text-blue-500"
                            : "bg-yellow-50 text-yellow-500"
                            }`}
                        >
                          {activity.type === "order" ? (
                            <FaShoppingBag className="w-6 h-6" />
                          ) : (
                            <FaStar className="w-6 h-6" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">
                            {activity.detail} {/* Trạng thái đơn hàng */}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(new Date(activity.time))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có hoạt động nào
                    </div>
                  )}
                </div>
              </div>

              {/* Đánh giá gần đây */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6">
                  Đánh giá gần đây
                </h3>
                <div className="space-y-4">
                  {recentReviews.length > 0 ? (
                    recentReviews.map((review, index) => (
                      <div
                        key={index}
                        onClick={() => {
                            navigate(`/product/${review.productInfo.productID}`)
                        }}
                        className="bg-white rounded-lg p-4 cursor-pointer shadow hover:shadow-md transition-shadow flex border-2 border-gray-200"
                      >
                        {/* Thêm ảnh sản phẩm vào góc trái */}
                        <img 
                          src={review.productInfo.image} 
                          alt={review.productInfo.name} 
                          className="w-16 h-24 rounded-lg mr-4 mt-2" 
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">
                            {review.productInfo.name}
                          </h3>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-500">
                            {formatTime(new Date(review.createdAt))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có đánh giá nào
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Thông tin cá nhân</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isEditing
                    ? "bg-gray-100 text-gray-600"
                    : theme === "tet"
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                    }`}
                >
                  {isEditing ? (
                    <>
                      <FaTimes /> Hủy
                    </>
                  ) : (
                    <>
                      <FaEdit /> Chỉnh sửa
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Họ tên */}
                <div>
                  <label className="block text-gray-700 mb-2">Họ tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.fullname}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, fullname: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                      <FaUser className="text-gray-400" />
                      <span>{userInfo.fullname}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <FaEnvelope className="text-gray-400" />
                    <span>{userInfo.email}</span>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, phone: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500' : ''
                          }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                      <FaPhone className="text-gray-400" />
                      <span>{userInfo.phone}</span>
                    </div>
                  )}
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Giới tính
                  </label>
                  {isEditing ? (
                    <select
                      value={userInfo.gender}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, gender: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                      <FaVenusMars className="text-gray-400" />
                      <span>{userInfo.gender === "male" ? "Nam" : "Nữ"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-4">
                {isEditing && (
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className={`px-6 py-2 rounded-lg text-white ${theme === "tet"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaCheck className="inline-block" /> Lưu thay đổi
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FaKey className="inline-block" /> Đổi mật khẩu
                </button>
              </div>
            </div>

            {/* Quản lý địa chỉ */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Địa chỉ của tôi</h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      addressID: null,
                      address: "",
                      isDefault: false,
                    });
                    setShowAddressModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white ${theme === "tet"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                  <FaPlus /> Thêm địa chỉ mới
                </button>
              </div>

              {/* Danh sách địa chỉ */}
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.addressID}
                    className={`p-4 rounded-lg border ${address.isDefault
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="text-gray-800">{address.address}</p>
                        {address.isDefault && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.addressID)}
                            className="p-2 text-gray-500 hover:text-green-500"
                            title="Đặt làm mặc định"
                            disabled={updatingAddressId === address.addressID}
                          >
                            {updatingAddressId === address.addressID ? (
                              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaCheck />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingAddress(address.addressID);
                            setAddressForm({
                              addressID: address.addressID,
                              address: address.address,
                              isDefault: address.isDefault,
                            });
                            setShowAddressModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-500"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setAddressToDelete(address.addressID);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-gray-500 hover:text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal thêm/sửa địa chỉ */}
            {showAddressModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  {/* Overlay */}
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div
                      className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm"
                      onClick={() => {
                        setShowAddressModal(false);
                        setEditingAddress(null);
                        setAddressForm({
                          addressID: null,
                          address: "",
                          isDefault: false,
                        });
                      }}
                    ></div>
                  </div>

                  {/* Modal */}
                  <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            {editingAddress ? (
                              <FaEdit className={`h-5 w-5 ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
                            ) : (
                              <FaPlus className={`h-5 w-5 ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setShowAddressModal(false);
                            setEditingAddress(null);
                            setAddressForm({
                              addressID: null,
                              address: "",
                              isDefault: false,
                            });
                          }}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <FaTimes className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ của bạn
                          </label>
                          <textarea
                            value={addressForm.address}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                address: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            rows="3"
                            placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                isDefault: e.target.checked,
                              })
                            }
                            className={`w-5 h-5 rounded border-gray-300 ${
                              theme === 'tet' 
                                ? 'text-red-500 focus:ring-red-500' 
                                : 'text-blue-500 focus:ring-blue-500'
                            }`}
                          />
                          <label htmlFor="isDefault" className="ml-3 text-sm text-gray-700">
                            Đặt làm địa chỉ mặc định
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowAddressModal(false);
                          setEditingAddress(null);
                          setAddressForm({
                            addressID: null,
                            address: "",
                            isDefault: false,
                          });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        disabled={isUpdatingAddress}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdateAddress}
                        disabled={isUpdatingAddress || !addressForm.address.trim()}
                        className={`px-6 py-2 rounded-xl text-white text-sm font-medium transition-colors ${
                          theme === 'tet'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                      >
                        {isUpdatingAddress ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <FaCheck className="w-4 h-4" />
                            {editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal xác nhận xóa */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  {/* Overlay */}
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div
                      className="absolute inset-0 bg-gray-500 opacity-75 backdrop-blur-sm"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setAddressToDelete(null);
                      }}
                    ></div>
                  </div>

                  {/* Modal */}
                  <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <FaTrash className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Xác nhận xóa địa chỉ
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                      <button
                        onClick={handleDeleteAddress}
                        disabled={isDeletingAddress}
                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeletingAddress ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang xóa...
                          </div>
                        ) : (
                          'Xóa'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setAddressToDelete(null);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                        disabled={isDeletingAddress}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal đổi mật khẩu */}
            {showPasswordModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  {/* Overlay */}
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div
                      className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setShowPasswords({
                          current: false,
                          new: false,
                          confirm: false
                        });
                      }}
                    ></div>
                  </div>

                  {/* Modal */}
                  <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <FaKey className={`h-5 w-5 ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`} />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Đổi mật khẩu
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setShowPasswordModal(false);
                            setPasswordForm({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                            setShowPasswords({
                              current: false,
                              new: false,
                              confirm: false
                            });
                          }}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <FaTimes className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                      <div className="space-y-4">
                        {/* Mật khẩu hiện tại */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu hiện tại
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  currentPassword: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                passwordErrors.currentPassword
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:ring-blue-500'
                              }`}
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPasswords.current ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="mt-1.5 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                          )}
                        </div>

                        {/* Mật khẩu mới */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  newPassword: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                passwordErrors.newPassword
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:ring-blue-500'
                              }`}
                              placeholder="Nhập mật khẩu mới"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPasswords.new ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="mt-1.5 text-sm text-red-500">{passwordErrors.newPassword}</p>
                          )}
                        </div>

                        {/* Xác nhận mật khẩu mới */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                passwordErrors.confirmPassword
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:ring-blue-500'
                              }`}
                              placeholder="Xác nhận mật khẩu mới"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPasswords.confirm ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1.5 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setShowPasswords({
                            current: false,
                            new: false,
                            confirm: false
                          });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        disabled={isChangingPassword}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className={`px-6 py-2 rounded-xl text-white text-sm font-medium transition-colors ${
                          theme === 'tet'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                      >
                        {isChangingPassword ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang cập nhật...
                          </>
                        ) : (
                          <>
                            <FaCheck className="w-4 h-4" />
                            Xác nhận
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
