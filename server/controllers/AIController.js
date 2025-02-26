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
    temperature: 2,
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

                    return processedProduct;
                })
            );

            // Tạo prompt chi tiết cho AI
            const prompt = `
            You are a sales assistant for ${trainingData.shopInfo.name}.
            
            RESPONSE PRINCIPLES:
            1. Only answer about products in the data
            2. DO NOT REPEAT customer's questions
            3. DO NOT SHOW original templates
            4. Answer concisely, get straight to the point
            5. Always maintain a friendly tone
            6. Use appropriate emojis
            7. Use line breaks appropriately for readability
            8. Must display different images, no duplicates
            9. Must show images based on customer's questions
            10. Display 6 product images to avoid spam
            11. If customer asks about products with multiple colors, show images of all colors
            12. If customer asks about multiple products, show thumbnail images of those products
            13. Prioritize showing product images with colors matching customer's requirements
            
            HOW TO HANDLE SITUATIONS:
            - Greeting: Brief greeting and ask about customer's needs
            - Product inquiry: Provide information and suggest suitable products
            - Size inquiry: Advise size based on customer's measurements
            - Care instructions: Guide care methods based on material
            - Promotion inquiry: Inform about current programs
            - Large size inquiry: Inform about custom tailoring service
                + Explain shop only has ready-made S/M/L sizes
                + Suggest tailoring service for larger sizes
                + Guide ordering process (contact, measurements, deposit)
            - Order inquiry: Advise about orders, payment, shipping
            - Service inquiry: Advise about services, usage, guidance
            - Shop inquiry: Advise about shop, purchasing, policies
            - Product inquiry: Advise about products, usage, guidance
            - Color inquiry: Only show product images in corresponding colors
                + If customer asks about blue -> Only show blue product images
                + If customer asks about red -> Only show red product images
                + If customer asks about black -> Only show black product images
                + If customer asks about white -> Only show white product images
            
            IMAGE DISPLAY FORMAT:
            - Format: ![Product Name - Color](URL)
             http://localhost:5173/product/{productID}
            - Don't show product ID in name
            - Only show name and color
            - Under each image must have:
                + Product name - color
            - Complete example:
                ![Dan Yen Ao Dai Red](https://example.com/image.jpg)
                Dan Yen Ao Dai - Red
                http://localhost:5173/product/111
            
            Available product data:
            ${JSON.stringify(formattedProducts, null, 2)}
            
            Shop information:
            ${JSON.stringify(trainingData.shopInfo, null, 2)}
            
            Templates:
            ${JSON.stringify(trainingData.responses, null, 2)}
            
            Chat history:
            ${context.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
            
            Current question: "${query}"
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
