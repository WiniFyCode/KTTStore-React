// News.jsx - Trang hiển thị tin tức của website
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaEye, FaNewspaper } from 'react-icons/fa';
import PageBanner from '../../../components/PageBanner';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import { getAllNews, getNewsByCategory } from '../../../services/newsService';

const News = () => {
  const { theme } = useTheme();
  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Danh sách các danh mục tin tức
  const categories = ['Tất cả', 'Xu hướng', 'Phong cách', 'Sự kiện', 'Hướng dẫn'];

  // Load tin tức khi component mount hoặc khi category thay đổi
  useEffect(() => {
    const fetchNews = () => {
      const newsData = getNewsByCategory(selectedCategory);
      setNews(newsData);
    };
    fetchNews();
  }, [selectedCategory]);

  // Lọc tin tức theo danh mục
  const filteredNews = selectedCategory === 'Tất cả' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  return (
    // Container chính với gradient background tùy theo theme
    <div className={`min-h-screen ${theme === 'tet' ? 'bg-gradient-to-br from-red-50 to-yellow-50' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      {/* Banner */}
      <PageBanner
        theme={theme}
        icon={FaNewspaper}
        title="Tin Tức & Sự Kiện"
        subtitle="Cập nhật những tin tức mới nhất về thời trang và xu hướng"
        breadcrumbText="Tin tức"
      />

      {/* Container chứa nội dung */}
      <div className="container mx-auto px-4 py-8">
        {/* Bar tìm kiếm và bộ lọc */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          {/* Phần lọc danh mục */}
          <div className="flex flex-wrap gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? theme === 'tet'
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                    : theme === 'tet'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid tin tức */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map(item => (
            <div 
              key={item.id}
              className={`rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2 ${
                theme === 'tet'
                  ? 'bg-white/80 hover:bg-white'
                  : 'bg-white'
              }`}
            >
              {/* Ảnh tin tức */}
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              
              {/* Nội dung tin tức */}
              <div className="p-6">
                {/* Danh mục */}
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  theme === 'tet'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                } mb-4`}>
                  {item.category}
                </span>

                {/* Tiêu đề */}
                <h3 className="text-xl font-semibold mb-3 hover:text-blue-600">
                  <Link to={`/news/${item.id}`}>
                    {item.title}
                  </Link>
                </h3>

                {/* Tóm tắt */}
                <p className="text-gray-600 mb-4">
                  {item.summary}
                </p>

                {/* Meta info */}
                <div className="flex items-center text-sm text-gray-500">
                  <FaCalendarAlt className="mr-2" />
                  <span className="mr-4">{item.date}</span>
                  <FaEye className="mr-2" />
                  <span>{item.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
