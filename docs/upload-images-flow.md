# Tài liệu Luồng Xử lý Upload Ảnh

## 1. Tổng quan

Hệ thống upload ảnh bao gồm 3 thành phần chính:

- Frontend (ImageUpload.jsx)
- API Route (product.route.js)
- Xử lý Cloudinary (ImagesCloudinary_Controller.js)

## 2. Luồng xử lý

### 2.1. Frontend (ImageUpload.jsx)

1. **Khởi tạo component**:

   - Hiển thị form upload với 2 trạng thái: chưa có ảnh/đã có ảnh
   - Cho phép chọn nhiều file ảnh (multiple)
2. **Xử lý khi chọn file**:

   ```javascript
   const handleFileChange = async (e) => {
     // Kiểm tra file type
     // Tạo FormData
     // Gọi API upload
     // Hiển thị preview và thông báo kết quả
   }
   ```

### 2.2. API Route (product.route.js)

1. **Cấu hình Multer**:

   ```javascript
   const storage = multer.diskStorage({
     destination: './public/uploads/uploadPendingImages/',
     filename: // tạo tên file ngẫu nhiên
   });
   ```
2. **Route xử lý upload**:

   ```javascript
   router.post('/admin/products/upload-images',
     authenticateToken,
     isAdmin,
     upload.array('images'),
     async (req, res) => {
       // Upload từng file lên Cloudinary
       // Trả về danh sách URL
     }
   );
   ```

### 2.3. Xử lý Cloudinary (ImagesCloudinary_Controller.js)

1. **Cấu hình Cloudinary**:

   ```javascript
   cloudinary.config({
     cloud_name: '...',
     api_key: '...',
     api_secret: '...'
   });
   ```
2. **Upload file**:

   ```javascript
   async function uploadFile(file) {
     // Upload lên Cloudinary
     // Di chuyển file sang thư mục products
     // Trả về public_id
   }
   ```
3. **Lấy link ảnh**:

   ```javascript
   async function getImageLink(publicId) {
     // Lấy URL từ public_id
   }
   ```

## 3. Quy trình chi tiết

1. Người dùng chọn file ảnh từ giao diện
2. Frontend kiểm tra file type và tạo FormData
3. Gửi request POST đến `/api/admin/products/admin/products/upload-images`
4. Middleware xác thực (authenticateToken, isAdmin)
5. Multer lưu file tạm vào `/public/uploads/uploadPendingImages/`
6. Upload file lên Cloudinary
7. Di chuyển file từ thư mục tạm sang `/public/uploads/products/`
8. Trả về URL ảnh cho frontend
9. Frontend hiển thị preview và thông báo kết quả

## 4. Xử lý lỗi

- Kiểm tra file type ở frontend
- Try-catch ở các bước xử lý
- Thông báo lỗi qua toast
- Log lỗi ở server

## 5. Bảo mật

- Xác thực người dùng (authenticateToken)
- Kiểm tra quyền admin (isAdmin)
- Lưu trữ an toàn credentials Cloudinary

## 6. Thư mục lưu trữ

- `/public/uploads/uploadPendingImages/`: Lưu file tạm
- `/public/uploads/products/`: Lưu file sau khi xử lý
