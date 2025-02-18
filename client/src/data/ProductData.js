// Mock data cho sản phẩm
export const getProducts = (theme) => {
  const tetProducts = [
    {
      id: 1,
      name: 'Áo Dài Hoàng Gia',
      price: 2490000,
      image: 'https://picsum.photos/400/600',
      category: 'Áo Dài',
      discount: 20,
      tag: 'Best Seller'
    },
    {
      id: 2,
      name: 'Vest Tết Luxury',
      price: 3890000,
      image: 'https://picsum.photos/400/601',
      category: 'Nam',
      discount: 0,
      tag: 'New Arrival'
    },
    {
      id: 3,
      name: 'Áo Dài Cách Tân',
      price: 1890000,
      image: 'https://picsum.photos/400/602',
      category: 'Nữ',
      discount: 15,
      tag: 'Hot'
    },
    {
      id: 4,
      name: 'Set Áo Dài Gia Đình',
      price: 5990000,
      image: 'https://picsum.photos/400/603',
      category: 'Combo',
      discount: 10,
      tag: 'Limited'
    },
  ];

  const normalProducts = [
    {
      id: 1,
      name: 'Áo Sơ Mi Nam',
      price: 990000,
      image: 'https://picsum.photos/400/604',
      category: 'Nam',
      discount: 10,
      tag: 'Best Seller'
    },
    {
      id: 2,
      name: 'Váy Đẹp',
      price: 1290000,
      image: 'https://picsum.photos/400/605',
      category: 'Nữ',
      discount: 20,
      tag: 'New Arrival'
    },
    {
      id: 3,
      name: 'Quần Tây Nam',
      price: 1490000,
      image: 'https://picsum.photos/400/606',
      category: 'Nam',
      discount: 15,
      tag: 'Hot'
    },
    {
      id: 4,
      name: 'Đồng Hồ Đẹp',
      price: 1990000,
      image: 'https://picsum.photos/400/607',
      category: 'Phụ Kiện',
      discount: 5,
      tag: 'Limited'
    },
  ];

  return theme === 'tet' ? tetProducts : normalProducts;
};
