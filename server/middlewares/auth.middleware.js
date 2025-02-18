const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực token
const authenticateToken = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy token xác thực'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Tìm user và kiểm tra trạng thái
        const user = await User.findOne({ userID: decoded.userID });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        if (user.isDisabled) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa'
            });
        }

        // Kiểm tra tài khoản có đang bị khóa không
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đang bị khóa, vui lòng thử lại sau'
            });
        }

        // Lưu thông tin user vào request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token đã hết hạn'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }
};

// Middleware kiểm tra role admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập tài nguyên này'
        });
    }
    next();
};

// Middleware kiểm tra role customer
const isCustomer = (req, res, next) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập tài nguyên này'
        });
    }
    next();
};

// Middleware xác thực admin
const authenticateAdmin = [authenticateToken, isAdmin];

// Middleware xác thực customer
const authenticateCustomer = [authenticateToken, isCustomer];

module.exports = {
    authenticateToken,
    authenticateAdmin,
    authenticateCustomer,
    isAdmin,
    isCustomer
};
