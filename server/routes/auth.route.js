const express = require('express')
const router = express.Router()
const authController = require('../controllers/AuthController')

router.post('/register', authController.register)// Route đăng ký
router.post('/login', authController.login)// Route đăng nhập
router.post('/forgot-password', authController.forgotPassword)// Route quên mật khẩu
router.post('/reset-password', authController.resetPassword)// Route reset mật khẩu
router.post('/verify-token', authController.verifyToken)// Route xác thực token
router.post('/google-login', authController.googleLogin) // Route đăng nhập google

module.exports = router
