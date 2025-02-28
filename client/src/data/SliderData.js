// Mock data cho slider
export const getSliderData = (theme) => {
  const tetSliderData = [
    { // Lan Uyên Nghinh Xuan 2025
      image: 'https://file.hstatic.net/1000392326/file/01-lan-uyen-nghinh-xuan-by-pantio-2025_634ad169cc8b40aaa30a5b33ec8266ae.jpg',
      title: 'XUÂN ẤT TỴ 2025',
      subtitle: 'Rộn ràng sắm Tết - Đón lộc đầu xuân',
      buttonText: 'KHÁM PHÁ BST TẾT',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-500/40'
    },
    { // Lan Uyen Nghinh Xuan 2025
      image: 'https://file.hstatic.net/1000392326/file/23-lan-uyen-nghinh-xuan-by-pantio-2025.jpg',
      title: 'ÁO DÀI TẾT 2025',
      subtitle: 'Đẳng cấp - Sang trọng - Độc đáo',
      buttonText: 'MUA NGAY',
      buttonLink: '/sale-tet',
      overlayColor: 'from-red-500/40'
    },
    { // Nha Suong BST Aodai 2024
      image: 'https://file.hstatic.net/1000392326/file/09-nha-suong-bst-ao-dai-2024.jpg',
      title: 'QUÀ TẶNG MAY MẮN',
      subtitle: 'Mua sắm Tết - Nhận quà liền tay',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-500/40'
    },
    { // Nha Suong BST Aodai 2024
      image: 'https://file.hstatic.net/1000392326/file/23-nha-suong-bst-ao-dai-2024.jpg',
      title: 'THỜI TRANG XUÂN 2025',
      subtitle: 'Rạng rỡ đón Tết - Phú quý cả năm',
      buttonText: 'XEM NGAY',
      buttonLink: '/sale-tet',
      overlayColor: 'from-red-500/40'
    },
    { // Ngọc Điểm Nghênh Xuân
      image: 'https://file.hstatic.net/1000392326/file/artboard_20_378bc92a940647dbb8f8422991ef86b1.jpg',
      title: 'BST TẾT ĐOÀN VIÊN',
      subtitle: 'Trang phục gia đình sum vầy ngày Tết',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-500/40'
    },
    { //Ngọc Điểm Nghênh Xuân
      image: 'https://file.hstatic.net/1000392326/file/artboard_5_6ef5ff0a124b406d864a977c6f3cab89.jpg',
      title: 'SALE TẾT NGUYÊN ĐÁN',
      subtitle: 'Giảm giá đến 50% - Mua càng nhiều giảm càng sâu',
      buttonText: 'XEM NGAY',
      buttonLink: '/sale-tet',
      overlayColor: 'from-red-500/40'
    },
    { // Bách Niên Xuân
      image: 'https://file.hstatic.net/1000392326/file/master_layout-12_c4982dd48b4b4b0bb00ac20680f4afc5.png',
      title: 'HÀNG HIỆU GIẢM SỐC',
      subtitle: 'Săn deal hot - Đón Tết sang chảnh',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-500/40'
    },
    { // Bách Niên Xuân
      image: 'https://file.hstatic.net/1000392326/file/master_layout-16_22996fbf44d54671bbb1e2aff90964b1.png',
      title: 'HÀNG HIỆU GIẢM SỐC',
      subtitle: 'Săn deal hot - Đón Tết sang chảnh',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-500/40'
    },
    { // Mộc Nhiên Hoa
      image: 'https://file.hstatic.net/1000392326/file/anh_7_d2f61d7983e84f2fa50c704585eb72ec.jpg',
      title: 'HÀNG HIỆU GIẢM SỐC',
      subtitle: 'Săn deal hot - Đón Tết sang chảnh',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-500/40'
    },
    { // Mộc Nhiên Hoa
      image: 'https://file.hstatic.net/1000392326/file/anh_14_8d2c2318c2f44a9cbe9c490754beb073.jpg',
      title: 'HÀNG HIỆU GIẢM SỐC',
      subtitle: 'Săn deal hot - Đón Tết sang chảnh',
      buttonText: 'XEM NGAY',
      buttonLink: '/tet-collection',
      overlayColor: 'from-red-500/40'
    }
  ];

  const normalSliderData = [
    {
      image: 'https://file.hstatic.net/1000392326/file/01-jeans-stories-by-pantio_83409896f2b74d49a54f77b38d355813.jpg',
      title: 'BST XUÂN HÈ 2025',
      subtitle: 'Khơi nguồn cảm hứng thời trang mới',
      buttonText: 'KHÁM PHÁ BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/02-jeans-stories-by-pantio_e2a31156738e4763be52a4f0eba016de.jpg',
      title: 'PHONG CÁCH THANH LỊCH',
      subtitle: 'Tôn vinh vẻ đẹp hiện đại',
      buttonText: 'MUA NGAY',
      buttonLink: '/sale',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/03-jeans-stories-by-pantio_926f632858f04f9b9584010a25d3a5a3.jpg',
      title: 'BST SANG TRỌNG',
      subtitle: 'Định nghĩa lại phong cách thời thượng',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/04-jeans-stories-by-pantio_c289bcfef5994c7abe19c6363960cf82.jpg',
      title: 'PHONG CÁCH MINIMALIST',
      subtitle: 'Đơn giản nhưng không đơn điệu',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/04-jeans-stories-by-pantio_c289bcfef5994c7abe19c6363960cf82.jpg',
      title: 'BST DẠ TIỆC',
      subtitle: 'Tỏa sáng trong mọi bữa tiệc',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/05-jeans-stories-by-pantio_1a17e8dc9ed340c285b1b62dd9423845.jpg',
      title: 'PHONG CÁCH CASUAL',
      subtitle: 'Tự tin tỏa sáng mọi khoảnh khắc',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/09-jeans-stories-by-pantio_664029a9c90241fd879f3fc54b8d8f22.jpg',
      title: 'BST THU ĐÔNG',
      subtitle: 'Ấm áp và thời thượng',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/11-jeans-stories-by-pantio_0de64eafaf254b958d286ae3b8c53439.jpg',
      title: 'DEAL CUỐI TUẦN',
      subtitle: 'Ưu đãi lên đến 50% toàn bộ sản phẩm',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/19-jeans-stories-by-pantio_dd0993a6347a48b4b48ee8ed6ab5454e.jpg',
      title: 'BST CÔNG SỞ CAO CẤP',
      subtitle: 'Nâng tầm phong cách chuyên nghiệp',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-arrivals',
      overlayColor: 'from-blue-500/40'
    },
    {
      image: 'https://file.hstatic.net/1000392326/file/14-jeans-stories-by-pantio_4b659efdf9b04920a14a28206342b4b8.jpg',
      title: 'FLASH SALE HOT',
      subtitle: 'Săn deal độc quyền mỗi ngày',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/sale',
      overlayColor: 'from-blue-500/40'
    }
  ];

  return theme === 'tet' ? tetSliderData : normalSliderData;
};
