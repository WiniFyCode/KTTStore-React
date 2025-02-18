// Nội dung khuyến mãi theo theme
export const getPromotionContent = (theme) => ({
  sliderContent: theme === 'tet' ? [
    {
      title: 'LÌ XÌ MAY MẮN ĐẦU NĂM',
      subtitle: 'Mừng Xuân Ất Tỵ, KTT Store gửi tặng những phần quà đặc biệt:',
      benefits: [
        {
          value: '30%',
          description: 'Giảm giá cho đơn hàng từ 5 triệu'
        },
        {
          value: '500K',
          description: 'Voucher cho đơn hàng tiếp theo'
        },
        {
          value: 'FREE',
          description: 'Miễn phí vận chuyển toàn quốc'
        }
      ],
      cta: 'NHẬN ƯU ĐÃI NGAY',
      image: '/images/tet-banner.jpg',
      backgroundColor: 'bg-red-800'
    }
  ] : [
    {
      title: 'SUMMER SALE',
      subtitle: 'Giảm giá lên đến 70% cho tất cả sản phẩm mùa hè',
      benefits: [
        {
          value: '70%',
          description: 'Giảm giá cho tất cả sản phẩm mùa hè'
        },
        {
          value: '300K',
          description: 'Voucher cho đơn hàng từ 2 triệu'
        },
        {
          value: 'FREE',
          description: 'Miễn phí vận chuyển nội thành'
        }
      ],
      cta: 'MUA NGAY',
      image: '/images/summer-banner.jpg',
      backgroundColor: 'bg-blue-600'
    }
  ],
  benefits: theme === 'tet' ? [
    {
      value: '30%',
      description: 'Giảm giá cho đơn hàng từ 5 triệu'
    },
    {
      value: '500K',
      description: 'Voucher cho đơn hàng tiếp theo'
    },
    {
      value: 'FREE',
      description: 'Miễn phí vận chuyển toàn quốc'
    }
  ] : [
    {
      value: '70%',
      description: 'Giảm giá cho tất cả sản phẩm mùa hè'
    },
    {
      value: '300K',
      description: 'Voucher cho đơn hàng từ 2 triệu'
    },
    {
      value: 'FREE',
      description: 'Miễn phí vận chuyển nội thành'
    }
  ]
});
