import React, { useState } from 'react';
import { 
  FaStore, FaPalette, FaBell, FaShieldAlt, FaImage, 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaMoon, FaFont,
  FaGlobe, FaLock, FaSignOutAlt, FaUserShield, FaSave
} from 'react-icons/fa';

const SettingManagement = () => {
  // State cho các cài đặt
  const [storeInfo, setStoreInfo] = useState({
    storeName: 'Fashion Shop',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    phone: '0123456789',
    email: 'contact@fashionshop.com',
  });

  const [appearance, setAppearance] = useState({
    themeColor: '#3B82F6',
    isDarkMode: false,
    fontSize: 'medium',
    language: 'vi'
  });

  const [notifications, setNotifications] = useState({
    emailNotif: true,
    pushNotif: true,
    orderNotif: true,
    promotionNotif: true
  });

  // Các section cài đặt
  const sections = [
    {
      id: 'store-info',
      title: 'Thông tin cửa hàng',
      icon: <FaStore className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {/* Logo upload */}
          <div className="p-6 border border-dashed border-gray-300 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaImage className="w-10 h-10 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Tải logo lên
              </button>
              <p className="mt-2 text-sm text-gray-500">PNG, JPG hoặc GIF (Tối đa 2MB)</p>
            </div>
          </div>

          {/* Store Info Form */}
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên cửa hàng
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={storeInfo.storeName}
                onChange={(e) => setStoreInfo({ ...storeInfo, storeName: e.target.value })}
                placeholder="Nhập tên cửa hàng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={storeInfo.address}
                  onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                  placeholder="Nhập địa chỉ cửa hàng"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={storeInfo.phone}
                    onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                    placeholder="0123 456 789"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={storeInfo.email}
                    onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'appearance',
      title: 'Giao diện',
      icon: <FaPalette className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {/* Theme Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu chủ đạo
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                className="w-20 h-20 rounded-lg cursor-pointer"
                value={appearance.themeColor}
                onChange={(e) => setAppearance({ ...appearance, themeColor: e.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(color => (
                  <button
                    key={color}
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setAppearance({ ...appearance, themeColor: color })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FaMoon className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Dark Mode</h4>
                <p className="text-sm text-gray-500">Bật chế độ tối cho giao diện</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={appearance.isDarkMode}
                onChange={(e) => setAppearance({ ...appearance, isDarkMode: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <FaFont className="w-5 h-5" />
                <span>Cỡ chữ</span>
              </div>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    appearance.fontSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setAppearance({ ...appearance, fontSize: size })}
                >
                  {size === 'small' && 'Nhỏ'}
                  {size === 'medium' && 'Vừa'}
                  {size === 'large' && 'Lớn'}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <FaGlobe className="w-5 h-5" />
                <span>Ngôn ngữ</span>
              </div>
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={appearance.language}
              onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Thông báo',
      icon: <FaBell className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          {[
            { id: 'emailNotif', label: 'Thông báo qua email', desc: 'Nhận thông báo qua địa chỉ email' },
            { id: 'pushNotif', label: 'Thông báo đẩy', desc: 'Nhận thông báo trực tiếp trên trình duyệt' },
            { id: 'orderNotif', label: 'Thông báo đơn hàng', desc: 'Cập nhật về trạng thái đơn hàng' },
            { id: 'promotionNotif', label: 'Thông báo khuyến mãi', desc: 'Thông tin về các chương trình khuyến mãi' }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications[item.id]}
                  onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Bảo mật',
      icon: <FaShieldAlt className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          {/* Password Change */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FaLock className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
                <p className="text-sm text-gray-500">Cập nhật mật khẩu mới cho tài khoản</p>
              </div>
            </div>
            <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Thay đổi mật khẩu
            </button>
          </div>

          {/* Two-Factor Auth */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUserShield className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Xác thực 2 lớp</h4>
                  <p className="text-sm text-gray-500">Bảo mật tài khoản với xác thực 2 lớp</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Logout All Devices */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FaSignOutAlt className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Đăng xuất khỏi tất cả thiết bị</h4>
                <p className="text-sm text-gray-500">Kết thúc tất cả phiên đăng nhập trên các thiết bị</p>
              </div>
            </div>
            <button className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Đăng xuất tất cả
            </button>
          </div>
        </div>
      ),
    },
  ];

  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các cài đặt cho hệ thống của bạn
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {sections.find((section) => section.id === activeSection)?.content}

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <FaSave className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingManagement;
