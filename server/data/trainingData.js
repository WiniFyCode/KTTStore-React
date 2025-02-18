const trainingData = {
  // Dữ liệu về size
  sizeGuide: [
    {
      question: "Làm sao để chọn size áo phù hợp?",
      answer: "Để chọn size áo phù hợp, bạn cần đo các số đo cơ bản: ngực, eo, vai. Bảng size của shop như sau: Size S (Ngực: 86-90cm, Eo: 64-68cm), Size M (Ngực: 90-94cm, Eo: 68-72cm)..."
    },
    {
      question: "Size L phù hợp với cân nặng bao nhiêu?",
      answer: "Size L thường phù hợp với người có cân nặng 60-70kg đối với nam và 55-65kg đối với nữ. Tuy nhiên để chính xác nhất, bạn nên đo số đo cơ thể và đối chiếu với bảng size của shop."
    }
  ],

  // Dữ liệu về chất liệu
  materials: [
    {
      question: "Chất liệu cotton là gì?",
      answer: "Cotton là chất liệu vải tự nhiên được làm từ sợi bông, có đặc tính thấm hút tốt, thoáng mát, thân thiện với da. Đây là chất liệu phổ biến cho áo thun, áo sơ mi và các sản phẩm mặc hàng ngày."
    },
    {
      question: "Vải kaki có bền không?",
      answer: "Vải kaki là loại vải dệt chéo bền chắc, có độ bền cao, ít nhăn và dễ giặt ủi. Thích hợp làm quần dài, áo khoác và thường được sử dụng cho trang phục công sở hoặc casual."
    }
  ],

  // Dữ liệu về phối đồ
  styling: [
    {
      question: "Cách phối đồ với quần jean?",
      answer: "Quần jean là item dễ phối đồ. Bạn có thể kết hợp với áo thun basic để tạo style casual, áo sơ mi cho look công sở, hoặc áo croptop cho set đồ trẻ trung. Màu jean xanh đậm dễ phối với hầu hết các màu áo."
    },
    {
      question: "Gợi ý cách phối đồ đi tiệc",
      answer: "Cho nữ: Đầm suông hoặc đầm ôm midi kết hợp giày cao gót, clutch nhỏ và trang sức tinh tế. Cho nam: Áo sơ mi trơn kết hợp quần tây, giày tây và thắt lưng cùng tông màu."
    }
  ],

  // Dữ liệu về bảo quản
  care: [
    {
      question: "Cách giặt áo len?",
      answer: "Áo len nên giặt tay với nước lạnh hoặc ấm, dùng xà phòng trung tính. Không vắt mạnh, nên để ráo tự nhiên và phơi phẳng tránh ánh nắng trực tiếp. Không nên phơi trên mắc áo để tránh giãn form."
    },
    {
      question: "Làm sao để quần áo không bị nhăn?",
      answer: "Để tránh nhăn quần áo: 1. Giặt và phơi đúng cách 2. Phơi thẳng trên mắc áo 3. Là ủi ở nhiệt độ phù hợp với từng loại vải 4. Bảo quản trong tủ bằng cách treo thẳng."
    }
  ]
};

module.exports = trainingData; 