const nodemailer = require('nodemailer');
require('dotenv').config();

// Khởi tạo transporter để gửi email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

class EmailController {
    // Gửi email liên hệ
    async sendContactEmail(req, res) {
        try {
            const { name, email, phone, subject, message } = req.body;

            // Template email gửi cho admin
            const adminEmailTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9fafb;
                        }
                        .header {
                            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 20px;
                            border-radius: 0 0 8px 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .info-item {
                            margin-bottom: 15px;
                            padding: 10px;
                            background-color: #f3f4f6;
                            border-radius: 4px;
                        }
                        .label {
                            font-weight: bold;
                            color: #4b5563;
                            margin-bottom: 5px;
                        }
                        .message-box {
                            background-color: #f3f4f6;
                            padding: 15px;
                            border-radius: 4px;
                            margin-top: 20px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            font-size: 12px;
                            color: #6b7280;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎉 Thông Tin Liên Hệ Mới</h2>
                        </div>
                        <div class="content">
                            <div class="info-item">
                                <div class="label">👤 Họ tên:</div>
                                ${name}
                            </div>
                            <div class="info-item">
                                <div class="label">📧 Email:</div>
                                ${email}
                            </div>
                            <div class="info-item">
                                <div class="label">📱 Số điện thoại:</div>
                                ${phone}
                            </div>
                            <div class="info-item">
                                <div class="label">📝 Chủ đề:</div>
                                ${subject}
                            </div>
                            <div class="message-box">
                                <div class="label">💬 Nội dung tin nhắn:</div>
                                ${message}
                            </div>
                        </div>
                        <div class="footer">
                            <p>Email này được gửi tự động từ form liên hệ website ${process.env.SHOP_NAME}</p>
                            <p>© ${new Date().getFullYear()} ${process.env.SHOP_NAME}. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Template email phản hồi tự động cho khách hàng
            const customerEmailTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9fafb;
                        }
                        .header {
                            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 8px 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .thank-you {
                            font-size: 24px;
                            font-weight: bold;
                            color: #3b82f6;
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        .message {
                            color: #4b5563;
                            margin-bottom: 30px;
                            text-align: center;
                            font-size: 16px;
                        }
                        .contact-info {
                            background-color: #f3f4f6;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 30px;
                        }
                        .contact-item {
                            margin-bottom: 10px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        .icon {
                            width: 20px;
                            text-align: center;
                            color: #3b82f6;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            font-size: 12px;
                            color: #6b7280;
                        }
                        .social-links {
                            display: flex;
                            justify-content: center;
                            gap: 20px;
                            margin-top: 20px;
                        }
                        .social-link {
                            color: #3b82f6;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 ${process.env.SHOP_NAME}</h1>
                        </div>
                        <div class="content">
                            <div class="thank-you">Xin chào ${name}!</div>
                            <div class="message">
                                <p>Cảm ơn bạn đã liên hệ với chúng tôi!</p>
                                <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
                            </div>
                            <div class="contact-info">
                                <h3 style="margin-top: 0; color: #3b82f6;">Thông tin liên hệ của chúng tôi:</h3>
                                <div class="contact-item">
                                    <span class="icon">📍</span>
                                    <span>${process.env.SHOP_ADDRESS}</span>
                                </div>
                                <div class="contact-item">
                                    <span class="icon">📞</span>
                                    <span>${process.env.SHOP_PHONE}</span>
                                </div>
                                <div class="contact-item">
                                    <span class="icon">📧</span>
                                    <span>${process.env.SHOP_EMAIL}</span>
                                </div>
                            </div>
                            <div class="social-links">
                                <a href="#" class="social-link">Facebook</a>
                                <a href="#" class="social-link">Instagram</a>
                                <a href="#" class="social-link">Twitter</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                            <p>© ${new Date().getFullYear()} ${process.env.SHOP_NAME}. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Cấu hình email gửi cho admin
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: `[Liên hệ từ ${name}] ${subject}`,
                html: adminEmailTemplate
            };

            // Cấu hình email phản hồi tự động cho khách hàng
            const autoReplyOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `[${process.env.SHOP_NAME}] Cảm ơn bạn đã liên hệ`,
                html: customerEmailTemplate
            };

            // Gửi cả hai email
            await transporter.sendMail(mailOptions);
            await transporter.sendMail(autoReplyOptions);

            res.status(200).json({
                message: 'Gửi email thành công'
            });
        } catch (error) {
            console.error('Lỗi khi gửi email:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi gửi email',
                error: error.message
            });
        }
    }

    // Gửi email thông báo đơn hàng
    async sendOrderNotification(orderData, userEmail) {
        try {
            // Template email cho đơn hàng
            const orderTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9fafb;
                        }
                        .header {
                            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 20px;
                            border-radius: 0 0 8px 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .order-info {
                            margin-bottom: 20px;
                            padding: 15px;
                            background-color: #f3f4f6;
                            border-radius: 8px;
                        }
                        .product-list {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        .product-list th,
                        .product-list td {
                            padding: 10px;
                            text-align: left;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        .total {
                            text-align: right;
                            font-weight: bold;
                            margin-top: 20px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            font-size: 12px;
                            color: #6b7280;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎉 Thông Tin Đơn Hàng #${orderData.orderID}</h2>
                        </div>
                        <div class="content">
                            <div class="order-info">
                                <h3>Thông tin đơn hàng:</h3>
                                <p><strong>Mã đơn hàng:</strong> #${orderData.orderID}</p>
                                <p><strong>Ngày đặt:</strong> ${new Date(orderData.createdAt).toLocaleString('vi-VN')}</p>
                                <p><strong>Trạng thái:</strong> ${orderData.orderStatus}</p>
                                <p><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
                            </div>

                            <div class="order-info">
                                <h3>Thông tin giao hàng:</h3>
                                <p><strong>Người nhận:</strong> ${orderData.fullname}</p>
                                <p><strong>Số điện thoại:</strong> ${orderData.phone}</p>
                                <p><strong>Địa chỉ:</strong> ${orderData.address}</p>
                                ${orderData.note ? `<p><strong>Ghi chú:</strong> ${orderData.note}</p>` : ''}
                            </div>

                            <h3>Chi tiết đơn hàng:</h3>
                            <table class="product-list">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orderData.items.map(item => `
                                        <tr>
                                            <td>
                                                ${item.product.name}<br>
                                                <small>Màu: ${item.product.colorName}, Size: ${item.size}</small>
                                            </td>
                                            <td>${item.quantity}</td>
                                            <td>${item.product.price.toLocaleString('vi-VN')}đ</td>
                                            <td>${(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>

                            <div class="total">
                                <p>Tổng tiền hàng: ${orderData.totalPrice.toLocaleString('vi-VN')}đ</p>
                                <p>Phí vận chuyển: ${orderData.shippingFee.toLocaleString('vi-VN')}đ</p>
                                ${orderData.discount ? `<p>Giảm giá: -${orderData.discount.toLocaleString('vi-VN')}đ</p>` : ''}
                                <p style="font-size: 1.2em; color: #e11d48;">Thành tiền: ${orderData.paymentPrice.toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Email này được gửi tự động từ hệ thống ${process.env.SHOP_NAME}</p>
                            <p>© ${new Date().getFullYear()} ${process.env.SHOP_NAME}. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Gửi email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: `[${process.env.SHOP_NAME}] Thông tin đơn hàng #${orderData.orderID}`,
                html: orderTemplate
            });

            return {
                success: true,
                message: 'Gửi email thông báo đơn hàng thành công'
            };
        } catch (error) {
            console.error('Lỗi khi gửi email thông báo đơn hàng:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi gửi email thông báo đơn hàng',
                error: error.message
            };
        }
    }
}

module.exports = new EmailController(); 