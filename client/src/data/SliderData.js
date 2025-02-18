// Mock data cho slider
export const getSliderData = (theme) => {
  const tetSliderData = [
    {
      image: 'https://picsum.photos/1920/1080',
      title: 'XUÂN ẤT TỴ 2025',
      subtitle: 'Rộn ràng sắm Tết - Đón lộc đầu xuân',
      buttonText: 'KHÁM PHÁ BST TẾT',
      buttonLink: '/tet-collection',
      backgroundColor: 'bg-red-800'
    },
    {
      image: 'https://picsum.photos/1920/1081',
      title: 'ÁO DÀI TẾT 2025',
      subtitle: 'Đẳng cấp - Sang trọng - Độc đáo',
      buttonText: 'MUA NGAY',
      buttonLink: '/ao-dai-tet',
      backgroundColor: 'bg-red-800'
    },
    {
      image: 'https://picsum.photos/1920/1082',
      title: 'SALE TẾT LÊN ĐẾN 50%',
      subtitle: 'Tặng thêm lì xì may mắn đầu năm',
      buttonText: 'XEM NGAY',
      buttonLink: '/sale-tet',
      backgroundColor: 'bg-red-800'
    }
  ];

  const normalSliderData = [
    {
      image: 'https://picsum.photos/1920/1083',
      title: 'BST XUÂN HÈ 2025',
      subtitle: 'Thời trang cho người hiện đại',
      buttonText: 'KHÁM PHÁ BST MỚI',
      buttonLink: '/new-collection',
      backgroundColor: 'bg-blue-600'
    },
    {
      image: 'https://picsum.photos/1920/1084',
      title: 'SUMMER SALE',
      subtitle: 'Giảm giá lên đến 70%',
      buttonText: 'MUA NGAY',
      buttonLink: '/sale',
      backgroundColor: 'bg-blue-600'
    },
    {
      image: 'https://picsum.photos/1920/1086',
      title: 'THỜI TRANG MỚI NHẤT',
      subtitle: 'BST mới nhất cho nam và nữ',
      buttonText: 'XEM BST MỚI',
      buttonLink: '/new-collection',
      backgroundColor: 'bg-blue-600'
    }
  ];

  return theme === 'tet' ? tetSliderData : normalSliderData;
};
