import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const Breadcrumb = () => {
    // Hook lấy thông tin về route hiện tại
    const location = useLocation();

    // Tách đường dẫn thành mảng và loại bỏ phần tử rỗng
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Map các path thành tên hiển thị tiếng Việt
    const getDisplayName = (path) => {
        const pathMap = {
            'admin': 'Dashboard', // Mặc định admin sẽ là Dashboard
            'dashboard': 'Dashboard',
            'customers': 'Quản lý khách hàng',
            'products': 'Quản lý sản phẩm',
            'orders': 'Quản lý đơn hàng',
            'settings': 'Cài đặt hệ thống',
            'coupons': 'Quản lý mã giảm giá',
            'promotions': 'Quản lý khuyến mãi',
            'notifications': 'Quản lý thông báo'
        };
        return pathMap[path] || path;
    };

    return (
        <div className="flex items-center text-base font-medium mb-8">
            {/* Hiển thị từng phần tử trong đường dẫn */}
            {pathnames.map((name, index) => {
                // Tạo đường dẫn cho phần tử hiện tại
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                // Kiểm tra xem có phải phần tử cuối cùng không
                const isLast = index === pathnames.length - 1;

                return (
                    <React.Fragment key={name}>
                        <Link
                            to={routeTo}
                            className={`${isLast
                                    ? 'text-green-600 text-lg font-bold cursor-default'
                                    : 'text-gray-600 hover:text-green-600 text-lg'
                                } transition-colors duration-200`}
                            onClick={(e) => isLast && e.preventDefault()} // Ngăn click nếu là phần tử cuối
                        >
                            {getDisplayName(name)}
                        </Link>
                        {/* Hiển thị mũi tên nếu không phải phần tử cuối */}
                        {!isLast && (
                            <FiChevronRight className="mx-3 text-gray-400 text-lg" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Breadcrumb;
