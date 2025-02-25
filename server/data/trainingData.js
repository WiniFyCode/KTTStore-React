// Dữ liệu training cho AI
const trainingData = {
  shopInfo: {
    name: "KTT Store",
    description: "Cửa hàng thời trang nam nữ cao cấp",
    slogan: "Phong cách thời trang - Chất lượng cuộc sống",
    address: "123 Đường ABC, Quận XYZ, TP.HCM",
    contact: {
      phone: "0123456789", 
      email: "contact@kttstore.com",
      website: "www.kttstore.com",
      facebook: "fb.com/kttstore",
      instagram: "instagram.com/kttstore"
    },
    openTime: "9:00 - 22:00",
    policies: {
      shipping: {
        free: "Miễn phí ship cho đơn hàng từ 500k",
        standard: "30.000đ cho đơn dưới 500k",
        time: "2-3 ngày làm việc"
      },
      returns: {
        time: "7 ngày đổi trả",
        condition: "Sản phẩm còn nguyên tem mác",
        note: "Không áp dụng đồ lót và phụ kiện"
      },
      payment: [
        "Thanh toán khi nhận hàng (COD)",
        "Chuyển khoản ngân hàng",
        "Ví điện tử (Momo, ZaloPay)",
        "Thẻ tín dụng/ghi nợ"
      ],
      warranty: "Bảo hành sản phẩm 30 ngày"
    },
    sizeGuide: {
      description: "Bảng size chuẩn KTT Store",
      measurementTips: [
        "Sử dụng thước dây để đo",
        "Đo sát cơ thể, không căng thước quá chặt",
        "Đứng thẳng tự nhiên khi đo"
      ],
      steps: [
        "Đo vòng ngực: Đo vòng quanh phần ngực rộng nhất",
        "Đo vòng eo: Đo vòng quanh eo (phần nhỏ nhất)",
        "Đo vòng mông: Đo vòng quanh phần mông rộng nhất",
        "Đo chiều cao: Đo từ đỉnh đầu đến gót chân",
        "Đo cân nặng: Cân vào buổi sáng để chính xác nhất"
      ],
      sizeChart: {
        men: {
          S: "Ngực: 88-92cm | Eo: 73-77cm | Cao: 160-165cm | Nặng: 55-60kg",
          M: "Ngực: 92-96cm | Eo: 77-81cm | Cao: 165-170cm | Nặng: 60-65kg",
          L: "Ngực: 96-100cm | Eo: 81-85cm | Cao: 170-175cm | Nặng: 65-70kg"
        },
        women: {
          S: "Ngực: 82-86cm | Eo: 64-68cm | Cao: 150-155cm | Nặng: 45-50kg",
          M: "Ngực: 86-90cm | Eo: 68-72cm | Cao: 155-160cm | Nặng: 50-55kg",
          L: "Ngực: 90-94cm | Eo: 72-76cm | Cao: 160-165cm | Nặng: 55-60kg"
        }
      },
      customSize: {
        note: "Đối với khách hàng cần size lớn hơn (XL, XXL,...), vui lòng liên hệ shop để đặt may theo số đo.",
        contact: {
          phone: "0123456789",
          message: "Gửi số đo chi tiết qua Zalo/Facebook để được tư vấn"
        },
        orderTime: "Thời gian may đo: 3-5 ngày làm việc",
        deposit: "Đặt cọc 50% giá trị đơn hàng"
      }
    },
    careInstructions: {
      general: [
        "Giặt riêng sản phẩm tối màu và sáng màu",
        "Không giặt máy với sản phẩm dễ xù lông",
        "Phơi trong bóng râm, tránh ánh nắng trực tiếp",
        "Là ủi ở nhiệt độ thích hợp với từng loại vải",
        "Không sử dụng chất tẩy mạnh"
      ],
      materials: {
        cotton: {
          wash: "Giặt máy bình thường, nước lạnh hoặc ấm",
          dry: "Phơi trong bóng râm, tránh nắng gắt",
          iron: "Là ủi ở nhiệt độ trung bình",
          note: "Có thể co rút nhẹ sau khi giặt"
        },
        silk: {
          wash: "Giặt tay nhẹ nhàng với nước lạnh",
          dry: "Phơi khô tự nhiên trong bóng râm",
          iron: "Là ủi mặt trái ở nhiệt độ thấp",
          note: "Tránh xà phòng tẩy mạnh"
        },
        denim: {
          wash: "Giặt mặt trái, nước lạnh",
          dry: "Phơi thẳng tránh ánh nắng trực tiếp",
          iron: "Là khi vải còn hơi ẩm",
          note: "Tránh giặt máy nhiều để giữ màu"
        }
      }
    }
  },
  products: {
    items: [],
    attributes: {
      sizes: ["S", "M", "L"],
      materials: ["Cotton", "Kaki", "Jeans", "Len", "Lụa"],
      colors: ["Đen", "Trắng", "Xanh", "Đỏ"]
    }
  },
  responses: {
    greeting: [
      "👋 Xin chào! Mình là trợ lý của KTT Store, rất vui được hỗ trợ bạn.",
      "🌟 Chào bạn! Mình là AI của KTT Store đây, bạn cần mình tư vấn gì nào?",
      "💫 Hi! Rất vui được gặp bạn. Mình có thể giúp gì cho bạn ạ?"
    ],
    productInfo: {
      template: 
      `🏷️ THÔNG TIN SẢN PHẨM
------------------------
🖼️ {{thumbnail}}

📌 Tên: {{productName}}
💰 Giá: {{price}}đ
{{#discount}}🏷️ Giảm giá: {{discount}}%{{/discount}}
🎯 Phân loại: {{category}} {{target}}

🎨 Màu sắc có sẵn:
{{#colors}}
🎨 {{colorName}}:
🖼️ {{images.[0]}}

   {{#sizes}}• Size {{size}}: còn {{stock}} sản phẩm
   Mã SP: {{SKU}}{{/sizes}}
{{/colors}}

📝 MÔ TẢ:
{{description}}`,
      outOfStock: "⚠️ Rất tiếc, sản phẩm này tạm hết hàng. Bạn có thể tham khảo một số sản phẩm tương tự:"
    },
    sizeGuide: {
      template: 
`📏 HƯỚNG DẪN CHỌN SIZE
------------------------
💡 Cách đo:
{{#steps}}
• {{.}}
{{/steps}}

📊 BẢNG SIZE:
{{#sizeChart}}
• Size {{size}}: {{measurements}}
{{/sizeChart}}

💭 Gợi ý: {{suggestion}}`
    },
    careInstructions: {
      template: 
`👕 HƯỚNG DẪN BẢO QUẢN
------------------------
{{#general}}
• {{.}}
{{/general}}

✨ Lưu ý đặc biệt cho {{material}}:
{{specificCare}}`
    },
    promotion: {
      template: 
`🎉 KHUYẾN MÃI ĐANG CÓ
------------------------
📢 {{promotionName}}
⏰ Thời gian: {{duration}}
💝 Ưu đãi: {{discount}}
{{#conditions}}
• {{.}}
{{/conditions}}`
    },
    error: [
      "❌ Xin lỗi, mình không tìm thấy thông tin bạn cần.",
      "⚠️ Rất tiếc, mình không thể truy cập thông tin lúc này.",
      "😅 Mình chưa hiểu rõ ý bạn, bạn có thể nói rõ hơn được không?"
    ],
    closing: [
      "🌟 Bạn cần tư vấn thêm gì không ạ?",
      "💫 Mình có thể giúp gì thêm cho bạn không?",
      "✨ Nếu cần thêm thông tin, đừng ngại hỏi mình nhé!",
      "🎉 Rất vui được tư vấn cho bạn. Chúc bạn mua sắm vui vẻ!"
    ]
  },
  knowledgeBase: {
    materials: [
      {
        question: "Chất liệu cotton là gì?",
        answer: "Cotton là chất liệu vải tự nhiên có đặc tính thấm hút tốt, thoáng mát."
      },
      {
        question: "Vải kaki có bền không?",
        answer: "Vải kaki là loại vải dệt chéo bền chắc, ít nhăn và dễ giặt ủi."
      }
    ],
    styling: [
      {
        question: "Cách phối đồ với quần jean?",
        answer: "Quần jean có thể phối với áo thun, sơ mi hoặc croptop tùy phong cách."
      },
      {
        question: "Gợi ý cách phối đồ đi tiệc",
        answer: "Đầm suông hoặc sơ mi quần tây kết hợp phụ kiện tinh tế."
      }
    ],
    care: [
      {
        question: "Cách giặt áo len?",
        answer: "Giặt tay với nước lạnh, không vắt mạnh, phơi phẳng."
      },
      {
        question: "Làm sao để quần áo không bị nhăn?",
        answer: "Giặt và phơi đúng cách, ủi ở nhiệt độ phù hợp."
      }
    ],
    auth: {
      register: {
        steps: [
          "Truy cập trang đăng ký tài khoản",
          "Điền đầy đủ thông tin: họ tên, email, mật khẩu, số điện thoại, giới tính",
          "Kiểm tra và xác nhận thông tin đã nhập chính xác",
          "Nhấn nút đăng ký để hoàn tất"
        ],
        benefits: [
          "Tích điểm với mỗi đơn hàng",
          "Cập nhật xu hướng thời trang mới nhất",
          "Ưu đãi sinh nhật đặc biệt"
        ],
        requirements: {
          password: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số",
          email: "Email phải hợp lệ và chưa được đăng ký trước đó",
          phone: "Số điện thoại phải là số Việt Nam hợp lệ"
        }
      },
      login: {
        steps: [
          "Truy cập trang đăng nhập",
          "Nhập email và mật khẩu đã đăng ký",
          "Nhấn nút đăng nhập để vào tài khoản"
        ],
        socialLogin: {
          google: "Đăng nhập nhanh bằng tài khoản Google",
          facebook: "Đăng nhập nhanh bằng tài khoản Facebook"
        },
        tips: [
          "Tick vào 'Ghi nhớ đăng nhập' để không phải đăng nhập lại, nếu nút 'Ghi nhớ đăng nhập' đã được tick thì bạn không cần tick lại",
          "Đảm bảo bạn đang ở trang web chính thức của KTT Store",
          "Không chia sẻ mật khẩu với người khác"
        ]
      },
      forgotPassword: {
        steps: [
          "Truy cập trang quên mật khẩu",
          "Nhập email đã đăng ký tài khoản",
          "Nhận mã OTP qua email",
          "Nhập mã OTP và mật khẩu mới",
          "Xác nhận để hoàn tất đặt lại mật khẩu"
        ],
        notes: [
          "Mã OTP chỉ có hiệu lực trong 5 phút",
          "Kiểm tra cả hộp thư spam nếu không nhận được OTP",
          "Có thể yêu cầu gửi lại mã OTP nếu cần"
        ],
        security: {
          passwordRequirements: "Mật khẩu mới phải khác mật khẩu cũ và đáp ứng yêu cầu bảo mật",
          verification: "Xác thực 2 lớp qua email để đảm bảo an toàn"
        }
      }
    }
  }
};

module.exports = trainingData;