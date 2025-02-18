import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import { useTheme } from '../contexts/AdminThemeContext';
import { useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Xử lý đăng xuất
    const handleLogout = () => {
        // Xóa token và thông tin admin
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('role');
        // Chuyển về trang đăng nhập admin
        navigate('/login');
    };

    return (
        // Container chính với theme động
        <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Sidebar cố định bên trái */}
            <Sidebar
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
            />

            {/* Phần nội dung chính - sẽ thay đổi theo route */}
            <div className="flex-1 ml-64 p-8 overflow-auto">
                {/* Breadcrumb hiển thị đường dẫn hiện tại */}
                <Breadcrumb />
                {/* Outlet để render các component con */}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
