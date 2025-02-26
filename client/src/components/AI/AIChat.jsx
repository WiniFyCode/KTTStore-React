import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageSquare, FiUser, FiHelpCircle } from 'react-icons/fi';
import { useTheme } from '../../contexts/CustomerThemeContext';
import axiosInstance from '../../utils/axios';
import { Link } from 'react-router-dom';

// Thêm ImageModal component
const ImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}>
      <div className="relative max-w-[90vw] md:max-w-4xl max-h-[90vh] p-2">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black bg-opacity-50"
        >
          <FiX className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <img
          src={image.url}
          alt={image.name}
          className="max-h-[80vh] w-auto object-contain rounded-lg"
          onClick={e => e.stopPropagation()}
        />
        <p className="text-white text-center mt-2 text-sm md:text-base">{image.name}</p>
      </div>
    </div>
  );
};

const AIChat = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [context, setContext] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // Thêm state cho modal

  // Các suggested questions
  const suggestedQuestions = [
    "Làm sao để chọn size phù hợp?",
    "Gợi ý phối đồ với áo sơ mi trắng",
    "Cách bảo quản áo len",
    "Chất liệu vải cotton có tốt không?",
    "Tôi muốn mua áo len nam, bạn có thể giúp tôi không?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleProductQuery = async (query) => {
    try {
      const response = await axiosInstance.post('/api/ai/chat', {
        query,
        context: context.slice(-5)
      });

      setContext(prev => [...prev, {
        role: 'user',
        content: query
      }, {
        role: 'assistant',
        content: response.data.response
      }]);

      return response.data.response;
    } catch (error) {
      console.error('Lỗi AI chat:', error);
      return 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await handleProductQuery(inputMessage);
      
      // Log response từ server
      console.log('Server Response:', response);

      const aiMessage = {
        type: 'ai',
        content: response
      };

      // Log message sau khi format
      console.log('Formatted Message:', formatMessage(response));

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        type: 'error',
        content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm format tin nhắn để hiển thị ảnh
  const formatMessage = (content) => {
    // Tìm các ảnh sản phẩm và link trong nội dung
    const productRegex = /!\[(.*?)\]\((.*?)\)[\n\r]*(.*?)[\n\r]*http:\/\/localhost:5173\/product\/(\d+)/g;
    let formattedContent = content;
    const images = [];

    // Thu thập tất cả ảnh sản phẩm
    let match;
    while ((match = productRegex.exec(content)) !== null) {
      const [fullMatch, altText, imageUrl, productName, productId] = match;
      images.push({
        name: productName.trim(), // Sử dụng tên sản phẩm từ dòng riêng
        url: imageUrl,
        productUrl: `http://localhost:5173/product/${productId}`
      });
      // Xóa toàn bộ phần markdown ảnh, tên và URL khỏi nội dung
      formattedContent = formattedContent.replace(fullMatch, '');
    }

    // Format text content với xuống dòng và emoji
    const formattedText = formattedContent
      .split('\n')
      .map((line, index) => (
        <React.Fragment key={index}>
          {line.trim() && (
            <p className={`mb-2 ${line.startsWith('•') ? 'ml-4' : ''}`}>
              {line}
            </p>
          )}
        </React.Fragment>
      ));

    return (
      <div className="message-content space-y-2">
        {/* Phần text */}
        <div className="text-sm md:text-base whitespace-pre-wrap">
          {formattedText}
        </div>

        {/* Phần ảnh sản phẩm */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {images.map((image, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                style={{
                  animation: `fadeIn 0.3s ease-out forwards`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <Link to={image.productUrl.replace('http://localhost:5173', '')} className="block">
                  <div className="aspect-w-3 aspect-h-4 relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedImage(image);
                      }}
                    />
                  </div>
                  <div className="p-2 bg-gray-50">
                    <p className="text-xs text-gray-600 text-center truncate hover:text-blue-600">
                      {image.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render tin nhắn
  const renderMessage = (message) => (
    <div
      className={`flex ${
        message.type === 'user' ? 'justify-end' : 'justify-start'
      } mb-4 message-animation`}
    >
      {/* Avatar cho AI */}
      {message.type !== 'user' && (
        <div className="flex-shrink-0 mr-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
            theme === 'tet' ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-blue-50 to-blue-100'
          }`}>
            <FiHelpCircle className={`w-5 h-5 ${
              theme === 'tet' ? 'text-red-500' : 'text-blue-500'
            }`} />
          </div>
        </div>
      )}

      {/* Nội dung tin nhắn */}
      <div
        className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
          message.type === 'user'
            ? theme === 'tet'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            : theme === 'tet'
            ? 'bg-white border border-red-100'
            : 'bg-white border border-blue-100'
        }`}
      >
        {formatMessage(message.content)}
      </div>

      {/* Avatar cho User */}
      {message.type === 'user' && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
            <FiUser className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{slideInAnimation}</style>

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-10 right-6 p-3 rounded-full shadow-lg z-30 transition-all duration-300 
          hover:scale-110 animate-bounce ${theme === 'tet'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
      >
        <FiMessageSquare className="w-5 h-5" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 md:w-[400px] md:h-[600px] bg-white rounded-none md:rounded-2xl shadow-2xl z-50 flex flex-col animate-slideIn">
          {/* Header */}
          <div className={`p-4 md:rounded-t-2xl flex justify-between items-center
            ${theme === 'tet'
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FiHelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">KTT Store</h3>
                <p className="text-sm text-white/90">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shadow-sm">
                  <FiHelpCircle className={`w-8 h-8 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800 text-lg">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                  <p className="text-gray-500">Hãy chọn câu hỏi hoặc nhập câu hỏi của bạn</p>
                </div>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 gap-2.5 mt-6">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(question);
                        handleSend();
                      }}
                      className={`p-3 rounded-xl transition-all duration-200 text-left hover:shadow-md
                        ${theme === 'tet' 
                          ? 'bg-white hover:bg-red-50 border border-red-100' 
                          : 'bg-white hover:bg-blue-50 border border-blue-100'}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index}>{renderMessage(message)}</div>
            ))}

            {/* Loading Animation */}
            {isLoading && (
              <div className="flex justify-start mb-4 message-animation">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="typing-animation">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white md:rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  theme === 'tet'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-400 disabled:to-red-400'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-400'
                } text-white disabled:cursor-not-allowed hover:shadow-md`}
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

// Thêm keyframes animation vào đầu file
const slideInAnimation = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.message-animation {
  animation: slideIn 0.3s ease-out forwards;
}

.typing-animation {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
  animation: typing 1s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0.1s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
`;

export default AIChat; 