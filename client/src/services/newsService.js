// newsService.js - Service xử lý các thao tác với tin tức
import { newsData, getNewsById, getRelatedNews } from '../data/NewsData';

// Lấy tất cả tin tức
export const getAllNews = () => {
  return newsData;
};

// Lấy tin tức theo ID
export const getNews = (id) => {
  return getNewsById(id);
};

// Lấy tin tức liên quan
export const getRelatedNewsItems = (currentId, category) => {
  return getRelatedNews(currentId, category);
};

// Lấy tin tức theo category
export const getNewsByCategory = (category) => {
  if (category === 'Tất cả') return newsData;
  return newsData.filter(news => news.category === category);
};
