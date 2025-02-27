import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/CustomerThemeContext';

const Logo = () => {
    const { theme } = useTheme();

    return (
        <div className="w-auto">
            <Link to="/" className="relative group inline-block">
                <div className="flex items-center">
                    {/* Logo Text */}
                    <div className="relative">
                        <span className={`text-2xl font-bold ${theme === 'tet'
                                ? 'text-yellow-300/90'
                                : 'text-white'
                            } transition-all duration-300 animate-pulse-slow`}>
                            KTT
                        </span>
                        <span className={`ml-2 text-2xl font-light ${theme === 'tet'
                                ? 'text-yellow-200/90'
                                : 'text-gray-300'
                            } transition-all duration-300`}>
                            Store
                        </span>

                        {/* Glow Effect - Hiệu ứng lấp lánh*/}
                        <div className={`absolute inset-0 opacity-75 ${theme === 'tet'
                                ? 'animate-glow-gold'
                                : 'animate-glow-blue'
                            }`} />

                        {/* Sparkles - Hiệu ứng 3 tia lấp lánh*/}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-sparkle-1" />
                            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-sparkle-2" />
                            <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-white rounded-full animate-sparkle-3" />
                        </div>

                        {/* Glowing Border - Hiệu ứng viền lấp lánh*/}
                        <div className={`absolute -inset-0.5 opacity-0 ${theme === 'tet'
                                ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400'
                                : 'bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400'
                            } rounded-lg blur animate-border-glow`} />

                        {/* Glowing Dot - Hiệu ứng chấm sáng ở góc*/}
                        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${theme === 'tet'
                                ? 'bg-yellow-400'
                                : 'bg-blue-400'
                            } transition-all duration-300 animate-ping`} />
                    </div>

                    {/* Theme-based Decoration */}
                    {theme === 'tet' && (
                        <>
                            {/* Mai Flower - Hiệu ứng hoa mai*/}
                            <div className="absolute -top-3 -right-6 text-yellow-400 animate-bounce-slow">
                                ✿
                            </div>
                            {/* Red Envelope - Hiệu ứng túi đựng tiền*/}
                            <div className="absolute -bottom-2 -right-4 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                                🧧
                            </div>
                        </>
                    )}
                </div>

                {/* Tooltip - Hiển thị chữ nhắn*/}
                <div className={`absolute ml-4 -bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${theme === 'tet'
                        ? 'bg-yellow-400 text-red-700'
                        : 'bg-blue-500 text-white'
                    } opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0`}>
                    {theme === 'tet' ? 'Chúc Mừng Năm Mới' : 'Welcome to KTT Store'}
                </div>
            </Link>
        </div>
    );
};

export default Logo;
