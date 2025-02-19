// Wishlist.jsx - Component hiển thị trang danh sách yêu thích của khách hàng

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axios';
import { toast } from 'react-toastify';
import { FaHeart, FaTrash, FaShoppingCart, FaRegHeart, FaBoxOpen, FaHome, FaTags, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import PageBanner from '../../../components/PageBanner';
import { getColorCode, isPatternOrStripe, getBackgroundSize } from '../../../utils/colorUtils';

const Wishlist = () => {
  // Sử dụng theme context và hook điều hướng
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Khởi tạo các state cần thiết
  const [favorites, setFavorites] = useState([]); // Danh sách sản phẩm yêu thích
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [editingNote, setEditingNote] = useState(null); // ID của ghi chú đang được chỉnh sửa
  const [noteText, setNoteText] = useState(''); // Nội dung ghi chú đang chỉnh sửa
  const [selectedImages, setSelectedImages] = useState({}); // Lưu trữ ảnh được chọn cho mỗi sản phẩm
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State cho modal xác nhận xóa
  const [itemToDelete, setItemToDelete] = useState(null); // State lưu item cần xóa

  // Hàm lấy danh sách sản phẩm yêu thích từ API
  const fetchFavorites = async (page = 1) => {
    try {
      setLoading(true);
      // Lấy token xác thực từ localStorage hoặc sessionStorage
      const localToken = localStorage.getItem('customerToken');
      const sessionToken = sessionStorage.getItem('customerToken');
      const token = localToken || sessionToken;
      
      // Kiểm tra đăng nhập
      if (!token) {
        navigate('/login');
        return;
      }

      // Gọi API lấy danh sách yêu thích
      const response = await axiosInstance.get(`/api/favorite?page=${page}&limit=12`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Cập nhật state với dữ liệu nhận được
      setFavorites(response.data.items);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      // Xử lý các trường hợp lỗi
      if (error.response && error.response.status === 403) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        sessionStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error('Không thể tải danh sách yêu thích');
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect hook để fetch dữ liệu khi component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Hàm xóa sản phẩm khỏi danh sách yêu thích
  const handleRemove = async (favoriteID) => {
    setItemToDelete(favorites.find(item => item.favoriteID === favoriteID));
    setShowDeleteModal(true);
  };

  // Thêm hàm xử lý xóa thực sự
  const confirmDelete = async () => {
    try {
      const localToken = localStorage.getItem('customerToken');
      const sessionToken = sessionStorage.getItem('customerToken');
      const token = localToken || sessionToken;

      if (!itemToDelete) return;

      await axiosInstance.delete(`/api/favorite/${itemToDelete.SKU}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setFavorites(prevFavorites => prevFavorites.filter(item => item.favoriteID !== itemToDelete.favoriteID));
      toast.success('Đã xóa khỏi danh sách yêu thích');
      window.dispatchEvent(new Event('wishlistChange'));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      // Xử lý lỗi
      if (error.response && error.response.status === 403) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        sessionStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error('Không thể xóa sản phẩm');
      }
    }
  };

  // Hàm cập nhật ghi chú cho sản phẩm
  const handleUpdateNote = async (favoriteID) => {
    try {
      // Lấy token xác thực
      const localToken = localStorage.getItem('customerToken');
      const sessionToken = sessionStorage.getItem('customerToken');
      const token = localToken || sessionToken;

      // Gọi API cập nhật ghi chú
      await axiosInstance.put(`/api/favorite/${favoriteID}`, { note: noteText }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Cập nhật state sau khi cập nhật thành công
      setFavorites(prevFavorites => 
        prevFavorites.map(item => 
          item.favoriteID === favoriteID 
            ? { ...item, note: noteText }
            : item
        )
      );

      toast.success('Đã cập nhật ghi chú');
      setEditingNote(null);
    } catch (error) {
      // Xử lý lỗi
      if (error.response && error.response.status === 403) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        sessionStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error('Không thể cập nhật ghi chú');
      }
    }
  };

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async (item) => {
    try {
      // Lấy token xác thực
      const localToken = localStorage.getItem('customerToken');
      const sessionToken = sessionStorage.getItem('customerToken');
      const token = localToken || sessionToken;

      // Gọi API thêm vào giỏ hàng
      const response = await axiosInstance.post('/api/cart/add', {
        SKU: item.SKU,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        toast.success('Đã thêm vào giỏ hàng');
        window.dispatchEvent(new Event('cartChange'));
      } else {
        toast.error('Không thể thêm vào giỏ hàng');
      }

    } catch (error) {
      // Xử lý lỗi
      if (error.response && error.response.status === 403) {
        toast.error('Phiên đăng nhập đã hết hạn');
        localStorage.removeItem('customerToken');
        sessionStorage.removeItem('customerToken');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      }
    }
  };

  // Hàm xử lý khi click vào thumbnail ảnh
  const handleThumbnailClick = (favoriteID, imageIndex) => {
    setSelectedImages(prev => ({
      ...prev,
      [favoriteID]: imageIndex
    }));
  };

  // Render trạng thái loading
  if (loading) {
    return (
      <div className={`min-h-screen ${
        theme === 'tet' 
          ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <PageBanner
          theme={theme}
          icon={FaHeart}
          title={'DANH SÁCH YÊU THÍCH'}
          breadcrumbText="Danh sách yêu thích"
          extraContent={
            <div className="flex items-center justify-center gap-3 text-xl text-white/90">
              <FaRegHeart className="w-6 h-6" />
              <p>Đang tải...</p>
            </div>
          }
        />

        {/* Hiển thị skeleton loading */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Danh sách yêu thích</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                {/* Skeleton cho ảnh sản phẩm */}
                <div className="relative aspect-square bg-gray-200 animate-pulse">
                  <div className="absolute top-2 right-2 w-12 h-6 rounded-full bg-gray-300 animate-pulse"></div>
                </div>

                {/* Skeleton cho thông tin sản phẩm */}
                <div className="p-4 space-y-4">
                  <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-full h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="flex items-center justify-between gap-4 mt-4">
                    <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton cho phân trang */}
          <div className="flex justify-center mt-8 gap-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render giao diện chính
  return (
    <div className={`min-h-screen ${
      theme === 'tet' 
        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Banner trang */}
      <PageBanner
        theme={theme}
        icon={FaHeart}
        title="DANH SÁCH YÊU THÍCH"
        breadcrumbText="Danh sách yêu thích"
        extraContent={
          <div className="flex items-center justify-center gap-3 text-xl text-white/90">
            <FaRegHeart className="w-6 h-6" />
            <p>
              {favorites.length} sản phẩm trong danh sách của bạn
            </p>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Danh sách yêu thích</h1>
        
        {/* Hiển thị khi không có sản phẩm yêu thích */}
        {favorites.length === 0 ? (
          <div className={`text-center py-8 ${
            theme === 'tet' 
              ? 'bg-white shadow-red-100/50' 
              : 'bg-white shadow-blue-100/50'
          } shadow-xl backdrop-blur-sm bg-opacity-60`}>
            <div className={`w-24 h-24 mx-auto mb-8 animate-bounce ${
              theme === 'tet' ? 'text-red-300' : 'text-blue-300'
            }`}>
              <FaBoxOpen className="w-full h-full" />
            </div>
            <p className="text-gray-500 text-xl mb-8">Danh sách yêu thích của bạn đang trống</p>
            <Link
              to="/products"
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-white transition-all transform hover:scale-105 hover:-translate-y-1 ${
                theme === 'tet' 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-200' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-200'
              } shadow-lg`}
            >
              <FaTags className="w-5 h-5" />
              <span>Khám phá sản phẩm</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Grid hiển thị sản phẩm yêu thích */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {favorites.map((item) => (
                <div key={item.favoriteID} className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 flex flex-col ${
                  theme === 'tet' ? 'hover:shadow-red-100/50' : 'hover:shadow-blue-100/50'
                }`}>
                  {/* Phần ảnh sản phẩm */}
                  <div className="relative group aspect-square">
                    <Link to={`/product/${item.product.productID}`} className="block relative pt-[100%] overflow-hidden">
                      {/* Ảnh chính */}
                      <img
                        src={item.product.images?.[selectedImages[item.favoriteID] || 0] || item.product.thumbnail}
                        alt={item.product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay gradient khi hover */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                        theme === 'tet' 
                          ? 'bg-gradient-to-t from-red-900/30 to-transparent' 
                          : 'bg-gradient-to-t from-blue-900/30 to-transparent'
                      }`} />
                    </Link>

                    {/* Thumbnails ảnh */}
                    {item.product.images?.length > 1 && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {item.product.images.slice(0, 4).map((image, index) => (
                          <div
                            key={index}
                            onClick={(e) => {
                              e.preventDefault();
                              handleThumbnailClick(item.favoriteID, index);
                            }}
                            className={`w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                              selectedImages[item.favoriteID] === index
                                ? 'border-2 border-white ring-2 ring-offset-2 ' + (theme === 'tet' ? 'ring-red-500' : 'ring-blue-500')
                                : 'border-2 border-white hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${item.product.name} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Badge giảm giá */}
                    {item.product.originalPrice > item.product.price && (
                      <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium text-white ${
                        theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        -{Math.round((1 - item.product.price/item.product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Phần thông tin sản phẩm */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Tên sản phẩm */}
                    <Link
                      to={`/product/${item.product.productID}`}
                      className={`block text-xl font-bold mb-3 hover:underline decoration-2 underline-offset-2 ${
                        theme === 'tet' ? 'hover:text-red-600' : 'hover:text-blue-600'
                      }`}
                    >
                      <div className="line-clamp-2">{item.product.name}</div>
                    </Link>

                    {/* Giá và thông tin */}
                    <div className="flex-1 space-y-3">
                      {/* Giá */}
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${
                          theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {item.product.price.toLocaleString()}đ
                        </p>
                        {item.product.originalPrice > item.product.price && (
                          <p className="text-sm text-gray-400 line-through">
                            {item.product.originalPrice.toLocaleString()}đ
                          </p>
                        )}
                      </div>

                      {/* Màu sắc và kích thước */}
                      <div className="flex items-center gap-4">
                        {item.colorName && (
                          <div className="flex items-center text-gray-500">
                            <span className="font-medium mr-2">Màu:</span>
                            <span className="flex items-center gap-2">
                              <span
                                className={`inline-block w-6 h-6 rounded-full border shadow-sm`}
                                style={{
                                  background: getColorCode(item.colorName),
                                  backgroundSize: getBackgroundSize(item.colorName),
                                  borderColor: item.colorName.toLowerCase() === 'trắng' ? '#e5e7eb' : 'transparent'
                                }}
                              />
                              {item.colorName}
                            </span>
                          </div>
                        )}
                        {item.size && (
                          <div className="flex items-center text-gray-500">
                            <span className="font-medium mr-2">Size:</span>
                            <span>{item.size}</span>
                          </div>
                        )}
                      </div>

                      {/* Phần ghi chú */}
                      {editingNote === item.favoriteID ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Thêm ghi chú..."
                          />
                          <button
                            onClick={() => handleUpdateNote(item.favoriteID)}
                            className={`px-4 py-2 rounded-xl text-white ${
                              theme === 'tet' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            Lưu
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNote(item.favoriteID);
                            setNoteText(item.note || '');
                          }}
                          className="cursor-pointer text-gray-500 hover:text-gray-700"
                        >
                          {item.note || 'Thêm ghi chú...'}
                        </div>
                      )}
                    </div>

                    {/* Các nút thao tác */}
                    <div className="flex items-center justify-between gap-4 mt-4">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white transition-all ${
                          theme === 'tet'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        <FaShoppingCart className="w-5 h-5" />
                        <span>Thêm vào giỏ</span>
                      </button>
                      <button
                        onClick={() => handleRemove(item.favoriteID)}
                        className="p-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Xóa khỏi danh sách yêu thích"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => fetchFavorites(index + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteModal(false)}></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                    theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                    <FaTrash className={`h-6 w-6 ${
                      theme === 'tet' ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xác nhận xóa
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa sản phẩm "{itemToDelete.product.name}" khỏi danh sách yêu thích không?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 ${
                    theme === 'tet'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors`}
                >
                  Xóa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
