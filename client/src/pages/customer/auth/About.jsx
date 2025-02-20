// About.jsx - Trang giới thiệu về shop và thành viên
import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaFacebook, FaCode, FaDatabase, FaLaptopCode, FaAward, FaUserGraduate, FaChalkboardTeacher, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaEnvelope, FaPhone, FaHeart, FaStar, FaEye, FaShare, FaClock, FaCheckCircle, FaRocket, FaPencilAlt, FaTools, FaGlobe, FaInfoCircle, FaExternalLinkAlt, FaShippingFast, FaExchangeAlt, FaHeadset, FaShieldAlt, FaTshirt, FaUsers, FaTruck } from 'react-icons/fa';
import PageBanner from '../../../components/PageBanner';
import { useTheme } from '../../../contexts/CustomerThemeContext';

// Theme chung cho modal header
const modalThemes = { 
  blue: {
    primary: 'blue',
    gradientFrom: 'from-blue-600',
    gradientVia: 'via-blue-500',
    gradientTo: 'to-blue-700',
    accentLight: 'blue-100',
    accentMedium: 'blue-400',
    accentDark: 'blue-600',
  },
  green: {
    primary: 'green',
    gradientFrom: 'from-emerald-600',
    gradientVia: 'via-emerald-500',
    gradientTo: 'to-emerald-700',
    accentLight: 'emerald-100',
    accentMedium: 'emerald-400',
    accentDark: 'emerald-600',
  },
  purple: {
    primary: 'purple',
    gradientFrom: 'from-purple-600',
    gradientVia: 'via-purple-500',
    gradientTo: 'to-purple-700',
    accentLight: 'purple-100',
    accentMedium: 'purple-400',
    accentDark: 'purple-600',
  }
};

// Dữ liệu về shop
const shopInfo = {
  name: 'KTT Store',
  slogan: 'Thời trang cho mọi người',
  founded: '2024',
  location: 'TP.HCM, Việt Nam',
  mission: {
    title: 'Sứ mệnh',
    description: 'Mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý, đồng thời tạo ra một nền tảng mua sắm trực tuyến tiện lợi và an toàn.',
    points: [
      'Cung cấp sản phẩm chất lượng',
      'Giá cả hợp lý',
      'Dịch vụ khách hàng tốt',
      'Trải nghiệm mua sắm thuận tiện'
    ]
  },
  vision: {
    title: 'Tầm nhìn',
    description: 'Trở thành một trong những website thương mại điện tử hàng đầu về thời trang tại Việt Nam, đồng thời là một dự án mẫu cho sinh viên ngành CNTT.',
    points: [
      'Phát triển bền vững',
      'Mở rộng thị trường',
      'Nâng cao chất lượng',
      'Tối ưu trải nghiệm người dùng'
    ]
  },
  values: {
    title: 'Giá trị cốt lõi',
    description: 'Xây dựng một nền tảng thương mại điện tử dựa trên các giá trị cốt lõi:',
    points: [
      'Sáng tạo trong phát triển',
      'Học hỏi không ngừng',
      'Phát triển bền vững',
      'Tập trung vào khách hàng'
    ]
  },
  features: [
    {
      title: 'Giao diện thân thiện',
      description: 'Thiết kế responsive, dễ sử dụng trên mọi thiết bị'
    },
    {
      title: 'Thanh toán an toàn',
      description: 'Hỗ trợ nhiều phương thức thanh toán bảo mật'
    },
    {
      title: 'Vận chuyển nhanh chóng',
      description: 'Giao hàng toàn quốc, theo dõi đơn hàng realtime'
    },
    {
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ CSKH nhiệt tình, chuyên nghiệp'
    }
  ],
  technologies: [
    'ReactJS', 'NodeJS', 'MongoDB', 'Express', 'TailwindCSS',
    'Redux Toolkit', 'JWT', 'Socket.io', 'Cloudinary'
  ]
};

// Dữ liệu thông tin các thành viên trong nhóm
const teamMembers = [
  {
    name: 'Trần Đình Thành',
    role: 'Thành viên nhóm phát triển',
    birthday: '2005',
    avatar: '../images/avatar2.jpg',
    icon: FaLaptopCode,
    skills: ['HTML/CSS', 'JavaScript', 'ReactJS', 'TailwindCSS'],
    color: 'blue',
    class: 'CD23LM1',
    description: 'Sinh viên năm 2 ngành Công nghệ thông tin tại ITC, đam mê lập trình và phát triển ứng dụng web.',
    detailedInfo: {
      projects: [
        'Website KTT Store',
        'Portfolio cá nhân',
        'Blog chia sẻ kiến thức',
        'Ứng dụng quản lý chi tiêu',
        'Website tin tức'
      ],
      interests: [
        'Phát triển Web',
        'UI/UX Design',
        'Công nghệ mới',
        'Học hỏi không ngừng',
        'Làm việc nhóm'
      ],
      education: 'Đang theo học tại ITC - Khoa CNTT',
      certifications: [
        'Web Development - Udemy',
        'JavaScript - Coursera',
        'Web Design - FreeCodeCamp'
      ],
      achievements: [
        'Top 10 Hackathon ITC 2023',
        'Giải nhất cuộc thi lập trình sinh viên',
        'Best Project 2023'
      ],
      quote: 'Học tập và phát triển không ngừng',
      socialLinks: {
        github: 'https://github.com/thanh-dev',
        linkedin: 'https://linkedin.com/in/thanh-dev',
        facebook: 'https://facebook.com/thanh.dev'
      }
    }
  },
  {
    name: 'Nguyễn Thanh Toàn',
    role: 'Thành viên nhóm phát triển',
    birthday: '2005',
    avatar: '../images/avatar3.jpg',
    icon: FaCode,
    skills: ['JavaScript', 'NodeJS', 'MongoDB', 'ExpressJS'],
    color: 'green',
    class: 'CD23LM1',
    description: 'Sinh viên năm 2 ngành Công nghệ thông tin tại ITC, đam mê học hỏi và phát triển ứng dụng.',
    detailedInfo: {
      projects: [
        'Website KTT Store',
        'Hệ thống quản lý',
        'Ứng dụng chat realtime',
        'API Integration',
        'Payment System'
      ],
      interests: [
        'Phát triển Web',
        'Hệ thống phân tán',
        'Cloud Computing',
        'Học hỏi không ngừng',
        'Làm việc nhóm'
      ],
      education: 'Đang theo học tại ITC - Khoa CNTT',
      certifications: [
        'Web Development - Udemy',
        'Database Design - MongoDB University',
        'NodeJS - Coursera'
      ],
      achievements: [
        'Best Solution 2023',
        'Innovation Award - Tech Contest',
        'System Design Champion'
      ],
      quote: 'Sáng tạo và đổi mới không ngừng',
      socialLinks: {
        github: 'https://github.com/toan-dev',
        linkedin: 'https://linkedin.com/in/toan-dev',
        facebook: 'https://facebook.com/toan.dev'
      }
    }
  },
  {
    name: 'Nguyễn Duy Khôi',
    role: 'Thành viên nhóm phát triển',
    birthday: '2005',
    avatar: '../images/avatar.jpg',
    icon: FaDatabase,
    skills: ['JavaScript', 'SQL', 'MongoDB', 'System Design'],
    color: 'purple',
    class: 'CD23LM1',
    description: 'Sinh viên năm 2 ngành Công nghệ thông tin tại ITC, đam mê công nghệ và phát triển hệ thống.',
    detailedInfo: {
      projects: [
        'Website KTT Store',
        'Hệ thống quản lý dữ liệu',
        'Monitoring System',
        'Data Analysis Tool',
        'Backup Solution'
      ],
      interests: [
        'Phát triển Web',
        'Phân tích dữ liệu',
        'Hệ thống thông tin',
        'Học hỏi không ngừng',
        'Làm việc nhóm'
      ],
      education: 'Đang theo học tại ITC - Khoa CNTT',
      certifications: [
        'Database Design - Udemy',
        'System Administration - Coursera',
        'Web Development - FreeCodeCamp'
      ],
      achievements: [
        'System Performance Award',
        'Best Practice Certificate',
        'Innovation Champion'
      ],
      quote: 'Kiến thức là chìa khóa của thành công',
      socialLinks: {
        github: 'https://github.com/khoi-dev',
        linkedin: 'https://linkedin.com/in/khoi-dev',
        facebook: 'https://facebook.com/khoi.dev'
      }
    }
  }
];

// Thêm dữ liệu liên hệ cho shop
const contactInfo = {
  address: "123 Đường ABC, Quận XYZ, TP.HCM",
  email: "kttstore3cg@gmail.com",
  phone: "0123.456.789",
  workingHours: '8:00 - 22:00 (T2-CN)'
};

// Thêm dữ liệu thống kê
const statistics = {
  customers: '1,000+',
  products: '500+',
  orders: '5,000+',
  rating: 4.8
};

// Thêm dữ liệu timeline
const timeline = [
  {
    date: 'Tháng 12/2023',
    title: 'Lên ý tưởng dự án',
    description: 'Bắt đầu lên ý tưởng và phân tích yêu cầu',
    icon: FaPencilAlt,
    status: 'completed',
    details: [
      'Nghiên cứu thị trường',
      'Xác định mục tiêu dự án',
      'Lập kế hoạch thực hiện',
      'Phân tích yêu cầu người dùng'
    ]
  },
  {
    date: 'Tháng 6/2024',
    title: 'Phát triển Front-end',
    description: 'Thiết kế và xây dựng giao diện người dùng',
    icon: FaCode,
    status: 'in-progress',
    details: [
      'Thiết kế UI/UX',
      'Xây dựng components',
      'Tích hợp responsive design',
      'Tối ưu performance'
    ]
  },
  {
    date: 'Tháng 12/2024',
    title: 'Phát triển Back-end',
    description: 'Tìm hiểu và phát triển hệ thống Back-end',
    icon: FaTools,
    status: 'in-progress',
    details: [
      'Tìm hiểu Node.js và Express.js',
      'Học MongoDB và thiết kế database',
      'Nghiên cứu RESTful API và Authentication',
      'Tìm hiểu về bảo mật và xử lý lỗi'
    ]
  },
  {
    date: '10/2/2025',
    title: 'Triển khai hệ thống',
    description: 'Đang trong quá trình triển khai và phát triển',
    icon: FaRocket,
    status: 'in-progress',
    details: [
      'Triển khai hệ thống',
      'Testing và tối ưu',
      'Sửa lỗi phát sinh',
      'Chuẩn bị ra mắt'
    ]
  }
];

// Thêm dữ liệu về trường học
const schoolInfo = {
  name: 'Trường Cao đẳng Công nghệ Thông Tin',
  shortName: 'ITC',
  address: '12 Trịnh Đình Thảo, Hoà Thanh, Tân Phú, Hồ Chí Minh',
  website: 'https://itc.edu.vn/',
  description: 'Trường Cao đẳng Công nghệ Thông Tin (ITC) là một trong những cơ sở giáo dục hàng đầu trong lĩnh vực đào tạo công nghệ thông tin tại TP.HCM.',
  departments: [
    {
      name: 'Khoa Công nghệ thông tin',
      description: 'Đào tạo các chuyên ngành về lập trình, phát triển phần mềm, và quản trị hệ thống.',
      majors: [
        'Công nghệ thông tin',
        'Lập trình máy tính',
        'Thiết kế website',
        '. . .'
      ]
    },
    {
      name: 'Khoa Điện - Điện tử',
      description: 'Đào tạo các chuyên ngành về điện tử, tự động hóa và IoT.',
      majors: [
        'Điện công nghiệp',
        'Điện tử công nghiệp',
        'Tự động hóa',
        '. . .'
      ]
    },
    {
      name: 'Khoa Kinh Tế',
      description: 'Đào tạo các chuyên ngành về kinh tế, quản lý và marketing.',
      majors: [
        'Kinh tế',
        'Quản lý',
        'Marketing',
        '. . .'
      ]
    },
    {
      name: 'Khoa Đại Cương',
      description: 'Đào tạo các chuyên ngành về đại cương.',
      majors: [
        'Tiếng Anh',
        'Kĩ năng mềm',
        'Giáo dục thể chất',
        '. . .'
      ]
    }
  ],
  facilities: [
    'Phòng máy tính hiện đại',
    'Thư viện điện tử',
    'Phòng thực hành chuyên ngành',
    'Khu thể thao đa năng',
    'Căng tin'
  ],
  educationLinks: [
    {
      name: 'Đại học Trà Vinh (TVU)',
      logo: 'https://cdn.itc.edu.vn/Data/Sites/1/News/384/tvu.png',
      website: 'https://www.tvu.edu.vn/',
      description: 'Liên kết đào tạo với Đại học Trà Vinh trong các chương trình cử nhân.'
    },
    {
      name: 'Đại học Công nghệ Thông tin (UIT)',
      logo: 'https://cdn.itc.edu.vn/Data/Sites/1/News/385/uit.png', 
      website: 'https://www.uit.edu.vn/',
      description: 'Hợp tác đào tạo trong lĩnh vực công nghệ thông tin và chuyển tiếp sinh viên.'
    },
    {
      name: 'Đại học Công nghiệp Thực phẩm TP.HCM (HUFI)',
      logo: 'https://cdn.itc.edu.vn/Data/Sites/1/News/382/hufi.png',
      website: 'https://hufi.edu.vn/',
      description: 'Liên kết đào tạo và chuyển tiếp sinh viên trong các ngành công nghệ.'
    },
    {
      name: 'Trung tâm Dự báo nhu cầu nhân lực (FALMI)',
      logo: 'https://cdn.itc.edu.vn/Data/Sites/1/News/381/falmi.png',
      website: 'https://www.falmi.org.vn/',
      description: 'Đối tác trong nghiên cứu và dự báo nhu cầu nhân lực CNTT.'
    },
    {
      name: 'Cánh Cam',
      logo: 'https://cdn.itc.edu.vn/Data/Sites/1/News/379/c%C3%A1nh-cam.png',
      website: 'https://canhcam.vn/',
      description: 'Đối tác trong đào tạo và thực tập về thiết kế website và phát triển phần mềm.'
    },
    {
      name: 'Cao đẳng Công nghệ Y dược Việt Nam (YDVN)',
      logo: 'https://cdn.itc.edu.vn/Data/Sites/1/News/380/cd-y-duoc.png',
      website: 'https://ydvn.edu.vn/',
      description: 'Hợp tác trong lĩnh vực đào tạo công nghệ y tế.'
    }
  ]
};

// Dữ liệu thành tựu của trường
const achievements = [
  {
    icon: FaUserGraduate,
    title: 'Sinh viên',
    value: '38,000+',
    description: 'Sinh viên đã và đang học tại trường',
    details: [
      'Tỷ lệ sinh viên có việc làm sau tốt nghiệp: 95%',
      'Sinh viên được đào tạo theo chuẩn quốc tế',
      'Nhiều cơ hội thực tập tại doanh nghiệp lớn'
    ]
  },
  {
    icon: FaChalkboardTeacher,
    title: 'Giảng viên',
    value: '725+',
    description: 'Đội ngũ giảng viên giàu kinh nghiệm',
    details: [
      'Trình độ từ Thạc sĩ trở lên',
      'Nhiều năm kinh nghiệm trong ngành',
      'Thường xuyên cập nhật kiến thức mới'
    ]
  },
  {
    icon: FaAward,
    title: 'Thành tựu',
    value: '500+',
    description: 'Doanh nghiệp đối tác',
    details: [
      'Hợp tác với các công ty công nghệ hàng đầu',
      'Nhiều dự án thực tế cho sinh viên',
      'Cơ hội việc làm cao sau tốt nghiệp'
    ]
  }
];

// Thêm dữ liệu đánh giá của khách hàng
const customerReviews = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    avatar: 'https://picsum.photos/200/200?random=1',
    rating: 5,
    comment: 'Sản phẩm chất lượng tuyệt vời, dịch vụ khách hàng rất tận tình. Giao hàng nhanh và đóng gói cẩn thận.',
    date: '15/02/2024',
    purchasedItems: ['Áo thun nam', 'Quần jean'],
    isVerified: true
  },
  {
    id: 2,
    name: 'Trần Thị B',
    avatar: 'https://picsum.photos/200/200?random=2',
    rating: 4,
    comment: 'Tôi rất hài lòng với trải nghiệm mua sắm tại KTT Store. Giá cả hợp lý, nhiều mẫu mã đẹp.',
    date: '10/02/2024',
    purchasedItems: ['Váy hoa', 'Áo khoác'],
    isVerified: true
  },
  {
    id: 3,
    name: 'Lê Văn C',
    avatar: 'https://picsum.photos/200/200?random=3',
    rating: 5,
    comment: 'Website dễ sử dụng, thanh toán an toàn. Nhân viên tư vấn nhiệt tình, sẽ ủng hộ shop dài dài.',
    date: '05/02/2024',
    purchasedItems: ['Áo sơ mi', 'Quần tây'],
    isVerified: true
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    avatar: 'https://picsum.photos/200/200?random=4',
    rating: 5,
    comment: 'Lần đầu mua hàng tại KTT Store nhưng rất ấn tượng. Chất lượng sản phẩm tốt, đúng như mô tả.',
    date: '01/02/2024',
    purchasedItems: ['Đầm dự tiệc'],
    isVerified: true
  }
];

// Modal Component để hiển thị thông tin chi tiết
const MemberDetailModal = ({ member, isOpen, onClose }) => {
  const theme = modalThemes[member.color];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay với animation */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
      />

      {/* Modal Content */}
      <div className="relative w-[95%] max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header với thiết kế thống nhất */}
        <div className="relative">
          {/* Background Pattern động */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`}>
            {/* Animated Patterns */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 pattern-dots animate-slide-slow"></div>
              <div className="absolute inset-0 pattern-waves animate-wave-slow"></div>
            </div>

            {/* Geometric Shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl animate-pulse-slow"></div>
              <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl animate-pulse-slow delay-300"></div>
            </div>
          </div>

          {/* Header Content */}
          <div className="relative py-8 px-6 sm:px-8">
            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300 hover:rotate-90 transform backdrop-blur-sm"
            >
              <FaTimes size={20} />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Container */}
              <div className="relative group">
                {/* Avatar Frame */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-sm rounded-2xl">
                    <div className="absolute inset-2 overflow-hidden rounded-xl">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                  </div>

                  {/* Role Icon */}
                  <div className={`absolute -right-3 -bottom-3 w-10 h-10 bg-white text-${theme.accentDark} rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-500 group-hover:rotate-[360deg]`}>
                    <member.icon size={20} />
                  </div>
                </div>
              </div>

              {/* Thông tin cơ bản */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h3 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1`}>
                    {member.name}
                  </h3>
                  <p className="text-white/90 text-lg font-medium tracking-wide mb-2">
                    {member.role}
                  </p>
                </div>

                {/* Thông tin phụ */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm">
                    <FaUserGraduate /> 
                    <span>{member.class}</span>
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm">
                    {member.birthday}
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                  {[
                    { icon: FaGithub, label: 'Github' },
                    { icon: FaLinkedin, label: 'LinkedIn' },
                    { icon: FaFacebook, label: 'Facebook' }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href="#"
                      className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-white"
                    >
                      <social.icon size={18} />
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {social.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body content với scroll */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 12rem)' }}>
          <div className="p-6 space-y-6">
            {/* Mô tả */}
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-gray-600 italic">
                "{member.description}"
              </p>
            </div>

            {/* Grid content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột trái */}
              <div className="space-y-6">
                {/* Dự án */}
                <div className={`rounded-xl p-5 bg-${member.color}-50/50`}>
                  <h4 className="text-base font-semibold mb-3 flex items-center text-gray-800">
                    <FaCode className={`mr-2 text-${member.color}-500`} />
                    Dự án đã thực hiện
                  </h4>
                  <div className="space-y-2">
                    {member.detailedInfo.projects.map((project, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg bg-white group transition-all duration-300 hover:shadow-md`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${member.color}-400`}></div>
                          <span className="text-gray-700 text-sm">{project}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Học vấn */}
                <div className={`rounded-xl p-5 bg-${member.color}-50/50`}>
                  <h4 className="text-base font-semibold mb-3 flex items-center text-gray-800">
                    <FaUserGraduate className={`mr-2 text-${member.color}-500`} />
                    Học vấn
                  </h4>
                  <div className="p-3 rounded-lg bg-white">
                    <p className="text-gray-700 text-sm">{member.detailedInfo.education}</p>
                  </div>
                </div>
              </div>

              {/* Cột phải */}
              <div className="space-y-6">
                {/* Sở thích & Định hướng */}
                <div className={`rounded-xl p-5 bg-${member.color}-50/50`}>
                  <h4 className="text-base font-semibold mb-3 flex items-center text-gray-800">
                    <FaLaptopCode className={`mr-2 text-${member.color}-500`} />
                    Sở thích & Định hướng
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {member.detailedInfo.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-sm bg-white text-gray-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Kỹ năng */}
                <div className={`rounded-xl p-5 bg-${member.color}-50/50`}>
                  <h4 className="text-base font-semibold mb-3 flex items-center text-gray-800">
                    <FaDatabase className={`mr-2 text-${member.color}-500`} />
                    Kỹ năng
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {member.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white flex items-center gap-2"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full bg-${member.color}-400`}></div>
                        <span className="text-gray-700 text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Châm ngôn */}
                <div className={`rounded-xl p-5 bg-${member.color}-50/50`}>
                  <h4 className="text-base font-semibold mb-3 flex items-center text-gray-800">
                    <FaAward className={`mr-2 text-${member.color}-500`} />
                    Châm ngôn
                  </h4>
                  <div className="p-3 rounded-lg bg-white relative">
                    <p className="text-gray-700 italic text-sm text-center">
                      {member.detailedInfo.quote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Component cho Timeline
const TimelineDetailModal = ({ item, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Thêm dữ liệu chi tiết cho từng giai đoạn
  const getDetailedContent = () => {
    switch(item.date) {
      case 'Tháng 12/2023':
        return {
          challenges: [
            'Xác định đối tượng người dùng mục tiêu',
            'Nghiên cứu các đối thủ cạnh tranh',
            'Lập kế hoạch tài chính và nguồn lực'
          ],
          achievements: [
            'Hoàn thành khảo sát thị trường',
            'Xây dựng được kế hoạch chi tiết',
            'Thành lập nhóm phát triển'
          ],
          nextSteps: [
            'Bắt đầu thiết kế giao diện',
            'Lựa chọn công nghệ phù hợp',
            'Phân chia công việc cho các thành viên'
          ],
          resources: [
            'Tài liệu phân tích thị trường',
            'Báo cáo khảo sát người dùng',
            'Kế hoạch phát triển chi tiết'
          ]
        };
      case 'Tháng 6/2024':
        return {
          challenges: [
            'Tối ưu hiệu suất ứng dụng',
            'Đảm bảo trải nghiệm người dùng tốt',
            'Xử lý các vấn đề tương thích trình duyệt'
          ],
          achievements: [
            'Hoàn thành 80% giao diện người dùng',
            'Tích hợp thành công các animations',
            'Đạt điểm Lighthouse trên 90'
          ],
          nextSteps: [
            'Hoàn thiện các tính năng còn lại',
            'Testing UI trên nhiều thiết bị',
            'Tối ưu SEO và performance'
          ],
          resources: [
            'Thư viện UI components',
            'Design system',
            'Testing reports'
          ]
        };
      case 'Tháng 12/2024':
        return {
          challenges: [
            'Xử lý bảo mật và authentication',
            'Tối ưu hiệu suất database',
            'Xây dựng API documentation'
          ],
          achievements: [
            'Hoàn thành hệ thống authentication',
            'Triển khai cơ sở dữ liệu',
            'Xây dựng RESTful API'
          ],
          nextSteps: [
            'Testing bảo mật',
            'Tối ưu queries',
            'Viết API documentation'
          ],
          resources: [
            'Security testing tools',
            'Database design documents',
            'API documentation'
          ]
        };
      case '10/2/2025':
        return {
          challenges: [
            'Đảm bảo hệ thống hoạt động ổn định',
            'Xử lý tải cao',
            'Monitoring và logging'
          ],
          achievements: [
            'Triển khai thành công lên production',
            'Hệ thống hoạt động ổn định',
            'Feedback tích cực từ người dùng'
          ],
          nextSteps: [
            'Thu thập feedback người dùng',
            'Phát triển tính năng mới',
            'Mở rộng hệ thống'
          ],
          resources: [
            'Monitoring tools',
            'User feedback reports',
            'System documentation'
          ]
        };
      default:
        return {};
    }
  };

  const detailedContent = getDetailedContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${
          item.status === 'completed' ? 'bg-green-500' :
          item.status === 'in-progress' ? 'bg-blue-500' :
          'bg-gray-500'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-300"
          >
            <FaTimes size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <item.icon className="text-white text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                <FaCalendarAlt size={14} />
                <span>{item.date}</span>
                <span className="mx-2">•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  item.status === 'completed' ? 'bg-green-600' :
                  item.status === 'in-progress' ? 'bg-blue-600' :
                  'bg-gray-600'
                }`}>
                  {item.status === 'completed' ? 'Hoàn thành' :
                   item.status === 'in-progress' ? 'Đang thực hiện' :
                   'Chưa bắt đầu'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">{item.title}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mô tả chung */}
            <div className="col-span-full bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Mô tả chung</h4>
              <p className="text-gray-600">{item.description}</p>
              <div className="mt-4 space-y-2">
                {item.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'completed' ? 'bg-green-400' :
                      item.status === 'in-progress' ? 'bg-blue-400' :
                      'bg-gray-400'
                    }`} />
                    {detail}
                  </div>
                ))}
              </div>
            </div>

            {/* Thách thức */}
            <div className="bg-red-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <FaTools className="text-red-500" />
                Thách thức
              </h4>
              <div className="space-y-2">
                {detailedContent.challenges?.map((challenge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {challenge}
                  </div>
                ))}
              </div>
            </div>

            {/* Thành tựu */}
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Thành tựu
              </h4>
              <div className="space-y-2">
                {detailedContent.achievements?.map((achievement, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {achievement}
                  </div>
                ))}
              </div>
            </div>

            {/* Bước tiếp theo */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
                <FaRocket className="text-blue-500" />
                Bước tiếp theo
              </h4>
              <div className="space-y-2">
                {detailedContent.nextSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Tài nguyên */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-purple-600 mb-3 flex items-center gap-2">
                <FaDatabase className="text-purple-500" />
                Tài nguyên
              </h4>
              <div className="space-y-2">
                {detailedContent.resources?.map((resource, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    {resource}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const About = () => {
  const { theme } = useTheme();
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [hoveredMember, setHoveredMember] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Thêm hàm xử lý share
  const handleShare = (member) => {
    if (navigator.share) {
      navigator.share({
        title: `${member.name} - ${member.role}`,
        text: member.description,
        url: window.location.href
      });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'tet' 
      ? 'bg-gradient-to-br from-red-50 via-yellow-50 to-red-50' 
      : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50'}`}
    >
      <PageBanner 
        theme={theme}
        title="VỀ CHÚNG TÔI" 
        icon={FaInfoCircle}
        breadcrumbText="Về Chúng Tôi"
        subtitle="Đội ngũ phát triển KTT Store"
      />

      <div className="py-16">
        <div className="container mx-auto px-4">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg bg-white shadow-md p-1">
              {['about', 'team', 'school'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300
                    ${activeTab === tab 
                      ? theme === 'tet'
                        ? 'bg-red-500 text-white shadow-lg transform scale-105 hover:scale-110'
                        : 'bg-blue-500 text-white shadow-lg transform scale-105 hover:scale-110'
                      : theme === 'tet'
                        ? 'text-gray-600 hover:text-red-500'
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                >
                  {tab === 'about' && 'Về KTT Store'}
                  {tab === 'team' && 'Đội Ngũ'}
                  {tab === 'school' && 'Trường Học'}
                </button>
              ))}
            </div>
          </div>

          {/* Shop Section */}
          <div className={`transition-all duration-500 ${activeTab === 'about' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className={`text-center max-w-4xl mx-auto mb-20 p-8 rounded-2xl bg-white shadow-xl
              ${theme === 'tet' 
                ? 'border-2 border-red-200 hover:border-red-300' 
                : 'border-2 border-blue-200 hover:border-blue-300'} 
              transition-all duration-300`}
            >
              {/* Logo và tên shop */}
              <div className="mb-12 relative group">
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-300
                  ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'}`}
                ></div>
                <h2 className={`text-5xl font-bold mb-3 transform transition-all duration-500 hover:scale-105
                  ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}
                >
                  {shopInfo.name}
                </h2>
                <p className="text-2xl text-gray-600 italic mb-2">{shopInfo.slogan}</p>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <FaCalendarAlt className={theme === 'tet' ? 'text-red-400' : 'text-blue-400'} />
                  <p className="text-sm">Thành lập {shopInfo.founded}</p>
                  <span className="mx-2">•</span>
                  <FaMapMarkerAlt className={theme === 'tet' ? 'text-red-400' : 'text-blue-400'} />
                  <p className="text-sm">{shopInfo.location}</p>
                </div>
              </div>

              {/* Thống kê */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Khách hàng', value: statistics.customers, icon: FaHeart },
                  { label: 'Sản phẩm', value: statistics.products, icon: FaEye },
                  { label: 'Đơn hàng', value: statistics.orders, icon: FaShare },
                  { label: 'Đánh giá', value: statistics.rating, icon: FaStar }
                ].map((stat, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl shadow-md group hover:shadow-lg transition-all duration-300
                      ${theme === 'tet'
                        ? 'bg-gradient-to-br from-red-50 to-white'
                        : 'bg-gradient-to-br from-blue-50 to-white'}`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className={`text-2xl group-hover:scale-110 transition-transform duration-300
                        ${theme === 'tet' ? 'text-red-500' : 'text-blue-500'}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Giá trị cốt lõi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[shopInfo.mission, shopInfo.vision, shopInfo.values].map((item, index) => (
                  <div 
                    key={item.title}
                    className={`p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
                      ${theme === 'tet'
                        ? 'bg-gradient-to-br from-red-50 to-white'
                        : 'bg-gradient-to-br from-blue-50 to-white'}`}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.5s ease-out ${index * 0.2}s forwards`
                    }}
                  >
                    <h3 className={`text-xl font-semibold mb-3
                      ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                    <ul className="text-left space-y-2">
                      {item.points.map((point, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-center text-gray-700 text-sm transform hover:translate-x-1 transition-transform duration-300"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-2
                            ${theme === 'tet' ? 'bg-red-400' : 'bg-blue-400'}`}
                          ></div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Timeline section */}
              <div className="mb-16">
                <h3 className={`text-2xl font-semibold mb-8 text-center
                  ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}
                >
                  Quá trình phát triển
                </h3>
                <div className="relative">
                  {/* Line */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 hidden md:block
                    ${theme === 'tet' ? 'bg-red-200' : 'bg-blue-200'}`}
                  ></div>

                  {/* Timeline Items */}
                  <div className="space-y-8">
                    {timeline.map((item, index) => (
                      <div 
                        key={item.date}
                        className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'md:flex-row-reverse flex-row'}`}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 0.5s ease-out ${index * 0.2}s forwards`
                        }}
                      >
                        {/* Content */}
                        <div className={`w-full pl-16 md:w-5/12 ${index % 2 === 0 ? 'md:pr-8 md:text-right md:pl-0' : 'md:pl-8 md:text-left'}`}>
                          <div 
                            className={`p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer
                              ${theme === 'tet' ? 'hover:bg-red-50' : 'hover:bg-blue-50'}`}
                            onClick={() => setSelectedTimelineItem(item)}
                          >
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
                              ${item.status === 'completed' 
                                ? theme === 'tet' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                : item.status === 'in-progress' 
                                  ? theme === 'tet' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-600'}`}
                            >
                              <FaClock size={12} />
                              <span>{item.date}</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mt-2">{item.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="absolute left-0 md:static md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center">
                          <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer
                            ${item.status === 'completed'
                              ? theme === 'tet' ? 'bg-red-500' : 'bg-green-500'
                              : item.status === 'in-progress'
                                ? theme === 'tet' ? 'bg-yellow-500' : 'bg-blue-500'
                                : 'bg-gray-500'}`}
                            onClick={() => setSelectedTimelineItem(item)}
                          >
                            <item.icon className="text-white text-lg" />
                          </div>
                        </div>

                        {/* Empty space for opposite side */}
                        <div className="hidden md:block md:w-5/12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tính năng nổi bật */}
              <div className="mb-12">
                <h3 className={`text-2xl font-semibold mb-6
                  ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}
                >
                  Tính năng nổi bật
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {shopInfo.features.map((feature, index) => (
                    <div 
                      key={feature.title}
                      className="group p-4 rounded-lg bg-white shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 0.5s ease-out ${index * 0.15}s forwards`
                      }}
                    >
                      <div className={`h-1 w-20 rounded mb-4 group-hover:w-full transition-all duration-300
                        ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'}`}
                      ></div>
                      <h4 className={`font-semibold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300
                        ${theme === 'tet' ? 'group-hover:text-red-600' : 'group-hover:text-blue-600'}`}
                      >
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Công nghệ sử dụng */}
              <div className="mb-12">
                <h3 className={`text-2xl font-semibold mb-6
                  ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}
                >
                  Công nghệ sử dụng
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {shopInfo.technologies.map((tech, index) => (
                    <span 
                      key={tech}
                      className={`px-4 py-2 rounded-full text-sm font-medium hover:scale-110 cursor-pointer transition-all duration-300
                        ${theme === 'tet'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Thêm Customer Reviews Section trước phần Thông tin liên hệ */}
              <div className="mb-12">
                <h3 className={`text-2xl font-semibold mb-6 text-center
                  ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}
                >
                  Đánh giá từ khách hàng
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customerReviews.map((review, index) => (
                    <div
                      key={review.id}
                      className={`p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300
                        ${theme === 'tet' 
                          ? 'hover:border-red-200 border-2 border-transparent' 
                          : 'hover:border-blue-200 border-2 border-transparent'}`}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 0.5s ease-out ${index * 0.2}s forwards`
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {review.isVerified && (
                            <div className={`absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center
                              ${theme === 'tet' ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                            >
                              <FaCheckCircle size={12} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{review.name}</h4>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < review.rating 
                                  ? theme === 'tet' 
                                    ? 'text-red-500' 
                                    : 'text-blue-500'
                                  : 'text-gray-300'
                                }
                                size={16}
                              />
                            ))}
                          </div>

                          {/* Comment */}
                          <p className="text-gray-600 text-sm mb-3">{review.comment}</p>

                          {/* Purchased Items */}
                          <div className="flex flex-wrap gap-2">
                            {review.purchasedItems.map((item, idx) => (
                              <span
                                key={idx}
                                className={`px-3 py-1 rounded-full text-xs
                                  ${theme === 'tet'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-blue-50 text-blue-600'}`}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className={`rounded-xl p-6
                ${theme === 'tet' ? 'bg-red-50' : 'bg-blue-50'}`}
              >
                <h3 className={`text-2xl font-semibold mb-6
                  ${theme === 'tet' ? 'text-red-600' : 'text-blue-600'}`}
                >
                  Liên hệ với chúng tôi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: FaMapMarkerAlt, value: contactInfo.address },
                    { icon: FaEnvelope, value: contactInfo.email },
                    { icon: FaPhone, value: contactInfo.phone },
                    { icon: FaCalendarAlt, value: contactInfo.workingHours }
                  ].map((contact, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <contact.icon className={theme === 'tet' ? 'text-red-500' : 'text-blue-500'} />
                      <span className="text-sm text-gray-600">{contact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className={`transition-all duration-500 ${activeTab === 'team' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  className={`relative overflow-hidden rounded-2xl bg-white shadow-xl cursor-pointer transform transition-all duration-500
                    ${hoveredMember === member.name ? 'scale-105 shadow-2xl' : 'hover:-translate-y-2 hover:shadow-2xl'}
                  `}
                  onMouseEnter={() => setHoveredMember(member.name)}
                  onMouseLeave={() => setHoveredMember(null)}
                  onClick={() => setSelectedMember(member)}
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${index * 0.2}s forwards`
                  }}
                >
                  {/* Background với hiệu ứng */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${member.color}-50 via-white to-transparent opacity-50 transition-opacity duration-300`} />

                  {/* Nội dung */}
                  <div className="relative p-6">
                    {/* Avatar với hiệu ứng mới */}
                    <div className="w-32 h-32 mx-auto mb-6 relative group">
                      <div className={`absolute inset-0 rounded-full bg-${member.color}-200 animate-pulse`} />
                      <div className="relative z-10 w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Role Icon */}
                      <div className={`absolute -right-2 -bottom-2 w-10 h-10 bg-${member.color}-500 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:rotate-[360deg]`}>
                        <member.icon size={20} />
                      </div>
                    </div>

                    {/* Thông tin */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className={`text-${member.color}-600 font-medium`}>{member.role}</p>
                      
                      {/* Thông tin phụ */}
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaUserGraduate />
                          {member.class}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {member.birthday}
                        </span>
                      </div>

                      {/* Mô tả */}
                      <p className="text-gray-600 text-sm italic">
                        "{member.description}"
                      </p>

                      {/* Kỹ năng */}
                      <div className="flex flex-wrap justify-center gap-2 py-4">
                        {member.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className={`px-3 py-1 rounded-full text-xs bg-${member.color}-100 text-${member.color}-600`}
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 4 && (
                          <span className={`px-3 py-1 rounded-full text-xs bg-${member.color}-100 text-${member.color}-600`}>
                            +{member.skills.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="flex justify-center items-center gap-3">
                        <a
                          href={member.detailedInfo.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-full bg-${member.color}-50 text-${member.color}-500 hover:bg-${member.color}-100 transition-colors duration-300`}
                        >
                          <FaGithub size={18} />
                        </a>
                        <a
                          href={member.detailedInfo.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-full bg-${member.color}-50 text-${member.color}-500 hover:bg-${member.color}-100 transition-colors duration-300`}
                        >
                          <FaLinkedin size={18} />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(member);
                          }}
                          className={`p-2 rounded-full bg-${member.color}-50 text-${member.color}-500 hover:bg-${member.color}-100 transition-colors duration-300`}
                        >
                          <FaShare size={18} />
                        </button>
                      </div>

                      {/* View More Button */}
                      <button
                        className={`mt-4 px-4 py-2 rounded-lg bg-${member.color}-500 text-white text-sm font-medium
                          hover:bg-${member.color}-600 transition-colors duration-300 flex items-center justify-center gap-2 w-full`}
                      >
                        <FaEye size={16} />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* School Section */}
          <div className={`transition-all duration-500 ${activeTab === 'school' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="relative h-64">
                {/* Background Image */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800">
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Logo và Content */}
                <div className="relative h-full flex items-center justify-between p-8">
                  {/* Logo */}
                  <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl transform hover:scale-105 transition-transform duration-300">
                    <img 
                      src="/images/logo_itc.jpeg" 
                      alt="Logo ITC"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 ml-8">
                    <h2 className="text-4xl font-bold text-white mb-2">{schoolInfo.name}</h2>
                    <p className="text-xl text-white/90">{schoolInfo.shortName}</p>
                    <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt />
                        <span>{schoolInfo.address}</span>
                      </div>
                      <a 
                        href={schoolInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        <FaGlobe />
                        <span>Website</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-8">
                {/* Description */}
                <div className="mb-12">
                  <p className="text-gray-600 leading-relaxed">{schoolInfo.description}</p>
                </div>

                {/* Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={achievement.title}
                      className="p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 0.5s ease-out ${index * 0.2}s forwards`
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <achievement.icon size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">{achievement.value}</h4>
                          <p className="text-gray-600">{achievement.title}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {achievement.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            <span className="text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Departments */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-blue-600 mb-6 hover:text-blue-700 transition-colors">
                    Khoa đào tạo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {schoolInfo.departments.map((dept, index) => (
                      <div 
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl 
                        transition-all duration-300 border-2 border-transparent 
                        hover:border-blue-400 group transform hover:-translate-y-1"
                      >
                        <h4 className="text-xl font-semibold mb-3 text-gray-800 
                        group-hover:text-blue-600 transition-colors">{dept.name}</h4>
                        <p className="text-gray-600 mb-4 group-hover:text-gray-700">{dept.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {dept.majors.map((major, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 
                              group-hover:bg-blue-100 group-hover:text-blue-600 transition-all duration-300"
                            >
                              {major}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-blue-600 mb-6 hover:text-blue-700 transition-colors">
                    Cơ sở vật chất
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {schoolInfo.facilities.map((facility, index) => (
                      <div 
                        key={index}
                        className="p-4 rounded-lg bg-white border-2 border-gray-200 
                        hover:border-blue-400 hover:shadow-lg transition-all duration-300 
                        text-center group transform hover:-translate-y-1"
                      >
                        <span className="text-gray-700 font-medium group-hover:text-blue-600 
                        transition-colors">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Links Section */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-blue-600 mb-6 hover:text-blue-700 transition-colors">
                    Liên kết đào tạo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schoolInfo.educationLinks.map((link) => (
                      <div 
                        key={link.name}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl 
                        transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 
                        hover:border-blue-400 border-2 border-transparent group"
                      >
                        {/* Logo */}
                        <div className="h-40 bg-gray-50 flex items-center justify-center p-4 
                        group-hover:bg-blue-50 transition-colors">
                          <img 
                            src={link.logo} 
                            alt={link.name}
                            className="max-h-full max-w-full object-contain transform transition-transform 
                            duration-300 group-hover:scale-110"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2 
                          group-hover:text-blue-600 transition-colors">{link.name}</h4>
                          <p className="text-gray-600 text-sm mb-4 flex-grow 
                          group-hover:text-gray-700">{link.description}</p>
                          <a 
                            href={link.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium 
                            flex items-center gap-1 mt-auto group-hover:gap-2 transition-all"
                          >
                            <span>Trang web</span>
                            <FaExternalLinkAlt className="w-3 h-3 transform group-hover:rotate-45 
                            transition-transform duration-300" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {selectedTimelineItem && (
        <TimelineDetailModal
          item={selectedTimelineItem}
          isOpen={!!selectedTimelineItem}
          onClose={() => setSelectedTimelineItem(null)}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
          border: transparent;
        }
      `}</style>
    </div>
  );
};

export default About;
