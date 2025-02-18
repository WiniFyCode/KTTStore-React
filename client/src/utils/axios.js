import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const instance = axios.create({
    baseURL: 'http://localhost:5000/',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor cho request
instance.interceptors.request.use(
    (config) => {
        // Thêm token vào header dựa vào URL
        if (config.url.includes('/admin')) {
            // Sử dụng adminToken cho các route admin
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        } else {
            // Sử dụng customerToken cho các route khách hàng
            const customerToken = localStorage.getItem('customerToken');
            if (customerToken) {
                config.headers.Authorization = `Bearer ${customerToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor cho response
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Xử lý riêng cho từng loại token
                    if (error.config.url.includes('/admin')) {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminInfo');
                        localStorage.removeItem('role');
                        // Chuyển hướng đến trang login
                        window.location.href = '/login';
                    } else {
                        localStorage.removeItem('customerToken');
                        localStorage.removeItem('customerInfo');
                        // Chuyển hướng đến trang login customer
                        window.location.href = '/login';
                    }
                    // Thông báo cho người dùng
                    window.dispatchEvent(new Event('authChange'));
                    break;
                case 403:
                    console.error('Không có quyền truy cập');
                    break;
                case 404:
                    console.error('Không tìm thấy tài nguyên');
                    break;
                case 500:
                    console.error('Lỗi server');
                    break;
                default:
                    console.error('Có lỗi xảy ra');
            }
        } else if (error.request) {
            console.error('Không thể kết nối đến server');
        } else {
            console.error('Lỗi:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;
