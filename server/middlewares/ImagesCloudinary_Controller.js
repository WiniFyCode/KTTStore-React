const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: 'djh8j3ofk',
  api_key: '747932665488779',
  api_secret: '7elw2YlkaF6T0VemR-DBfQdhkfA'
});

// Hàm tải lên file lên Cloudinary
async function uploadFile(file) {
  try {
    const fileName = path.parse(file).name; // Lấy tên file mà không có phần mở rộng
    const options = {
      public_id: fileName
    };

    const uploadResult = await cloudinary.uploader.upload(file, options);
    console.log(`Đã tải lên thành công: ${uploadResult.public_id}`);
    
    // Xóa file tạm sau khi đã upload lên Cloudinary
    fs.unlinkSync(file);
    console.log(`Đã xóa file tạm thành công`);

    return uploadResult.public_id;
  } catch (error) {
    console.error('Lỗi khi tải lên:', error);
    throw error;
  }
}

// Thư mục chứa các tập tin cần tải lên
const directoryPath = './public/uploads/uploadPendingImages';

// Đọc danh sách tập tin trong thư mục
async function uploadImagesInUploadPendingImages() {
  fs.readdir(directoryPath, async (err, files) => {
    if (err) {
      console.error('Lỗi khi đọc thư mục:', err);
      return;
    }

    // Duyệt qua từng tập tin và tải lên Cloudinary
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const publicId = await uploadFile(filePath);
      console.log(`Đã tải lên ${file}: ${publicId}`);
    }
  });
}

async function getImageLink(publicId) {
  try {
    const imageUrl = await cloudinary.url(publicId);
    //console.log(`Đường link cho ảnh đã upload là: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error('Đã xảy ra lỗi khi lấy đường link ảnh:', error);
    throw error;
  }
}

/**
 * Hàm xóa ảnh trên Cloudinary
 * @param {string} imageUrl - URL đầy đủ của ảnh trên Cloudinary
 * @returns {Promise<boolean>} - true nếu xóa thành công, false nếu thất bại
 */
async function deleteImage(imageUrl) {
  try {
    // Xử lý URL để lấy public_id
    const urlParts = imageUrl.split('/');
    const fileNameWithParams = urlParts[urlParts.length - 1];
    const publicId = fileNameWithParams.split('?')[0].split('.')[0]; // Lấy phần trước dấu ? và .

    // Thực hiện xóa ảnh trên Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    // Kiểm tra kết quả xóa
    if (result.result === 'ok') {
      console.log(`Đã xóa thành công ảnh: ${publicId}`);
      return true;
    } else {
      console.error(`Không thể xóa ảnh: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.error('Lỗi khi xóa ảnh:', error);
    throw error;
  }
}

module.exports = { 
  uploadImagesInUploadPendingImages,
  getImageLink,
  uploadFile,
  deleteImage
}
