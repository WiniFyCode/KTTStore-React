# KTTStore - Backend API

![KTTStore Banner](https://res.cloudinary.com/djh8j3ofk/image/upload/v1740591807/logo_kikkxc.png)

## 📝 Giới Thiệu

Backend API cho KTTStore - Website thương mại điện tử thời trang. Được xây dựng bằng Node.js, Express và MongoDB, cung cấp các API endpoints để quản lý sản phẩm, người dùng, đơn hàng và các tính năng khác.

## ✨ Tính Năng Chính

### 🔐 Xác Thực & Phân Quyền
- Đăng ký và đăng nhập người dùng
- Xác thực JWT
- Phân quyền người dùng (Admin/User)
- Đăng nhập với Google

### 📦 Quản Lý Sản Phẩm
- CRUD operations cho sản phẩm
- Upload hình ảnh với Cloudinary
- Phân loại và lọc sản phẩm
- Tìm kiếm sản phẩm

### 👥 Quản Lý Người Dùng
- Quản lý thông tin cá nhân
- Quản lý địa chỉ giao hàng
- Lịch sử đơn hàng

### 🛒 Quản Lý Đơn Hàng
- Tạo và cập nhật đơn hàng
- Xử lý thanh toán
- Theo dõi trạng thái đơn hàng
- Gửi email xác nhận

### 💬 Chat & Hỗ Trợ
- Chat realtime với Socket.io
- Hỗ trợ AI với Google Generative AI

## 🛠️ Công Nghệ Sử Dụng

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB với Mongoose
- **Authentication:** JWT, Google OAuth
- **File Upload:** Cloudinary
- **Email Service:** Nodemailer
- **Payment Integration:** PayOS
- **Realtime Communication:** Socket.io
- **AI Integration:** Google Generative AI
- **Others:** bcrypt, cors, moment, etc.

## 📁 Cấu Trúc Thư Mục

```
server/
├── controllers/    # Xử lý logic nghiệp vụ
├── models/        # MongoDB schemas
├── routes/        # API routes
├── middlewares/   # Custom middlewares
├── utils/         # Helper functions
├── mail/          # Email templates
├── data/          # Dữ liệu tĩnh
└── public/        # Static files
```

## 🚀 Hướng Dẫn Cài Đặt

1. Clone repository:
```bash
git clone https://github.com/WiniFyCode/KTTStore-BE.git
```

2. Di chuyển vào thư mục project:
```bash
cd KTTStore-BE/server
```

3. Cài đặt dependencies:
```bash
npm install
```

4. Tạo file .env và cấu hình các biến môi trường:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

5. Chạy server ở môi trường development:
```bash
npm run dev
```

## 🌐 API Endpoints

Server chạy tại: `http://localhost:5000`

## Dashboard

* GET /api/products/all-by-categories - Lấy thống kê sản phẩm theo danh mục
* GET /api/admin/users - Lấy thống kê về người dùng
* GET /api/admin/orders/admin/orders - Lấy thống kê về đơn hàng và doanh thu
* GET /api/admin/coupons/admin/coupons - Lấy thống kê về mã giảm giá
* GET /api/admin/promotions/all - Lấy thống kê về chương trình khuyến mãi
* GET /api/admin/notifications/admin/notifications - Lấy thống kê về thông báo
* GET /api/reviews/admin/all - Lấy thống kê về đánh giá sản phẩm

## Customer Management

* GET /api/admin/users/admin/users - Lấy danh sách khách hàng
* PATCH /api/admin/users/admin/users/toggle/{userID} - Kích hoạt/vô hiệu hóa tài khoản người dùng
* PUT /api/admin/users/admin/users/{userID} - Cập nhật thông tin cá nhân người dùng

## Product Management

* GET /api/admin/products/admin/products - Lấy danh sách sản phẩm
* GET /api/categories - Lấy danh sách danh mục
* GET /api/targets - Lấy danh sách đối tượng ( nam / nữ )
* GET /apip/admin/products/admin/produts/{productID} - Lấy chi tiết sản phẩm
* PUT /api/admin/products/admin/products/update/{productID} - Cập nhật thông tin cơ bản sản phẩm
* PUT /api/admin/product-size-stock/admin/product-size-stock/update/{SKU} - Cập nhật số lượng tồn
* PUT /api/admin/product-colors/admin/product-colors/add/{colorID}/images - Cập nhật hình ảnh của từng màu sắc
* DELETE /api/admin/product-colors/admin/product-colors/delete/{colorID}/images  - Xoá hình của màu
* POST /api/admin/product-colors/admin/product-colors/add/{produtID} - Thêm màu mới cho sản phẩm đã tồn tại
* DELETE /api/admin/product-colors/admin/product-colors/delete/{produtID} - Xoá màu của sản phẩm đã tồn tại
* POST /api/admin/products/admin/products/create - Tạo sản phẩm mới
* DELETE /api/admin/products/admin/products/delete/ - Xoá sản phẩm
* PATCH /api/admin/products/admin/products/toggle/{productID} - Kích hoạt / Vô hiệu hoá sản phẩm

## Order Management

* GET /api/admin/orders/admin/orders - Lấy danh sách đơn hàng
* GET /api/admin/orders/admin/order-details/{orderID} - Lấy chi tiết đơn hàng
* PATCH /api/admin/orders/admin/orders/update/{orderID} - Cập nhật trạng thái vận chuyển
* DELETE /api/admin/orders/admin/orders/delete/{orderID} - Xoá đơn hàng

## Promotion Management

* GET /api/admin/promotions/all - Lấy danh sách khuyến mãi
* POST /api/admin/promotions/create - Tạo khuyến mãi mới
* PUT /api/admin/promotions/update/{promotionID} - Cập nhật thông tin khuyến mãi
* DELETE /api/admin/promotions/delete/{promotionID} - Xóa khuyến mãi
* PATCH /api/admin/promotions/toggle-status/ - Kích hoạt/ Vô hiệu hoá khuyến mãi
* 
* GET /api/categories - Lấy các danh mục đang hoạt động trong khuyến mãi
* GET /api/products - Lấy các sản phẩm đang hoạt động trong khuyến mãi

## Coupon Management

* GET /api/admin/coupons/admin/coupons - Lấy danh sách mã giảm giá
* POST /api/admin/coupons/admin/coupons/create - Tạo mã giảm giá mới
* PUT /api/admin/coupons/admin/coupons/update/{couponID} - Cập nhật thông tin mã giảm giá
* DELETE /api/admin/coupons/admin/coupons/delete/{couponID} - Xóa mã giảm giá
* PATCH /api/admin/coupons/admin/coupons/toggle/{couponID} - Kích hoạt/vô hiệu hóa mã giảm giá
* 
* GET /api/categories - Lấy các danh mục đang hoạt động của mã giảm giá

## Notification Management

* GET /api/admin/notifications/admin/notifications - Lấy danh sách thông báo
* POST /api/admin/notifications/admin/notifications/create - Tạo thông báo mới
* PUT /api/admin/notifications/admin/notifications/update/{notificationID} - Cập nhật thông tin thông báo
* DELETE /api/admin/notifications/admin/notifications/delete/{notificationID} - Xóa thông báo
* 
* GET /api/admin/users - Lấy danh sách người dùng để gửi thông báo



## 📝 Scripts

- `npm start`: Chạy server ở môi trường production
- `npm run dev`: Chạy server với nodemon (development)

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

[MIT License](LICENSE)

## 👥 Tác Giả

- [@WiniFyCode](https://github.com/WiniFyCode)
- [Nguyễn Thanh Toàn](https://github.com/NguyenThanhToan)
- [Nguyễn Duy Khôi](https://github.com/NguyenDuyKhoi)

## 📞 Liên Hệ

Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ qua:
- Email: kttstore3cg@gmail.com
- Website: https://ktt-store-fe-ppa4.vercel.app/
