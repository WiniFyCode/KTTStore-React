// Import các thư viện cần thiết
import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';  // Import axios đã được cấu hình sẵn
import { FiSearch, FiEdit2, FiUserX, FiUserCheck, FiUser, FiPower } from 'react-icons/fi'; // Import các icon
import { toast } from 'react-toastify'; // Import thư viện để hiển thị thông báo
import { useTheme } from '../../contexts/AdminThemeContext'; // Import context để sử dụng theme sáng/tối

// Component chính để quản lý khách hàng
const Customers = () => {
    // Lấy theme hiện tại (sáng/tối) từ context
    const { isDarkMode } = useTheme();

    // Khai báo các state để lưu trữ dữ liệu
    // ===== STATE CHO DỮ LIỆU =====
    const [allCustomers, setAllCustomers] = useState([]); // Lưu toàn bộ danh sách khách hàng
    const [filteredCustomers, setFilteredCustomers] = useState([]); // Lưu danh sách khách hàng sau khi lọc
    const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu

    // ===== STATE CHO TÌM KIẾM VÀ LỌC =====
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
    const [filters, setFilters] = useState({
        status: 'all',      // Lọc theo trạng thái (tất cả/hoạt động/vô hiệu hóa)
        gender: '',         // Lọc theo giới tính
        sort: 'createAt',   // Sắp xếp theo trường nào
        order: 'desc'       // Thứ tự sắp xếp (tăng/giảm)
    });

    // ===== STATE CHO PHÂN TRANG =====
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [itemsPerPage, setItemsPerPage] = useState(10); // Số item trên mỗi trang
    const [totalPages, setTotalPages] = useState(0); // Tổng số trang

    // ===== STATE CHO THỐNG KÊ =====
    const [stats, setStats] = useState({
        total: 0,      // Tổng số khách hàng
        active: 0,     // Số khách hàng đang hoạt động
        disabled: 0    // Số khách hàng bị vô hiệu hóa
    });

    // ===== STATE CHO CHỈNH SỬA =====
    const [editingCustomer, setEditingCustomer] = useState(null); // Khách hàng đang được chỉnh sửa
    const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái hiển thị modal chỉnh sửa

    // Hàm chuyển đổi giới tính từ tiếng Anh sang tiếng Việt
    const getGenderText = (gender) => {
        return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : '';
    };

    // Hàm chuyển đổi giới tính từ tiếng Việt sang tiếng Anh
    const getGenderValue = (genderText) => {
        return genderText === 'Nam' ? 'male' : genderText === 'Nữ' ? 'female' : '';
    };

    // ===== CÁC HÀM XỬ LÝ =====

    // 1. Hàm lấy dữ liệu từ server khi component được tạo
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await axios.get('/api/admin/users/admin/users');

                if (response.data?.users) {
                    setAllCustomers(response.data.users);
                    setFilteredCustomers(response.data.users);
                    setTotalPages(Math.ceil(response.data.users.length / itemsPerPage));
                }

                if (response.data?.stats) {
                    setStats({
                        total: response.data.stats.totalUser || 0,
                        active: response.data.stats.totalActiveUser || 0,
                        disabled: response.data.stats.totalDeactivatedUser || 0
                    });
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
                toast.error('Có lỗi xảy ra khi tải danh sách người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [itemsPerPage]);

    // 2. Hàm xử lý tìm kiếm và lọc
    useEffect(() => {
        // Tạo một bản sao của danh sách khách hàng
        let result = [...allCustomers];

        // Xử lý tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(customer =>
                customer.fullname?.toLowerCase().includes(searchLower) ||
                customer.email?.toLowerCase().includes(searchLower) ||
                customer.phone?.includes(searchTerm) ||
                customer.userID?.toString().includes(searchTerm)
            );
        }

        // Xử lý lọc theo trạng thái
        if (filters.status !== 'all') {
            result = result.filter(customer =>
                filters.status === 'active' ? !customer.isDisabled : customer.isDisabled
            );
        }

        // Xử lý lọc theo giới tính
        if (filters.gender) {
            const genderValue = getGenderValue(filters.gender);
            result = result.filter(customer => customer.gender === genderValue);
        }

        // Xử lý sắp xếp
        if (filters.sort) {
            result.sort((a, b) => {
                let compareResult = 0;
                switch (filters.sort) {
                    case 'userID':
                        compareResult = (a.userID || 0) - (b.userID || 0);
                        break;
                    case 'fullname':
                        compareResult = (a.fullname || '').localeCompare(b.fullname || '');
                        break;
                    case 'email':
                        compareResult = (a.email || '').localeCompare(b.email || '');
                        break;
                    default:
                        compareResult = 0;
                }
                return filters.order === 'asc' ? compareResult : -compareResult;
            });
        }

        // Cập nhật danh sách đã lọc
        setFilteredCustomers(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1); // Reset về trang đầu tiên khi lọc
    }, [allCustomers, searchTerm, filters, itemsPerPage]);

    // 3. Hàm xử lý thay đổi bộ lọc
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. Hàm xử lý vô hiệu hóa/kích hoạt tài khoản
    const handleToggleStatus = async (userID, currentStatus) => {
        try {
            const response = await axios.patch(`/api/admin/users/admin/users/toggle/${userID}`, {
                isDisabled: !currentStatus
            });

            if (response.status === 200) {
                // Cập nhật lại danh sách người dùng
                const updatedCustomers = allCustomers.map(customer =>
                    customer.userID === userID ? { ...customer, isDisabled: !currentStatus } : customer
                );
                setAllCustomers(updatedCustomers);

                // Cập nhật lại state thống kê
                setStats(prevStats => ({
                    ...prevStats,
                    // Nếu đang vô hiệu hóa (currentStatus = false -> true)
                    active: prevStats.active + (currentStatus ? 1 : -1),
                    disabled: prevStats.disabled + (currentStatus ? -1 : 1)
                }));

                // Hiển thị thông báo thành công
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái tài khoản');
        }
    };

    // 5. Hàm xử lý mở modal chỉnh sửa
    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    // 6. Hàm xử lý cập nhật thông tin khách hàng
    const handleUpdate = async () => {
        try {
            const response = await axios.put(`/api/admin/users/admin/users/${editingCustomer.userID}`, {
                fullname: editingCustomer.fullname,
                phone: editingCustomer.phone,
                gender: editingCustomer.gender
            });

            if (response.data.user) {
                // Cập nhật lại danh sách người dùng
                const updatedCustomers = allCustomers.map(customer =>
                    customer.userID === editingCustomer.userID ? response.data.user : customer
                );
                setAllCustomers(updatedCustomers);

                // Đóng modal và hiển thị thông báo thành công
                setIsModalOpen(false);
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin người dùng';
            toast.error(errorMessage);
        }
    };

    // 7. Các hàm tiện ích cho phân trang
    // Lấy danh sách khách hàng cho trang hiện tại
    const getCurrentCustomers = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredCustomers.slice(startIndex, endIndex);
    };

    // Tính tổng số trang
    const calculateTotalPages = () => {
        return Math.ceil(filteredCustomers.length / itemsPerPage);
    };

    // Xử lý chuyển trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    };

    // Modal chỉnh sửa
    const EditModal = () => (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
                <div className={`relative w-full max-w-2xl p-8 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Chỉnh sửa thông tin khách hàng
                            </h3>
                            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Cập nhật thông tin cá nhân của khách hàng
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode
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
                        {/* Thông tin cơ bản */}
                        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Thông tin cơ bản
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                {/* ID người dùng */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        ID người dùng
                                    </label>
                                    <input
                                        type="text"
                                        value={editingCustomer?.userID || ''}
                                        disabled
                                        className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editingCustomer?.email || ''}
                                        disabled
                                        className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                                        title="Email không thể thay đổi"
                                    />
                                </div>

                                {/* Họ và tên */}
                                <div className="col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        value={editingCustomer?.fullname || ''}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, fullname: e.target.value })}
                                        className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                        required
                                    />
                                </div>

                                {/* Số điện thoại */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        value={editingCustomer?.phone || ''}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                        className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                        required
                                    />
                                </div>

                                {/* Giới tính */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Giới tính
                                    </label>
                                    <select
                                        value={getGenderText(editingCustomer?.gender || '')}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, gender: getGenderValue(e.target.value) })}
                                        className={`w-full p-3 rounded-lg border transition-colors ${isDarkMode
                                                ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                        required
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>

                                {/* Trạng thái */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Trạng thái
                                    </label>
                                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${!editingCustomer.isDisabled
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                            {editingCustomer.isDisabled ? 'Đã vô hiệu hóa' : 'Đang hoạt động'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className={`px-6 py-2.5 rounded-lg transition-colors ${isDarkMode
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdate}
                            className={`px-6 py-2.5 rounded-lg transition-colors ${isDarkMode
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-green-500 hover:bg-green-600'
                                } text-white flex items-center gap-2`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-5xl font-bold mb-3">Quản lý khách hàng</h1>
                        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Quản lý và theo dõi tất cả khách hàng trong hệ thống
                        </p>
                    </div>
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Tổng số khách hàng */}
                    <div className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tổng số khách hàng
                                </p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100/80">
                                <FiUser className="text-2xl text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    {/* Đang hoạt động */}
                    <div className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Đang hoạt động
                                </p>
                                <p className="text-3xl font-bold mt-1">{stats.active}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-100/80">
                                <FiUserCheck className="text-2xl text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(stats.active / stats.total) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Đã vô hiệu hóa */}
                    <div className={`p-6 rounded-xl shadow-sm transform hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Đã vô hiệu hóa
                                </p>
                                <p className="text-3xl font-bold mt-1">{stats.disabled}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-red-100/80">
                                <FiUserX className="text-2xl text-red-600" />
                            </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full"
                                style={{ width: `${(stats.disabled / stats.total) * 100}%` }}></div>
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
                                    placeholder="Nhập tên, email hoặc số điện thoại..."
                                    className={`w-full pl-12 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                            : 'bg-gray-50 border-gray-200'
                                        }`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FiSearch className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                        </div>

                        {/* Lọc theo trạng thái */}
                        <select
                            className={`min-w-[210px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="all">👥 Tất cả trạng thái ({filteredCustomers.length})</option>
                            <option value="active">✅ Đang hoạt động ({filteredCustomers.filter(c => !c.isDisabled).length})</option>
                            <option value="disabled">❌ Đã vô hiệu hóa ({filteredCustomers.filter(c => c.isDisabled).length})</option>
                        </select>

                        {/* Lọc theo giới tính */}
                        <select
                            className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                        >
                            <option value="">👤 Tất cả giới tính</option>
                            <option value="Nam">👨 Nam ({filteredCustomers.filter(c => c.gender === 'male').length})</option>
                            <option value="Nữ">👩 Nữ ({filteredCustomers.filter(c => c.gender === 'female').length})</option>
                        </select>

                        {/* Sắp xếp */}
                        <select
                            className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <option value="userID">🔢 Theo ID</option>
                            <option value="fullname">📝 Theo tên</option>
                            <option value="email">📧 Theo email</option>
                        </select>

                        {/* Thứ tự */}
                        <select
                            className={`min-w-[180px] border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-opacity-90 cursor-pointer ${isDarkMode
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

                {/* Bảng danh sách khách hàng */}
                <div className={`overflow-hidden rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`text-left ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <th className={`px-6 py-4 text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                        Họ và tên
                                    </th>
                                    <th className={`px-6 py-4 text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                        Giới tính
                                    </th>
                                    <th className={`px-6 py-4 text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                        Email
                                    </th>
                                    <th className={`px-6 py-4 text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                        Số điện thoại
                                    </th>
                                    <th className={`px-6 py-4 text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                        Trạng thái
                                    </th>
                                    <th className={`px-6 py-4 text-base font-medium text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8">
                                            <div className="flex justify-center items-center space-x-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : getCurrentCustomers().length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <FiUser className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Không tìm thấy khách hàng nào
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    getCurrentCustomers().map((customer) => (
                                        <tr
                                            key={customer._id}
                                            className={`group transition-colors hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="w-5 h-5 text-green-500" />
                                                    <span className={`text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                        {customer.fullname}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${customer.gender === 'male'
                                                        ? 'bg-indigo-100 text-indigo-600'
                                                        : 'bg-pink-100 text-pink-600'
                                                    }`}>
                                                    {getGenderText(customer.gender)}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {customer.email}
                                            </td>
                                            <td className={`px-6 py-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {customer.phone}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${!customer.isDisabled
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {customer.isDisabled ? 'Đã vô hiệu hóa' : 'Đang hoạt động'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleToggleStatus(customer.userID, customer.isDisabled)}
                                                        className={`p-2 rounded-lg transition-colors ${!customer.isDisabled
                                                                ? isDarkMode
                                                                    ? 'bg-green-400/10 hover:bg-green-400/20 text-green-400'
                                                                    : 'bg-green-100 hover:bg-green-200 text-green-600'
                                                                : isDarkMode
                                                                    ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                                                                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                                                            }`}
                                                        title={customer.isDisabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
                                                    >
                                                        <FiPower className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(customer)}
                                                        className={`p-2 rounded-lg transition-colors ${isDarkMode
                                                                ? 'bg-blue-400/10 hover:bg-blue-400/20 text-blue-400'
                                                                : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                                            }`}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FiEdit2 className="w-5 h-5" />
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

                {/* Phân trang */}
                <div className="flex justify-center space-x-2 mt-4 mb-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={`px-4 py-2 border rounded-lg transition-colors ${isDarkMode
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
                                    key={page}
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
                        if (page === 2 || page === totalPages - 1) {
                            return <span key={page} className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>...</span>;
                        }
                        return null;
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={`px-4 py-2 border rounded-lg transition-colors ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                                : 'bg-white border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                            }`}
                    >
                        Sau
                    </button>
                </div>
            </div>
            {isModalOpen && editingCustomer && EditModal()}
        </div>
    );
};

export default Customers;
