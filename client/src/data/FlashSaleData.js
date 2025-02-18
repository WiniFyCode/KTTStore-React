// Dữ liệu cho Flash Sale
const tetFlashSale = {
  startTime: new Date().setHours(8, 0, 0, 0), // 8h sáng
  endTime: new Date().setHours(22, 0, 0, 0),  // 22h tối
  title: "FLASH SALE TẾT",
  subtitle: "Săn deal hot - Giá sốc mỗi ngày",
  labelText: "SALE TẾT",
  buttonText: "Mua ngay - Đón Tết",
  style: {
    labelBg: "bg-red-600",
    labelText: "text-yellow-400",
    discountBg: "bg-yellow-400",
    discountText: "text-red-700",
    buttonBg: "bg-red-600",
    buttonHoverBg: "hover:bg-red-700",
    buttonText: "text-yellow-400",
    progressBar: "bg-red-600"
  },
  minDiscount: 40,
  maxDiscount: 70,
  displayLimit: 4,
  featuredTitle: "SẢN PHẨM TẾT NỔI BẬT",
  featuredSubtitle: "Rực rỡ sắc xuân - Đón năm mới an khang",
  featuredButtonText: "XEM TẤT CẢ SẢN PHẨM TẾT",
  featuredButtonLink: "/tet-collection",
  featuredStyle: {
    bg: "bg-red-50",
    title: "text-red-800",
    subtitle: "text-red-600",
    button: "border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
  }
};

const normalFlashSale = {
  startTime: new Date().setHours(12, 0, 0, 0), // 12h trưa
  endTime: new Date().setHours(18, 0, 0, 0),   // 20h tối
  title: "FLASH SALE",
  subtitle: "Giá sốc trong ngày - Số lượng có hạn",
  labelText: "SALE SỐC",
  buttonText: "Mua ngay",
  style: {
    labelBg: "bg-blue-600",
    labelText: "text-white",
    discountBg: "bg-yellow-400",
    discountText: "text-blue-700",
    buttonBg: "bg-blue-600",
    buttonHoverBg: "hover:bg-blue-700",
    buttonText: "text-white",
    progressBar: "bg-blue-600"
  },
  minDiscount: 30,
  maxDiscount: 50,
  displayLimit: 4,
  featuredTitle: "SẢN PHẨM NỔI BẬT",
  featuredSubtitle: "Xu hướng thời trang mới nhất",
  featuredButtonText: "XEM TẤT CẢ SẢN PHẨM",
  featuredButtonLink: "/products",
  featuredStyle: {
    bg: "bg-blue-50",
    title: "text-blue-800",
    subtitle: "text-blue-600",
    button: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
  }
};

export const getFlashSaleData = (theme = 'default') => {
  return theme === 'tet' ? tetFlashSale : normalFlashSale;
};
