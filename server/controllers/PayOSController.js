const payOS = require("../utils/payos");

class PayOSController {
  // Tạo link thanh toán mới
  async createPaymentLink(req, res) {
    // Lấy thông tin từ request body
    const { description, returnUrl, cancelUrl, amount } = req.body;
    
    // Tạo object chứa thông tin thanh toán
    const body = {
      orderCode: Number(String(new Date().getTime()).slice(-6)), // Tạo mã đơn hàng từ timestamp
      amount,          // Số tiền thanh toán
      description,     // Mô tả đơn hàng
      cancelUrl,       // URL khi hủy thanh toán
      returnUrl        // URL khi thanh toán thành công
    };

    try {
      // Gọi API PayOS để tạo link thanh toán
      const paymentLinkRes = await payOS.createPaymentLink(body);

      // Trả về thông tin link thanh toán nếu thành công
      return res.json({
        error: 0,
        message: "Success",
        data: {
          bin: paymentLinkRes.bin,               // Mã ngân hàng
          checkoutUrl: paymentLinkRes.checkoutUrl, // URL thanh toán
          accountNumber: paymentLinkRes.accountNumber, // Số tài khoản
          accountName: paymentLinkRes.accountName,     // Tên tài khoản
          amount: paymentLinkRes.amount,              // Số tiền
          description: paymentLinkRes.description,    // Mô tả
          orderCode: paymentLinkRes.orderCode,        // Mã đơn hàng
          qrCode: paymentLinkRes.qrCode,              // Mã QR
        },
      });
    } catch (error) {
      console.log(error);
      return res.json({
        error: -1,
        message: "fail",
        data: null,
      });
    }
  }

  // Lấy thông tin đơn hàng theo orderId
  async getPaymentInfo(req, res) {
    try {
      // Gọi API PayOS để lấy thông tin đơn hàng
      const order = await payOS.getPaymentLinkInformation(req.params.orderId);
      if (!order) {
        return res.json({
          error: -1,
          message: "failed",
          data: null,
        });
      }
      return res.json({
        error: 0,
        message: "ok",
        data: order,
      });
    } catch (error) {
      console.log(error);
      return res.json({
        error: -1,
        message: "failed",
        data: null,
      });
    }
  }
}

module.exports = new PayOSController();
