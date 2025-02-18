/**
 * File này chứa các utilities để xử lý màu sắc trong ứng dụng
 * Bao gồm:
 * - Mapping các màu cơ bản sang mã màu hex
 * - Mapping các họa tiết sang gradient
 * - Mapping các kiểu kẻ sang linear-gradient
 * - Các hàm helper để lấy và xử lý màu
 */

// Mapping màu sắc cơ bản sang mã màu hex
export const colorMap = {
  // Nhóm màu cơ bản
  'Đen': '#000000',
  'Trắng': '#FFFFFF', 
  'Trắng ngà': '#FFFFF0',
  
  // Nhóm màu Be - Tone màu trung tính ấm
  'Be': '#F5F5DC',
  'Be sáng': '#FFF8DC',
  'Be vàng': '#FFE4C4',
  
  // Nhóm màu Ghi - Tone màu xám
  'Ghi': '#808080',
  'Ghi khói': '#696969',
  'Ghi rêu': '#556B2F',
  'Ghi sáng': '#D3D3D3',
  
  // Nhóm màu Hồng - Tone màu ấm
  'Hồng nhạt': '#FFB6C1',
  'Hồng san hô': '#FF7F50',
  'Hồng tím': '#DDA0DD',
  
  // Nhóm màu Nâu - Tone màu trầm
  'Nâu': '#8B4513',
  'Nâu ghi': '#A0522D',
  'Nâu rêu': '#6B4423',
  'Nâu socola': '#D2691E',
  'Nâu tím': '#8B008B',
  
  // Nhóm màu Xanh - Đa dạng các tone màu
  'Xanh dương đậm': '#00008B',
  'Xanh ghi đá': '#778899',
  'Xanh lá': '#008000',
  'Xanh lá đậm': '#006400',
  'Xanh lơ': '#87CEEB',
  'Xanh matcha': '#9ACD32',
  'Xanh oliu': '#808000',
  'Xanh tím than': '#191970',
  
  // Nhóm màu Vàng - Tone màu ấm
  'Vàng bơ': '#F0E68C',
  'Vàng mustard': '#FFD700',
  
  // Nhóm màu Đỏ - Tone màu nóng
  'Đỏ': '#FF0000',
  'Đỏ mận': '#8B0000',
  'Đỏ tươi': '#FF4500',
  
  // Nhóm màu Tím - Tone màu lạnh
  'Tím nhạt': '#E6E6FA',
  'Tím thẫm': '#4B0082',
  
  // Nhóm màu Cam - Tone màu ấm
  'Cam': '#FFA500',
  'Cam nhạt': '#FFDAB9',
  
  // Các màu khác
  'Rêu': '#556B2F',
  'Bạc hà': '#98FF98',
};

// Mapping họa tiết - Sử dụng linear-gradient để tạo pattern
export const patternMap = {
  'Họa tiết Ghi': 'linear-gradient(45deg, #808080 25%, transparent 25%, transparent 75%, #808080 75%, #808080)',
  'Họa tiết Hồng nhạt': 'linear-gradient(45deg, #FFB6C1 25%, transparent 25%, transparent 75%, #FFB6C1 75%, #FFB6C1)',
  'Họa tiết Hồng san hô': 'linear-gradient(45deg, #FF7F50 25%, transparent 25%, transparent 75%, #FF7F50 75%, #FF7F50)',
  'Họa tiết Nâu': 'linear-gradient(45deg, #8B4513 25%, transparent 25%, transparent 75%, #8B4513 75%, #8B4513)',
  'Họa tiết Trắng': 'linear-gradient(45deg, #FFFFFF 25%, #F0F0F0 25%, #F0F0F0 75%, #FFFFFF 75%, #FFFFFF)',
  'Họa tiết Trắng ngà': 'linear-gradient(45deg, #FFFFF0 25%, #FFF8DC 25%, #FFF8DC 75%, #FFFFF0 75%, #FFFFF0)',
  'Họa tiết Đen': 'linear-gradient(45deg, #000000 25%, #333333 25%, #333333 75%, #000000 75%, #000000)',
};

// Mapping kẻ - Sử dụng repeating-linear-gradient để tạo sọc
export const stripeMap = {
  'Kẻ Be': 'repeating-linear-gradient(45deg, #F5F5DC, #F5F5DC 10px, transparent 10px, transparent 20px)',
  'Kẻ Be sáng': 'repeating-linear-gradient(45deg, #FFF8DC, #FFF8DC 10px, transparent 10px, transparent 20px)',
  'Kẻ Cam đất': 'repeating-linear-gradient(45deg, #D2691E, #D2691E 10px, transparent 10px, transparent 20px)',
  'Kẻ Ghi khói': 'repeating-linear-gradient(45deg, #696969, #696969 10px, transparent 10px, transparent 20px)',
  'Kẻ Hồng tro': 'repeating-linear-gradient(45deg, #C0C0C0, #C0C0C0 10px, #FFB6C1 10px, #FFB6C1 20px)',
  'Kẻ Trắng': 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 10px, #F0F0F0 10px, #F0F0F0 20px)',
  'Kẻ Xanh dương đậm': 'repeating-linear-gradient(45deg, #00008B, #00008B 10px, transparent 10px, transparent 20px)',
  'Kẻ Xanh ghi đá': 'repeating-linear-gradient(45deg, #778899, #778899 10px, transparent 10px, transparent 20px)',
  'Kẻ Xanh tím than': 'repeating-linear-gradient(45deg, #191970, #191970 10px, transparent 10px, transparent 20px)',
  'Kẻ Đen': 'repeating-linear-gradient(45deg, #000000, #000000 10px, #333333 10px, #333333 20px)',
};

//Hàm lấy mã màu hoặc pattern dựa trên tên màu
export const getColorCode = (colorName) => {
  // Kiểm tra trong các map theo thứ tự
  if (colorMap[colorName]) return colorMap[colorName];
  if (patternMap[colorName]) return patternMap[colorName];
  if (stripeMap[colorName]) return stripeMap[colorName];
  return '#CCCCCC'; // Màu mặc định nếu không tìm thấy
};

//Kiểm tra xem màu có phải là họa tiết hoặc kẻ không
export const isPatternOrStripe = (colorName) => {
  return colorName.startsWith('Họa tiết') || colorName.startsWith('Kẻ');
};

//Lấy kích thước background phù hợp cho từng loại
export const getBackgroundSize = (colorName) => {
  if (colorName.startsWith('Họa tiết')) return '20px 20px';
  if (colorName.startsWith('Kẻ')) return '30px 30px';
  return 'auto';
};
