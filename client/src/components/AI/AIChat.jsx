import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageSquare, FiUser, FiHelpCircle } from 'react-icons/fi';
import { useTheme } from '../../contexts/CustomerThemeContext';
import axiosInstance from '../../utils/axios';

const AIChat = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Các suggested questions
  const suggestedQuestions = [
    "Làm sao để chọn size phù hợp?",
    "Gợi ý phối đồ với áo sơ mi trắng",
    "Cách bảo quản áo len",
    "Chất liệu vải cotton có tốt không?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await axiosInstance.post('/api/products/ai/chat', {
        query: inputMessage
      });

      const aiMessage = {
        type: 'ai',
        content: response.data.response
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button với animation */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 p-4 rounded-full shadow-lg z-50 transition-all duration-300 
          hover:scale-110 animate-bounce ${
          theme === 'tet'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <FiMessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window với animation */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col
          animate-slideIn backdrop-blur-sm bg-opacity-95">
          {/* Header với gradient */}
          <div className={`p-4 rounded-t-lg flex justify-between items-center
            ${theme === 'tet' 
              ? 'bg-gradient-to-r from-red-600 to-red-500'
              : 'bg-gradient-to-r from-blue-600 to-blue-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiHelpCircle className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-white font-medium">AI Trợ lý thời trang</h3>
                <p className="text-xs text-white/80">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages với style mới */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <FiHelpCircle className={`w-8 h-8 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                  <p className="text-sm text-gray-500 mt-1">Hãy chọn câu hỏi hoặc nhập câu hỏi của bạn</p>
                </div>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(question);
                        handleSend();
                      }}
                      className={`p-2 text-sm rounded-lg transition-all duration-200 text-left
                        ${theme === 'tet'
                          ? 'hover:bg-red-50 text-red-600 border border-red-200'
                          : 'hover:bg-blue-50 text-blue-600 border border-blue-200'
                        }`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type !== 'user' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <FiHelpCircle className={`w-4 h-4 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-3 ${
                    message.type === 'user'
                      ? theme === 'tet'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-white shadow-sm border'
                  }`}
                >
                  {message.content}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Animation */}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'tet' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <FiHelpCircle className={`w-4 h-4 ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border">
                  <div className="flex space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                    }`} style={{ animationDelay: '0.2s' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'
                    }`} style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input với style mới */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                className={`p-2 rounded-full transition-all duration-200 ${
                  theme === 'tet'
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                } text-white disabled:cursor-not-allowed hover:scale-105`}
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat; 