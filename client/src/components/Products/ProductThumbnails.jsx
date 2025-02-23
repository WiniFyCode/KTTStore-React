// ProductThumbnails.jsx - Component hiển thị các ảnh thumbnail của sản phẩm
import React, { useState } from 'react';
import { FaImages } from 'react-icons/fa';

// Props:
// - images: Array - Mảng chứa đường dẫn các hình ảnh thumbnail
// - productID: String/Number - ID của sản phẩm
// - productName: String - Tên sản phẩm (dùng cho alt của ảnh)
// - selectedImages: Object - Object lưu trữ thông tin ảnh đang được chọn
// - theme: String - Theme hiện tại ('tet' hoặc 'normal', mặc định là 'normal')
// - onThumbnailClick: Function - Hàm xử lý khi click vào thumbnail
const ProductThumbnails = ({ 
  images, 
  productID, 
  productName,
  selectedImages,
  theme = 'normal',
  onThumbnailClick 
}) => {
  const [showThumbnails, setShowThumbnails] = useState(false);

  return (
    <>
      {/* Container chính của thumbnails */}
      <div
        className={`
          absolute bottom-3 left-0 right-0 px-2 z-10
          hidden md:flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        `}
        onClick={e => e.preventDefault()} 
      >
        {/* Hiển thị tối đa 4 thumbnail trên desktop */}
        {images.slice(0, 4).map((image, index) => (
          <div
            key={index}
            onClick={(e) => onThumbnailClick(e, productID, index)}
            className={`
              w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                selectedImages[productID]?.imageIndex === index
                  ? 'border-2 border-white ring-2 ring-offset-2 ' + 
                    (theme === 'tet' ? 'ring-red-500' : 'ring-blue-500')
                  : 'border-2 border-white hover:border-gray-300'
              }
            `}
          >
            <img
              src={image}
              alt={`${productName} - ${index + 1}`}
              className="w-full h-full object-cover"
              onClick={e => e.preventDefault()} 
            />
          </div>
        ))}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {/* Nút hiển thị thumbnails trên mobile */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowThumbnails(!showThumbnails);
          }}
          className={`
            absolute bottom-3 right-3 z-10 p-2 rounded-full 
            ${theme === 'tet' 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
            }
            shadow-lg
          `}
        >
          <FaImages className="w-5 h-5" />
        </button>

        {/* Thumbnails trên mobile */}
        {showThumbnails && (
          <div
            className="absolute bottom-3 left-0 right-0 px-2 z-10 flex justify-center gap-2"
            onClick={e => e.preventDefault()}
          >
            {images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                onClick={(e) => {
                  onThumbnailClick(e, productID, index);
                  setShowThumbnails(false); // Ẩn thumbnails sau khi chọn
                }}
                className={`
                  w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all transform 
                  ${selectedImages[productID]?.imageIndex === index
                    ? 'border-2 border-white ring-2 ring-offset-2 ' + 
                      (theme === 'tet' ? 'ring-red-500' : 'ring-blue-500')
                    : 'border-2 border-white'
                  }
                `}
              >
                <img
                  src={image}
                  alt={`${productName} - ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={e => e.preventDefault()}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductThumbnails; 