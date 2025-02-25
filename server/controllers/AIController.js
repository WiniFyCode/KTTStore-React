const Product = require("../models/Product");
const Promotion = require("../models/Promotion");
const ProductColor = require("../models/ProductColor");
const ProductSizeStock = require("../models/ProductSizeStock");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const trainingData = require("../data/trainingData");
const { getImageLink } = require('../middlewares/ImagesCloudinary_Controller');

// Khởi tạo Gemini AI với cấu hình mới
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cấu hình generation cho model
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 65536,
};

// Khởi tạo model với cấu hình mới
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp-01-21",
    generationConfig
});

class AIController {
    // Xử lý chat với AI
    async handleChat(req, res) {
        try {
            const { query, context = [] } = req.body;

            // Đảm bảo history luôn bắt đầu với user message và map role đúng
            let chatHistory = [];
            if (context.length > 0) {
                // Nếu message đầu tiên không phải của user, thêm một message rỗng của user
                if (context[0].role !== 'user') {
                    chatHistory.push({
                        role: 'user',
                        parts: [{ text: 'Xin chào' }]
                    });
                }
                
                // Thêm các message từ context và map role assistant thành model
                chatHistory = [
                    ...chatHistory,
                    ...context.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user', // Map assistant thành model
                        parts: [{ text: msg.content }]
                    }))
                ];
            }

            // Khởi tạo chat session với history đã xử lý
            const chat = model.startChat({
                history: chatHistory
            });

            // Lấy dữ liệu sản phẩm với aggregate pipeline
            const products = await Product.aggregate([
                { $match: { isActivated: true } },
                
                // Join với Target
                {
                    $lookup: {
                        from: "targets",
                        localField: "targetID",
                        foreignField: "targetID",
                        as: "targetInfo"
                    }
                },
                { $unwind: { path: "$targetInfo", preserveNullAndEmptyArrays: true } },

                // Join với Category
                {
                    $lookup: {
                        from: "categories",
                        localField: "categoryID",
                        foreignField: "categoryID",
                        as: "categoryInfo"
                    }
                },
                { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },

                // Join với ProductColor và xử lý stock
                {
                    $lookup: {
                        from: "product_colors",
                        let: { productID: "$productID" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$productID", "$$productID"] },
                                    isDelete: { $ne: true }
                                }
                            },
                            // Join với ProductSizeStock
                            {
                                $lookup: {
                                    from: "product_sizes_stocks",
                                    let: { colorID: "$colorID" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ["$colorID", "$$colorID"] }
                                            }
                                        }
                                    ],
                                    as: "sizes"
                                }
                            }
                        ],
                        as: "colors"
                    }
                },

                // Project các trường cần thiết
                {
                    $project: {
                        _id: 1,
                        productID: 1,
                        name: 1,
                        price: { $toString: "$price" },
                        category: "$categoryInfo.name",
                        target: "$targetInfo.name",
                        thumbnail: 1,
                        colors: {
                            $map: {
                                input: "$colors",
                                as: "color",
                                in: {
                                    colorID: "$$color.colorID",
                                    colorName: "$$color.colorName",
                                    images: "$$color.images",
                                    sizes: "$$color.sizes"
                                }
                            }
                        }
                    }
                }
            ]);

            // Xử lý promotions và images
            const activePromotions = await Promotion.find({
                status: 'active',
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            const formattedProducts = await Promise.all(
                products.map(async (product) => {
                    // Xử lý promotion
                    const activePromotion = activePromotions.find(promo => {
                        return promo.products.some(p => p.equals(product._id)) ||
                            promo.categories.includes(product.category);
                    });

                    // Xử lý images
                    const processedColors = await Promise.all(
                        product.colors.map(async color => ({
                            ...color,
                            images: await Promise.all(
                                (color.images || []).map(img => getImageLink(img))
                            )
                        }))
                    );

                    const processedProduct = {
                        ...product,
                        thumbnail: product.thumbnail ? await getImageLink(product.thumbnail) : null,
                        colors: processedColors,
                        promotion: activePromotion ? {
                            name: activePromotion.name,
                            discountPercent: activePromotion.discountPercent
                        } : null
                    };

                    // Log để kiểm tra từng sản phẩm
                    console.log('Processed Product:', {
                        name: processedProduct.name,
                        thumbnail: processedProduct.thumbnail,
                        colorImages: processedProduct.colors.map(c => ({
                            color: c.colorName,
                            images: c.images
                        }))
                    });

                    return processedProduct;
                })
            );

            // Log toàn bộ response trước khi gửi
            console.log('AI Response:', {
                query,
                productsCount: formattedProducts.length,
                sampleProduct: formattedProducts[0]
            });

            // Tạo prompt chi tiết cho AI
            const prompt = `
            Bạn là trợ lý bán hàng của ${trainingData.shopInfo.name}.

            NGUYÊN TẮC TRẢ LỜI:
            1. Chỉ trả lời sản phẩm có trong dữ liệu
            2. KHÔNG ĐƯỢC LẶP LẠI câu hỏi của khách
            3. KHÔNG HIỂN THỊ template gốc
            4. Trả lời ngắn gọn, đi thẳng vào vấn đề
            5. Luôn giữ giọng điệu thân thiện
            6. Sử dụng emojis phù hợp
            7. Xuống dòng 1 cách hợp lý để dễ đọc
            8. Phải hiển thị ảnh khác nhau, không được trùng lặp
            9. Phải đưa ra ảnh dựa theo câu hỏi của khách hàng
            10. Hiển thị 6 ảnh sản phẩm để tránh spam
            11. Nếu mà khách hỏi về sản phẩm có nhiều màu sắc, thì hiển thị ảnh của tất cả các màu sắc
            12. Nếu khách hỏi về nhiều sản phẩm thì hiển thị ảnh thumbnail của các sản phẩm đó

            CÁCH XỬ LÝ TÌNH HUỐNG:
            - Chào hỏi: Chào ngắn gọn và hỏi nhu cầu của khách
            - Hỏi sản phẩm: Trả lời thông tin và đề xuất sản phẩm phù hợp
            - Hỏi size: Tư vấn size dựa vào thông số của khách
            - Hỏi bảo quản: Hướng dẫn cách bảo quản theo chất liệu
            - Hỏi khuyến mãi: Thông báo các chương trình đang có
            - Hỏi size lớn: Thông báo dịch vụ may đo theo yêu cầu
                + Giải thích shop chỉ có sẵn size S/M/L
                + Đề xuất dịch vụ may đo cho size lớn hơn
                + Hướng dẫn cách đặt may (liên hệ, gửi số đo, đặt cọc)
            - Hỏi về đơn hàng: Tư vấn về đơn hàng, cách thanh toán, vận chuyển
            - Hỏi về dịch vụ: Tư vấn về dịch vụ, cách sử dụng, hướng dẫn
            - Hỏi về shop: Tư vấn về shop, cách mua hàng, các chính sách
            - Hỏi về sản phẩm: Tư vấn về sản phẩm, cách sử dụng, hướng dẫn
            - Hỏi về màu sắc: Chỉ hiển thị ảnh sản phẩm có màu sắc tương ứng với yêu cầu
                + Nếu khách hỏi về màu xanh -> Chỉ hiển thị ảnh sản phẩm màu xanh
                + Nếu khách hỏi về màu đỏ -> Chỉ hiển thị ảnh sản phẩm màu đỏ
                + Nếu khách hỏi về màu đen -> Chỉ hiển thị ảnh sản phẩm màu đen
                + Nếu khách hỏi về màu trắng -> Chỉ hiển thị ảnh sản phẩm màu trắng

            CÁCH HIỂN THỊ ẢNH:
            - Format: ![Ảnh sản phẩm](URL)
            - Ví dụ: ![Áo dài Đan Yên màu đỏ](https://example.com/image.jpg)
            - Không hiển thị ID sản phẩm
            - Chỉ hiển thị tên và màu sắc
            - Dưới mỗi ảnh là để tên sản phẩm - màu sắc
            - Ghi chú: Ảnh của sản phẩm chính - Ảnh của sản phẩm gợi ý

            Dữ liệu sản phẩm hiện có:
            ${JSON.stringify(formattedProducts, null, 2)}

            Thông tin shop:
            ${JSON.stringify(trainingData.shopInfo, null, 2)}

            Templates:
            ${JSON.stringify(trainingData.responses, null, 2)}

            Lịch sử chat:
            ${context.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

            Câu hỏi hiện tại: "${query}"
            `;

            // Gửi message và nhận response
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();

            return res.json({
                success: true,
                response: text
            });
            

        } catch (error) {
            console.error('Lỗi khi xử lý AI chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi xử lý chat',
                error: error.message
            });
        }
    }
}

module.exports = new AIController();
