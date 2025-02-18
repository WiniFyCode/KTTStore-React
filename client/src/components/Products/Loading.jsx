// Loading.jsx - Component hiển thị trạng thái loading cho trang sản phẩm
import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import PageBanner from '../PageBanner';

// Props:
// - theme: String - Theme hiện tại ('tet' hoặc 'normal')
// - icon: Component - Icon component để hiển thị trên banner
// - title: String - Tiêu đề của trang
// - subtitle: String - Phụ đề của trang
// - breadcrumbText: String - Text cho breadcrumb
const Loading = ({ theme, icon: Icon, title, subtitle, breadcrumbText }) => {
    return (
        // Container chính với background tùy theo theme
        <div className={`min-h-screen ${theme === 'tet' ? 'bg-red-50' : 'bg-gray-50'}`}>
            {/* Banner */}
            <PageBanner
                theme={theme}
                icon={Icon}
                title={title}
                subtitle={subtitle}
                breadcrumbText={breadcrumbText}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Thanh bộ lọc - Loading State */}
                <div className="relative z-10 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4">
                        {/* Tìm kiếm và các tùy chọn bộ lọc */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3 flex-grow">
                                {/* Ô tìm kiếm - Loading State */}
                                <div className="relative flex-grow max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                                        disabled
                                    />
                                    <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>

                                {/* Nút bộ lọc - Loading State */}
                                <div className="flex items-center gap-2">
                                    <button
                                        className="px-4 py-2.5 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all"
                                        disabled
                                    >
                                        <FaFilter className="text-gray-500" />
                                        <span>Bộ lọc</span>
                                    </button>
                                </div>
                            </div>

                            {/* Số lượng sản phẩm - Loading State */}
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-500">
                                    Đang tải...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Skeleton cho sản phẩm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {/* Tạo 12 skeleton items */}
                    {[...Array(12)].map((_, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Skeleton ảnh sản phẩm */}
                            <div className="relative aspect-[3/4] bg-gray-200 animate-pulse">
                                {/* Skeleton Badge giảm giá */}
                                <div className="absolute top-4 right-4">
                                    <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                                </div>
                                {/* Skeleton Badge tag */}
                                <div className="absolute top-4 left-4">
                                    <div className="h-6 w-12 bg-gray-300 rounded-full animate-pulse"></div>
                                </div>
                                {/* Skeleton Thumbnails */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="w-12 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Skeleton Nội dung sản phẩm */}
                            <div className="p-6 space-y-4">
                                {/* Skeleton Danh mục */}
                                <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse"></div>

                                {/* Skeleton Tiêu đề */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded-full w-1/2 animate-pulse"></div>
                                </div>

                                {/* Skeleton Giá */}
                                <div className="flex items-center gap-2">
                                    <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                                </div>

                                {/* Skeleton Màu sắc */}
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                                    <div className="flex gap-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skeleton Sizes */}
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skeleton Footer */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="h-4 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Loading;