# KTT STORE - Website Bán Giày Thể Thao

## 📝 Mô tả
KTT Store là website bán giày thể thao trực tuyến được xây dựng bằng React. Dự án bao gồm đầy đủ tính năng cho cả người dùng và quản trị viên, với giao diện thân thiện và trải nghiệm mua sắm mượt mà.

## 🛠️ Công nghệ sử dụng
- Frontend: React, Redux Toolkit, TailwindCSS
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT

## ✨ Tính năng chính

### 👤 Người dùng
- Đăng ký, đăng nhập, quên mật khẩu
- Xem và tìm kiếm sản phẩm theo danh mục, giới tính
- Quản lý giỏ hàng và thanh toán
- Theo dõi đơn hàng và lịch sử mua hàng
- Đánh giá sản phẩm
- Quản lý thông tin cá nhân và địa chỉ
- Sử dụng mã giảm giá
- Theo dõi sản phẩm yêu thích
- Nhận thông báo về khuyến mãi và đơn hàng

### 👨‍💼 Quản trị viên
- Quản lý sản phẩm (thêm, sửa, xóa, cập nhật tồn kho)
- Quản lý đơn hàng
- Quản lý khuyến mãi và mã giảm giá
- Quản lý người dùng
- Quản lý thông báo
- Xem thống kê và báo cáo

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js phiên bản 18.x trở lên
- MySQL 8.x
- Git

### Các bước cài đặt

1. Clone repository
```bash
git clone https://github.com/WiniFyCode/KTTStore-React.git
cd KTTStore-React
```

2. Cài đặt dependencies cho client
```bash
cd client
npm install
```

3. Cài đặt dependencies cho server
```bash
cd ../server
npm install
```

4. Cấu hình database
- Tạo database MongoDB mới
- Copy file `.env.example` thành `.env` trong thư mục server
- Cập nhật thông tin kết nối database trong file `.env`

5. Khởi chạy ứng dụng

Chạy server:
```bash
cd server
npm run dev
```

Chạy client:
```bash
cd client
npm run dev
```

Ứng dụng sẽ chạy tại:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 Cấu trúc thư mục

### 🖥️ Frontend (client)
```
client/
├── public/                 # Static files
│   ├── images/            # Hình ảnh tĩnh
│   ├── favicon.ico        
│   └── index.html         # HTML template
│
├── src/                   # Source code
│   ├── assets/           # Assets (images, fonts, etc.)
│   │
│   ├── components/       # Shared components
│   │   ├── AI/          # Components AI chat
│   │   ├── Products/    # Components sản phẩm
│   │   └── ...
│   │
│   ├── contexts/        # React contexts
│   │   ├── AdminThemeContext.jsx
│   │   └── CustomerThemeContext.jsx 
│   │
│   ├── hooks/           # Custom hooks
│   │
│   ├── layouts/         # Layout components
│   │   ├── AdminLayout/
│   │   └── CustomerLayout/
│   │
│   ├── pages/           # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── customer/   # Customer pages
│   │   └── ...
│   │
│   ├── redux/          # Redux store & slices
│   │   ├── slices/
│   │   └── store.js
│   │
│   ├── services/       # API services
│   │
│   ├── styles/         # Global styles
│   │
│   ├── utils/          # Utility functions
│   │
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
│
├── .env                # Environment variables
├── .gitignore         # Git ignore file
├── package.json       # Dependencies
├── vite.config.js     # Vite configuration
└── tailwind.config.js # Tailwind configuration
```

### ⚙️ Backend (server)
```
server/
├── config/            # Configuration files
│   ├── database.js   # Database config
│   └── ...
│
├── controllers/      # Route controllers
│   ├── AuthController.js
│   ├── ProductController.js
│   └── ...
│
├── data/            # Static data/seeds
│   └── trainingData.js
│
├── mail/            # Email templates & handlers
│   ├── EmailController.js
│   └── templates/
│
├── middlewares/     # Custom middlewares
│   ├── auth.js
│   └── ...
│
├── models/          # Database models
│   ├── User.js
│   ├── Product.js
│   └── ...
│
├── routes/          # API routes
│   ├── auth.js
│   ├── products.js
│   └── ...
│
├── services/        # Business logic
│   ├── PaymentService.js
│   └── ...
│
├── uploads/         # Uploaded files
│
├── utils/           # Utility functions
│   ├── helpers.js
│   └── ...
│
├── .env            # Environment variables
├── .gitignore      # Git ignore file
├── package.json    # Dependencies
└── server.js       # Entry point
```

## 🤝 Đóng góp
Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License
Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## 📧 Liên hệ
- Email: kttstore3cg@gmail.com
- GitHub: [@WiniFyCode](https://github.com/WiniFyCode)