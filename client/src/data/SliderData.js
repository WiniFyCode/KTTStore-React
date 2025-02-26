// Mock data cho slider
export const getSliderData = (theme) => {
  const tetSliderData = [
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740498167/tet5_bxfgb7.jpg',
      title: 'XUÂN ẤT TỴ 2025',
      subtitle: 'Rộn ràng sắm Tết - Đón lộc đầu xuân',
      buttonText: 'KHÁM PHÁ BST TẾT',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740498172/tet6_p9clyn.jpg',
      title: 'ÁO DÀI TẾT 2025',
      subtitle: 'Đẳng cấp - Sang trọng - Độc đáo',
      buttonText: 'MUA NGAY',
      buttonLink: '/sale-tet',
      overlayColor: 'from-red-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740498025/tet4_bwu9ji.jpg',
      title: 'QUÀ TẶNG MAY MẮN',
      subtitle: 'Mua sắm Tết - Nhận quà liền tay',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740498160/tet0_haiaiu.webp',
      title: 'THỜI TRANG XUÂN 2025',
      subtitle: 'Rạng rỡ đón Tết - Phú quý cả năm',
      buttonText: 'XEM NGAY',
      buttonLink: '/sale-tet',
      overlayColor: 'from-red-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740497893/tet1_o2bfjz.jpg',
      title: 'BST TẾT ĐOÀN VIÊN',
      subtitle: 'Trang phục gia đình sum vầy ngày Tết',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740497976/tet2_w7ek3y.jpg',
      title: 'SALE TẾT NGUYÊN ĐÁN',
      subtitle: 'Giảm giá đến 50% - Mua càng nhiều giảm càng sâu',
      buttonText: 'XEM NGAY',
      buttonLink: '/sale-tet',
      overlayColor: 'from-red-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740497979/tet3_y15xsz.jpg',
      title: 'HÀNG HIỆU GIẢM SỐC',
      subtitle: 'Săn deal hot - Đón Tết sang chảnh',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-900/80'
    }
  ];

  const normalSliderData = [
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496174/banner3_obkeih.jpg',
      title: 'BST XUÂN HÈ 2025',
      subtitle: 'Khơi nguồn cảm hứng thời trang mới',
      buttonText: 'KHÁM PHÁ BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496135/banner2_fcmn9r.jpg',
      title: 'PHONG CÁCH THANH LỊCH',
      subtitle: 'Tôn vinh vẻ đẹp hiện đại',
      buttonText: 'MUA NGAY',
      buttonLink: '/sale',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496007/banner1_r2iemd.jpg',
      title: 'BST SANG TRỌNG',
      subtitle: 'Định nghĩa lại phong cách thời thượng',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496849/banner11_i6syt4.jpg',
      title: 'PHONG CÁCH MINIMALIST',
      subtitle: 'Đơn giản nhưng không đơn điệu',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740497004/banner12_xiylom.jpg',
      title: 'BST DẠ TIỆC',
      subtitle: 'Tỏa sáng trong mọi bữa tiệc',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496840/banner10_nmbjlu.jpg',
      title: 'PHONG CÁCH CASUAL',
      subtitle: 'Tự tin tỏa sáng mọi khoảnh khắc',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496660/banner8_rbhacc.jpg',
      title: 'BST THU ĐÔNG',
      subtitle: 'Ấm áp và thời thượng',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496836/banner9_irjzxe.jpg',
      title: 'DEAL CUỐI TUẦN',
      subtitle: 'Ưu đãi lên đến 50% toàn bộ sản phẩm',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496589/banner7_pkzn38.jpg',
      title: 'BST CÔNG SỞ CAO CẤP',
      subtitle: 'Nâng tầm phong cách chuyên nghiệp',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-900/80'
    },
    {
      image: 'https://res.cloudinary.com/djh8j3ofk/image/upload/v1740496589/banner4_gbuzam.jpg',
      title: 'FLASH SALE HOT',
      subtitle: 'Săn deal độc quyền mỗi ngày',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-900/80'
    }
  ];

  return theme === 'tet' ? tetSliderData : normalSliderData;
};
