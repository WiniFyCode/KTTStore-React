import React, { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from '../utils/axios';

const ImageUpload = ({ onImageUpload, currentImage }) => {
    const [previewUrl, setPreviewUrl] = useState(currentImage || '');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Kiểm tra file type
        for (let file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chỉ chọn file hình ảnh');
                return;
            }
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            
            // Thêm nhiều file vào formData
            for (let file of files) {
                formData.append('images', file);
            }

            // Gửi request upload ảnh
            const response = await axios.post('/api/admin/products/admin/products/upload-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const imageUrls = response.data.imageUrls;
                setPreviewUrl(imageUrls[0]); // Hiển thị preview ảnh đầu tiên
                onImageUpload(imageUrls); // Trả về tất cả URL ảnh
                toast.success('Tải ảnh lên thành công');
            }

        } catch (error) {
            console.error('Lỗi khi upload ảnh:', error);
            toast.error('Lỗi khi tải ảnh lên: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl('');
        onImageUpload([]);
    };

    return (
        <div className="relative">
            <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                multiple // Cho phép chọn nhiều file
                className="hidden"
                id="image-upload"
            />
            
            {!previewUrl ? (
                <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <FiUpload className="w-8 h-8 mb-2 text-gray-500" />
                    <span className="text-sm text-gray-500">Click để tải ảnh lên</span>
                    <span className="text-xs text-gray-400 mt-1">Có thể chọn nhiều ảnh</span>
                </label>
            ) : (
                <div className="relative">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Loading indicator */}
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;