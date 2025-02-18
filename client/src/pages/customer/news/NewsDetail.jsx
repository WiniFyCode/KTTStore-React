// NewsDetail.jsx - Trang hiển thị chi tiết tin tức
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaEye, FaTags, FaArrowLeft, FaFacebookF, FaTwitter } from 'react-icons/fa';
import PageBanner from '../../../components/PageBanner';
import { useTheme } from '../../../contexts/CustomerThemeContext';
import { getNews, getRelatedNewsItems } from '../../../services/newsService';

const NewsDetail = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsDetail, setNewsDetail] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchNewsDetail = () => {
      const news = getNews(id);
      if (!news) {
        // Nếu không tìm thấy tin tức, chuyển về trang tin tức
        navigate('/news');
        return;
      }
      setNewsDetail(news);
      
      // Lấy tin tức liên quan
      const related = getRelatedNewsItems(parseInt(id), news.category);
      setRelatedNews(related);
    };
    fetchNewsDetail();
  }, [id, navigate]);

  if (!newsDetail) return null;

  // Đảm bảo HTML content được hiển thị đúng
  const decodedContent = newsDetail.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  return (
    <div className="min-h-screen">
      {/* Banner với tiêu đề bài viết */}
      <PageBanner 
        title={newsDetail.title}
        description={`Danh mục: ${newsDetail.category}`}
      />

      {/* Container chính */}
      <div className={`py-8 ${
        theme === 'tet' 
          ? 'bg-red-50'
          : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cột chính */}
            <div className="lg:w-2/3">
              {/* Nút quay lại */}
              <Link 
                to="/news"
                className={`inline-flex items-center mb-6 px-4 py-2 rounded-full transition-all duration-300 ${
                  theme === 'tet'
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                <FaArrowLeft className="mr-2" />
                Quay lại tin tức
              </Link>

              {/* Ảnh chính */}
              <img 
                src={newsDetail.image} 
                alt={newsDetail.title}
                className="w-full rounded-lg mb-6"
              />

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-600">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  {newsDetail.date}
                </div>
                <div className="flex items-center">
                  <FaEye className="mr-2" />
                  {newsDetail.views.toLocaleString()} lượt xem
                </div>
                <div className="flex items-center">
                  <FaTags className="mr-2" />
                  {newsDetail.category}
                </div>
              </div>

              {/* Nội dung bài viết */}
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: decodedContent }}
              />

              {/* Tags */}
              {newsDetail.tags && newsDetail.tags.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-3">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {newsDetail.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-sm ${
                          theme === 'tet'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chia sẻ mạng xã hội */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-3">Chia sẻ:</h4>
                <div className="flex gap-3">
                  <button className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                    <FaFacebookF />
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500">
                    <FaTwitter />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Tin tức liên quan */}
              <div className={`rounded-lg p-6 ${
                theme === 'tet'
                  ? 'bg-white/80'
                  : 'bg-white'
              }`}>
                <h3 className="text-xl font-semibold mb-4">Tin tức liên quan</h3>
                {relatedNews && relatedNews.length > 0 ? (
                  <div className="space-y-4">
                    {relatedNews.map(news => (
                      <Link 
                        key={news.id}
                        to={`/news/${news.id}`}
                        className="flex gap-4 group"
                      >
                        <img 
                          src={news.image}
                          alt={news.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium group-hover:text-blue-600 transition-colors">
                            {news.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {news.date}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Không có tin tức liên quan</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
