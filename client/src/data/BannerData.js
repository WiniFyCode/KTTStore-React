// Nội dung banner theo theme
export const getBannerData = (theme) =>
   theme === 'tet' ? [
      {
         id: 1,
         title: 'ÁO DÀI TẾT 2025',
         description: 'Sang trọng & Đẳng cấp',
         image: 'https://picsum.photos/480/721',
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
         image: 'https://picsum.photos/480/720',
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
         image: 'https://picsum.photos/480/730',
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
         image: 'https://picsum.photos/480/731',
         link: '/sale',
         buttonText: 'MUA NGAY',
         textColor: 'text-gray-200',
         buttonColor: 'text-blue-300 hover:text-blue-400',
         gradientColor: 'from-blue-900/70'
      },
   ];
