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
# Server config - Cấu hình server
PORT=5000                    # Port máy chủ chạy
JWT_SECRET=your_jwt_secret   # Khóa bí mật để tạo JWT token
MONGODB_URI=your_mongodb_uri # URI kết nối MongoDB Atlas
VITE_API_URL=http://localhost:5000  # URL API cho frontend

# Shop info - Thông tin cửa hàng
SHOP_NAME=KTT Store          # Tên cửa hàng
SHOP_ADDRESS=your_address    # Địa chỉ cửa hàng
SHOP_PHONE=your_phone       # Số điện thoại
SHOP_EMAIL=your_email       # Email cửa hàng

# Admin config - Cấu hình admin
ADMIN_URL=your_admin_url    # URL trang quản trị

# Email config - Cấu hình email
EMAIL_USER=your_email       # Email dùng để gửi thông báo
EMAIL_PASSWORD=your_password # Mật khẩu ứng dụng email
EMAIL_ADMIN=your_admin_email # Email admin

# AI Integration - Tích hợp AI
OPENAI_API_KEY=your_openai_key    # API key OpenAI
GEMINI_API_KEY=your_gemini_key    # API key Google Gemini

# Payment Integration - Tích hợp thanh toán
PAYOS_CLIENT_ID=your_client_id        # Client ID PayOS
PAYOS_API_KEY=your_api_key            # API key PayOS
PAYOS_CHECKSUM_KEY=your_checksum_key  # Checksum key PayOS

# Social Login - Đăng nhập mạng xã hội
FB_APP_ID=your_fb_app_id              # Facebook App ID
GOOGLE_CLIENT_ID=your_google_client_id      # Google Client ID
GOOGLE_CLIENT_SECRET=your_google_secret     # Google Client Secret
```

5. Chạy server ở môi trường development:
```bash
npm run dev
```

## 🌐 API Endpoints

Server chạy tại: `http://localhost:5000`

### 📍 Address Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/addresses` | Lấy danh sách địa chỉ | 🔒 Required |
| POST | `/api/addresses` | Thêm địa chỉ mới | 🔒 Required |
| PUT | `/api/addresses/:id` | Cập nhật địa chỉ | 🔒 Required |
| DELETE | `/api/addresses/:id` | Xóa địa chỉ | 🔒 Required |
| PATCH | `/api/addresses/:id/default` | Đặt địa chỉ mặc định | 🔒 Required |

### 🤖 AI Chat APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| POST | `/api/ai/chat` | Chat với AI Assistant | Không yêu cầu |

### 🔐 Authentication APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| POST | `/api/auth/register` | Đăng ký tài khoản | Không |
| POST | `/api/auth/login` | Đăng nhập | Không |
| POST | `/api/auth/forgot-password` | Yêu cầu reset mật khẩu | Không |
| POST | `/api/auth/reset-password` | Reset mật khẩu | Không |
| POST | `/api/auth/verify-token` | Xác thực token | Không |
| POST | `/api/auth/google-login` | Đăng nhập bằng Google | Không |

### 🛒 Cart Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/cart` | Lấy giỏ hàng của user | 🔒 Required |
| POST | `/api/cart/add` | Thêm sản phẩm vào giỏ | 🔒 Required |
| PUT | `/api/cart/:id` | Cập nhật số lượng sản phẩm | 🔒 Required |
| DELETE | `/api/cart/:id` | Xóa sản phẩm khỏi giỏ | 🔒 Required |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ hàng | 🔒 Required |

### 📑 Category Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/categories` | Lấy tất cả danh mục | Không |
| GET | `/api/categories/:id` | Lấy chi tiết danh mục | Không |
| POST | `/api/categories` | Tạo danh mục mới | 🔒 Admin |
| PUT | `/api/categories/:id` | Cập nhật danh mục | 🔒 Admin |
| DELETE | `/api/categories/:id` | Xóa danh mục | 🔒 Admin |

### 🎫 Coupon Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/coupons/admin/coupons` | Lấy danh sách mã giảm giá | 🔒 Admin |
| POST | `/api/coupons/admin/coupons/create` | Tạo mã giảm giá mới | 🔒 Admin |
| PUT | `/api/coupons/admin/coupons/update/:id` | Cập nhật mã giảm giá | 🔒 Admin |
| DELETE | `/api/coupons/admin/coupons/delete/:id` | Xóa mã giảm giá | 🔒 Admin |
| PATCH | `/api/coupons/admin/coupons/toggle/:id` | Kích hoạt/vô hiệu hóa mã | 🔒 Admin |

### ❤️ Favorite Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/favorites` | Lấy danh sách yêu thích của user | 🔒 Required |
| POST | `/api/favorites/add` | Thêm sản phẩm vào yêu thích | 🔒 Required |
| PUT | `/api/favorites/:id` | Cập nhật ghi chú yêu thích | 🔒 Required |
| DELETE | `/api/favorites/:SKU` | Xóa sản phẩm khỏi yêu thích | 🔒 Required |
| GET | `/api/favorites/check/:SKU` | Kiểm tra sản phẩm có trong yêu thích | 🔒 Required |

### 🔔 Notification Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/admin/notifications` | Lấy tất cả thông báo | 🔒 Admin |
| POST | `/api/admin/notifications/create` | Tạo thông báo mới | 🔒 Admin |
| PUT | `/api/admin/notifications/update/:id` | Cập nhật thông báo | 🔒 Admin |
| DELETE | `/api/admin/notifications/delete/:id` | Xóa thông báo | 🔒 Admin |

### 📦 Order Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/orders/my-orders` | Lấy danh sách đơn hàng của user | 🔒 Required |
| GET | `/api/orders/my-orders/:id` | Lấy chi tiết đơn hàng | 🔒 Required |
| POST | `/api/orders/create` | Tạo đơn hàng mới | 🔒 Required |
| POST | `/api/orders/cancel/:id` | Hủy đơn hàng | 🔒 Required |
| GET | `/api/orders/admin/orders` | Lấy tất cả đơn hàng (Admin) | 🔒 Admin |
| PATCH | `/api/orders/admin/orders/update/:id` | Cập nhật trạng thái đơn hàng | 🔒 Admin |
| DELETE | `/api/orders/admin/orders/delete/:id` | Xóa đơn hàng | 🔒 Admin |
| POST | `/api/orders/confirm-payment/:orderID` | Xác nhận thanh toán và gửi email (AUTO) | Không |

### 📦 Order Detail Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/order-details/order/:orderID` | Lấy danh sách chi tiết đơn hàng | 🔒 Required |
| GET | `/api/order-details/order/:orderID/detail/:id` | Lấy chi tiết một sản phẩm trong đơn hàng | 🔒 Required |
| GET | `/api/order-details/:orderID` | Lấy chi tiết đơn hàng (Admin) | 🔒 Admin |


### 🎨 Product Color Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/product-colors/product/:productID` | Lấy tất cả màu của sản phẩm | 🔒 Required |
| GET | `/api/product-colors/:id` | Lấy chi tiết màu | 🔒 Required |
| PUT | `/api/product-colors/:id` | Cập nhật màu | 🔒 Required |
| PUT | `/api/product-colors/admin/product-colors/add/:id/images` | Upload hình ảnh | 🔒 Admin |
| DELETE | `/api/product-colors/admin/product-colors/delete/:id/images` | Xóa hình ảnh | 🔒 Admin |
| POST | `/api/product-colors/admin/product-colors/add/:id` | Thêm màu mới | 🔒 Admin |
| DELETE | `/api/product-colors/admin/product-colors/delete/:id` | Xóa màu | 🔒 Admin |

### 📦 Product Size Stock Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/product-size-stock/sku/:SKU` | Lấy thông tin tồn kho theo SKU | Không |
| GET | `/api/product-size-stock/color/:colorID` | Lấy tồn kho theo màu | Không |
| GET | `/api/product-size-stock/info/:productID/:colorName/:size` | Lấy thông tin SKU | Không |
| PUT | `/api/product-size-stock/admin/product-size-stock/update/:SKU` | Cập nhật số lượng tồn kho | 🔒 Admin |

### 📦 Product Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/products` | Lấy danh sách sản phẩm | Không |
| GET | `/api/products/basic` | Lấy thông tin cơ bản của tất cả sản phẩm | Không |
| GET | `/api/products/gender` | Lấy sản phẩm theo giới tính | Không |
| GET | `/api/products/category/:categoryID` | Lấy sản phẩm theo danh mục | Không |
| GET | `/api/products/:id` | Lấy chi tiết sản phẩm | Không |
| GET | `/api/products/all-by-categories` | Lấy sản phẩm theo danh mục (Dashboard) | 🔒 Admin |
| GET | `/api/products/admin/products` | Lấy danh sách sản phẩm (Admin) | 🔒 Admin |
| GET | `/api/products/admin/products/:id` | Lấy chi tiết sản phẩm (Admin) | 🔒 Admin |
| PUT | `/api/products/admin/products/update/:id` | Cập nhật sản phẩm | 🔒 Admin |
| POST | `/api/products/admin/products/create` | Tạo sản phẩm mới | 🔒 Admin |
| DELETE | `/api/products/admin/products/delete/:id` | Xóa sản phẩm | 🔒 Admin |
| PATCH | `/api/products/admin/products/toggle/:id` | Bật/tắt trạng thái sản phẩm | 🔒 Admin |
| POST | `/api/products/admin/products/upload-images` | Upload hình ảnh sản phẩm | 🔒 Admin |

### 🎯 Promotion Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/promotions/all` | Lấy tất cả khuyến mãi | 🔒 Admin |
| POST | `/api/promotions/create` | Tạo khuyến mãi mới | 🔒 Admin |
| PUT | `/api/promotions/update/:id` | Cập nhật khuyến mãi | 🔒 Admin |
| DELETE | `/api/promotions/delete/:id` | Xóa khuyến mãi | 🔒 Admin |
| PATCH | `/api/promotions/toggle-status/:id` | Bật/tắt trạng thái khuyến mãi | 🔒 Admin |
| GET | `/api/promotions/active` | Lấy khuyến mãi đang hoạt động | Không |
| GET | `/api/promotions/:promotionID` | Lấy chi tiết khuyến mãi | Không |
| GET | `/api/promotions/product/:productId` | Lấy khuyến mãi của sản phẩm | Không |

### ⭐ Review Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/reviews/product/:productID` | Lấy đánh giá của sản phẩm | Không |
| POST | `/api/reviews` | Tạo đánh giá mới | 🔒 Customer |
| PUT | `/api/reviews/:reviewID` | Cập nhật đánh giá | 🔒 Customer |
| DELETE | `/api/reviews/:reviewID` | Xóa đánh giá | 🔒 Customer |
| GET | `/api/reviews/user` | Lấy đánh giá của user hiện tại | 🔒 Customer |
| GET | `/api/reviews/admin/all` | Lấy tất cả đánh giá | 🔒 Admin |
| DELETE | `/api/reviews/admin/:reviewID` | Admin xóa đánh giá | 🔒 Admin |

### 🎯 Target Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/targets` | Lấy tất cả target | Không |
| GET | `/api/targets/:id` | Lấy chi tiết target | 🔒 Admin |
| POST | `/api/targets` | Tạo target mới | 🔒 Admin |
| PUT | `/api/targets/:id` | Cập nhật target | 🔒 Admin |
| DELETE | `/api/targets/:id` | Xóa target | 🔒 Admin |

### 🎫 User-Coupon Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/user-coupons/my-coupons` | Lấy danh sách mã giảm giá của user | 🔒 Customer |
| GET | `/api/user-coupons/my-coupons/:id` | Lấy chi tiết mã giảm giá | 🔒 Customer |
| POST | `/api/user-coupons/apply` | Sử dụng mã giảm giá | 🔒 Customer |
| GET | `/api/user-coupons/available` | Lấy danh sách mã giảm giá có thể sử dụng | 🔒 Customer |
| GET | `/api/user-coupons` | Lấy danh sách mã giảm giá của tất cả user | 🔒 Admin |
| POST | `/api/user-coupons` | Thêm mã giảm giá cho user | 🔒 Admin |
| PUT | `/api/user-coupons/:id` | Cập nhật mã giảm giá | 🔒 Admin |
| PATCH | `/api/user-coupons/:id/cancel` | Hủy mã giảm giá | 🔒 Admin |

### 🔔 User-Notification Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/user-notifications` | Lấy danh sách thông báo của user | 🔒 Customer |
| PUT | `/api/user-notifications/:userNotificationID/read` | Đánh dấu thông báo đã đọc | 🔒 Customer |
| PUT | `/api/user-notifications/read-all` | Đánh dấu tất cả thông báo đã đọc | 🔒 Customer |
| GET | `/api/user-notifications/unread/count` | Lấy số lượng thông báo chưa đọc | 🔒 Customer |

### 👤 User Management APIs
| Method | Endpoint | Mô tả | Xác thực |
|--------|----------|--------|----------|
| GET | `/api/users/profile` | Lấy thông tin cá nhân | 🔒 Customer |
| PUT | `/api/users/profile` | Cập nhật thông tin cá nhân | 🔒 Customer |
| PUT | `/api/users/change-password` | Đổi mật khẩu | 🔒 Customer |
| GET | `/api/users/admin/users` | Lấy danh sách người dùng cho admin | 🔒 Admin |
| PUT | `/api/users/admin/users/:id` | Cập nhật thông tin người dùng | 🔒 Admin |
| PATCH | `/api/users/admin/users/toggle/:id` | Vô hiệu hóa/Kích hoạt tài khoản | 🔒 Admin |


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
