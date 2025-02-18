// Nội dung đăng ký theo theme
export const getSubscriptionContent = (theme) => 
  theme === 'tet' ? {
    title: 'ĐĂNG KÝ NHẬN TIN TẾT',
    description: 'Nhận ngay voucher 200K và thông tin ưu đãi Tết 2025',
    placeholder: 'Nhập email của bạn',
    buttonText: 'ĐĂNG KÝ NGAY',
    backgroundColor: 'bg-red-700',
    note: '* Áp dụng cho khách hàng đăng ký mới từ nay đến mùng 5 Tết'
  } : {
    title: 'ĐĂNG KÝ NHẬN TIN',
    description: 'Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi đặc biệt',
    placeholder: 'Nhập email của bạn',
    buttonText: 'ĐĂNG KÝ',
    backgroundColor: 'bg-blue-700'
  };
