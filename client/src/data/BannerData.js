// Nội dung banner theo theme
export const getBannerData = (theme) =>
   theme === 'tet' ? [
      {
         id: 1,
         title: 'ÁO DÀI TẾT 2025',
         description: 'Sang trọng & Đẳng cấp',
         image: 'https://file.hstatic.net/1000392326/file/master_layout-24_9d6025559fe44c9b8a734bc9871caddf.png',
         link: '/tet-collection',
         buttonText: 'KHÁM PHÁ BỘ SƯU TẬP',
         textColor: 'text-yellow-100',
         buttonColor: 'text-yellow-300 hover:text-yellow-400',
         gradientColor: 'from-red-900/70'
      },
      {
         id: 2,
         title: 'SALE TẾT 2025',
         description: 'Giảm giá lên đến 50%',
         image: 'https://file.hstatic.net/1000392326/file/1__16__3f49dd7741714808ba271d0a6aa540c0.jpg',
         link: '/sale-tet',
         buttonText: 'MUA NGAY',
         textColor: 'text-yellow-100',
         buttonColor: 'text-yellow-300 hover:text-yellow-400',
         gradientColor: 'from-red-900/70'
      },
   ] : [
      {
         id: 3,
         title: 'SUMMER COLLECTION',
         description: 'Phong cách & Năng động',
         image: 'https://file.hstatic.net/1000392326/file/09-jeans-stories-by-pantio_664029a9c90241fd879f3fc54b8d8f22.jpg',
         link: '/new-arrivals',
         buttonText: 'KHÁM PHÁ BỘ SƯU TẬP',
         textColor: 'text-gray-200',
         buttonColor: 'text-blue-300 hover:text-blue-400',
         gradientColor: 'from-blue-900/70'
      },
      {
         id: 4,
         title: 'SUMMER SALE',
         description: 'Giảm giá lên đến 70%',
         image: 'https://file.hstatic.net/1000392326/file/25-jeans-stories-by-pantio_9b2307c9a87a486c90b8873193a5892d.jpg',
         link: '/sale',
         buttonText: 'MUA NGAY',
         textColor: 'text-gray-200',
         buttonColor: 'text-blue-300 hover:text-red-400',
         gradientColor: 'from-blue-900/70'
      },
   ];
