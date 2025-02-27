const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Cart = require('../models/Cart');
const ProductSizeStock = require('../models/ProductSizeStock');
const Coupon = require('../models/Coupon');
const UserCoupon = require('../models/UserCoupon');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Promotion = require('../models/Promotion');
const ProductColor = require('../models/ProductColor');
const { getImageLink } = require('../middlewares/ImagesCloudinary_Controller');
const nodemailer = require('nodemailer');

class OrderController {
    // Lấy danh sách đơn hàng của user
    async getOrders(req, res) {
        try {
            const userID = req.user.userID;
            const { page = 1, limit = 12, status } = req.query;

            // Tạo filter dựa trên status nếu có
            const filter = { userID };
            if (status) {
                filter.orderStatus = status;
            }

            // Lấy danh sách đơn hàng với phân trang
            const orders = await Order.find(filter)
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('orderDetails');

            // Đếm tổng số đơn hàng
            const total = await Order.countDocuments(filter);

            res.json({
                orders,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng',
                error: error.message
            });
        }
    }

    // Lấy chi tiết đơn hàng
    async getOrderById(req, res) {
        try {
            const userID = req.user.userID;
            const { id } = req.params;

            // Lấy order và order details
            const order = await Order.findOne({ orderID: id, userID });
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            // Lấy chi tiết đơn hàng
            const orderDetails = await OrderDetail.find({ orderID: id });

            // Biến để tính tổng giá sản phẩm
            let totalProductPrice = 0;

            // Lấy thông tin sản phẩm cho từng SKU
            const detailsWithProducts = await Promise.all(
                orderDetails.map(async (detail) => {
                    const stockItem = await ProductSizeStock.findOne({ SKU: detail.SKU });
                    if (!stockItem) return null;

                    // Parse SKU để lấy productID và colorID
                    const [productID, colorID] = stockItem.SKU.split('_');

                    // Lấy thông tin sản phẩm và màu sắc
                    const [product, color] = await Promise.all([
                        Product.findOne({ productID: Number(productID) }),
                        ProductColor.findOne({
                            productID: Number(productID),
                            colorID: Number(colorID)
                        })
                    ]);

                    // Chuyển đổi giá từ chuỗi "623.000" thành số 623000
                    const priceAsNumber = product ? Number(product.price.replace(/\./g, '')) : 0;

                    // Chỉ lấy các thuộc tính cần thiết
                    const productInfo = product ? {
                        productID: product.productID,
                        name: product.name,
                        price: priceAsNumber, // Sử dụng giá đã chuyển đổi
                        colorName: color ? color.colorName : null,
                        image: color && color.images && color.images.length > 0 ? color.images[0] : null
                    } : null;

                    // Cộng dồn vào tổng giá sản phẩm
                    if (productInfo) {
                        totalProductPrice += productInfo.price * detail.quantity;
                    }

                    return {
                        orderDetailID: detail.orderDetailID,
                        quantity: detail.quantity,
                        SKU: detail.SKU,
                        size: stockItem.size,
                        stock: stockItem.stock,
                        product: productInfo
                    };
                })
            );

            // Lọc bỏ các null values nếu có
            const validDetails = detailsWithProducts.filter(detail => detail !== null);

            res.json({
                ...order.toObject(),
                totalProductPrice, // Thêm totalProductPrice ở cấp cao nhất
                orderDetails: validDetails
            });
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy chi tiết đơn hàng',
                error: error.message
            });
        }
    }

    // Xử lý mã giảm giá
    static async validateAndApplyCoupon(userID, userCouponsID, totalPrice, items) {
        if (!userCouponsID) return { finalPaymentPrice: totalPrice, appliedCoupon: null };

        const userCoupon = await UserCoupon.findOne({
            userCouponsID,
            userID,
            status: 'active',
            isExpired: false,
            usageLeft: { $gt: 0 }
        }).populate('couponInfo');

        if (!userCoupon) {
            throw new Error('Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng');
        }

        const coupon = userCoupon.couponInfo;
        const now = new Date();

        // Kiểm tra các điều kiện của coupon
        if (!coupon.isActive) {
            throw new Error('Mã giảm giá không còn hoạt động');
        }

        if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
            throw new Error('Mã giảm giá không trong thời gian sử dụng');
        }

        if (now > new Date(userCoupon.expiryDate)) {
            throw new Error('Mã giảm giá đã hết hạn');
        }

        // Log thông tin coupon
        console.log('Coupon info:', {
            couponID: coupon.couponID,
            appliedCategories: coupon.appliedCategories
        });

        // Tính tổng số lượng và giá trị các sản phẩm được áp dụng
        let applicableTotal = 0;
        let totalQuantity = 0;
        let nonApplicableTotal = 0;  // Thêm biến này để tính tổng tiền sản phẩm không được áp dụng

        // Lấy danh sách categoryID của các sản phẩm
        const productPromises = items.map(async item => {
            const productID = parseInt(item.SKU.split('_')[0]);
            const product = await Product.findOne({ productID });

            console.log('Tìm thấy product:', {
                SKU: item.SKU,
                productID,
                product: product ? {
                    categoryID: product.categoryID,
                    name: product.name
                } : null
            });

            if (!product) {
                console.log(`Sản phẩm này không tìm thấy SKU: ${item.SKU}`);
                return null;
            }

            const categoryID = typeof product.categoryID === 'string'
                ? parseInt(product.categoryID)
                : product.categoryID;

            return {
                ...item,
                categoryID,
                subtotal: item.price * item.quantity
            };
        });

        const itemsWithCategory = (await Promise.all(productPromises))
            .filter(item => item !== null);

        console.log('Những item có trong cat:', itemsWithCategory);

        const appliedCategories = coupon.appliedCategories.map(cat =>
            typeof cat === 'string' ? parseInt(cat) : cat
        );

        itemsWithCategory.forEach(item => {
            console.log('Kiểm tra :', {
                SKU: item.SKU,
                categoryID: item.categoryID,
                isIncluded: appliedCategories.includes(item.categoryID),
                subtotal: item.subtotal
            });

            if (appliedCategories.includes(item.categoryID)) {
                applicableTotal += item.subtotal;
                totalQuantity += item.quantity;
                console.log('Đã thêm vào tổng giá trị được áp dụng:', {
                    currentTotal: applicableTotal,
                    currentQuantity: totalQuantity
                });
            } else {
                nonApplicableTotal += item.subtotal;
                console.log('Đã thêm vào tổng giá trị không được áp dụng:', {
                    currentNonApplicableTotal: nonApplicableTotal
                });
            }
        });

        console.log('Final calculation:', {
            applicableTotal,
            nonApplicableTotal,
            totalQuantity,
            minOrderValue: coupon.minOrderValue,
            minimumQuantity: coupon.minimumQuantity
        });

        // Kiểm tra điều kiện áp dụng
        if (applicableTotal === 0) {
            throw new Error('Không có sản phẩm nào trong đơn hàng thuộc danh mục được áp dụng mã giảm giá này');
        }

        if (applicableTotal < coupon.minOrderValue) {
            throw new Error(`Tổng giá trị các sản phẩm được áp dụng cần tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã giảm giá này`);
        }

        if (totalQuantity < coupon.minimumQuantity) {
            throw new Error(`Cần tối thiểu ${coupon.minimumQuantity} sản phẩm thuộc danh mục áp dụng để sử dụng mã giảm giá này`);
        }

        // Tính giảm giá chỉ trên những sản phẩm được áp dụng
        let discountAmount;
        if (coupon.discountType === 'percentage') {
            discountAmount = (applicableTotal * coupon.discountValue) / 100;
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        } else { // fixed
            discountAmount = Math.min(coupon.discountValue, applicableTotal);
        }

        // Tính giá cuối cùng: tổng tiền các sản phẩm không được giảm + (tổng tiền các sản phẩm được giảm - số tiền giảm)
        const finalPaymentPrice = nonApplicableTotal + (applicableTotal - discountAmount);

        // Cập nhật usageLeft của UserCoupon và usedCount của Coupon
        await Promise.all([
            UserCoupon.updateOne(
                { userCouponsID },
                {
                    $inc: { usageLeft: -1 },
                    $set: {
                        status: await UserCoupon.findOne({ userCouponsID }).then(uc => 
                            uc.usageLeft <= 1 ? 'used' : 'active'
                        )
                    }
                }
            ),
            // Cập nhật usedCount của Coupon và kiểm tra totalUsageLimit
            Coupon.findOneAndUpdate(
                { couponID: coupon.couponID },
                [
                    {
                        $set: {
                            usedCount: { $add: ['$usedCount', 1] },
                            isActive: {
                                $cond: {
                                    if: { $gte: [{ $add: ['$usedCount', 1] }, '$totalUsageLimit'] },
                                    then: false,
                                    else: '$isActive'
                                }
                            }
                        }
                    }
                ],
                { new: true }
            )
        ]);

        return {
            finalPaymentPrice,
            appliedCoupon: userCoupon,
            discountAmount,
            applicableTotal,
            nonApplicableTotal
        };
    }

    // Tạo đơn hàng mới từ giỏ hàng
    async createOrder(req, res) {
        try {
            const userID = req.user.userID;
            const {
                fullname,
                phone,
                email,
                address,
                note,
                paymentMethod,
                items,
                userCouponsID
            } = req.body;

            // Validate required fields
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: 'Vui lòng chọn sản phẩm để thanh toán' });
            }

            // Kiểm tra tồn kho và lấy giá sản phẩm
            let totalPrice = 0;
            const itemsWithPrice = [];

            for (const item of items) {
                const [productID] = item.SKU.split('_');
                const stockItem = await ProductSizeStock.findOne({ SKU: item.SKU });

                if (!stockItem) {
                    return res.status(404).json({
                        message: `Sản phẩm với SKU ${item.SKU} không tồn tại`
                    });
                }

                if (stockItem.stock < item.quantity) {
                    const product = await Product.findOne({ productID: Number(productID) });
                    return res.status(400).json({
                        message: `Sản phẩm ${product ? product.name : item.SKU} không đủ số lượng`
                    });
                }

                // Lấy thông tin sản phẩm và category
                const product = await Product.findOne({ productID: Number(productID) });

                if (!product) {
                    console.log('Lỗi: Không tìm thấy thông tin sản phẩm cho SKU', item.SKU);
                    return res.status(404).json({
                        message: `Không tìm thấy thông tin sản phẩm với SKU ${item.SKU}`
                    });
                }

                // Bước 2: Sử dụng categoryID để lấy category name
                const category = await Category.findOne({ categoryID: product.categoryID });

                if (!category) {
                    console.log('Lỗi: Không tìm thấy thông tin danh mục cho categoryID', product.categoryID);
                    return res.status(404).json({
                        message: `Không tìm thấy thông tin danh mục của sản phẩm`
                    });
                }

                // Bước 3: Kiểm tra khuyến mãi với category name
                console.log('Bắt đầu kiểm tra khuyến mãi cho SKU:', item.SKU);
                const promotion = await Promotion.findOne({
                    $or: [
                        { products: product._id },
                        { categories: category.name }, // Sử dụng category.name
                        { SKUs: item.SKU }
                    ],
                    startDate: { $lte: new Date() },
                    endDate: { $gte: new Date() },
                    status: 'active'
                }).sort({ discountPercent: -1 });

                console.log('Kết quả tìm khuyến mãi:', {
                    SKU: item.SKU,
                    productID: Number(productID),
                    categoryID: product.categoryID,
                    categoryName: category.name,
                    foundPromotion: promotion ? {
                        _id: promotion._id,
                        name: promotion.name,
                        discountPercent: promotion.discountPercent,
                        startDate: promotion.startDate,
                        endDate: promotion.endDate,
                        products: promotion.products,
                        categories: promotion.categories,
                        SKUs: promotion.SKUs
                    } : 'Không tìm thấy khuyến mãi'
                });

                // Tính giá sau khuyến mãi
                const basePrice = parseInt(product.price.replace(/\./g, '')); // Xóa dấu chấm trước khi parse
                let finalPrice = basePrice;

                console.log('Thông tin giá gốc:', {
                    SKU: item.SKU,
                    productName: product.name,
                    basePrice: basePrice, // 623000
                    originalPrice: product.price // '623.000' - giá gốc từ DB
                });

                if (promotion) {
                    // Tính toán giá sau khuyến mãi
                    finalPrice = Math.round(basePrice * (1 - promotion.discountPercent / 100));
                    console.log('Chi tiết tính giá khuyến mãi:', {
                        SKU: item.SKU,
                        basePrice: basePrice, // 623000
                        discountPercent: promotion.discountPercent, // 30
                        calculation: `${basePrice} * (1 - ${promotion.discountPercent}/100)`,
                        finalPrice: finalPrice, // 436100
                        totalDiscount: basePrice - finalPrice // 186900
                    });
                } else {
                    console.log('Không có khuyến mãi áp dụng, giữ nguyên giá gốc');
                }

                const itemTotal = finalPrice * item.quantity;
                totalPrice += itemTotal;

                console.log('Tổng tiền cho sản phẩm:', {
                    SKU: item.SKU,
                    quantity: item.quantity,
                    pricePerUnit: finalPrice, // 436100
                    itemTotal: itemTotal // 436100 * quantity
                });

                itemsWithPrice.push({
                    ...item,
                    price: finalPrice,
                    originalPrice: basePrice,
                    promotion: promotion ? {
                        discountPercent: promotion.discountPercent,
                        endDate: promotion.endDate
                    } : null
                });
            }

            console.log('Tổng giá trị đơn hàng trước khi áp dụng mã giảm giá:', totalPrice);
            let finalPaymentPrice = totalPrice;

            // Xử lý mã giảm giá
            if (userCouponsID) {
                try {
                    const discountResult = await OrderController.validateAndApplyCoupon(
                        userID,
                        userCouponsID,
                        totalPrice,
                        itemsWithPrice
                    );
                    finalPaymentPrice = discountResult.finalPaymentPrice;
                } catch (error) {
                    return res.status(400).json({ message: error.message });
                }
            }

            // Validate finalPaymentPrice
            if (finalPaymentPrice < 0) {
                return res.status(400).json({
                    message: 'Giá thanh toán không thể âm'
                });
            }


            // Tạo đơn hàng mới với orderID tự tăng an toàn
            const lastOrder = await Order.findOne().sort({ orderID: -1 });
            const orderID = lastOrder ? lastOrder.orderID + 1 : 1;

            const order = new Order({
                orderID,
                userID,
                fullname,
                phone,
                email,
                address,
                note,
                paymentMethod: paymentMethod,
                totalPrice,
                paymentPrice: finalPaymentPrice,
                userCouponsID,
                orderStatus: 'pending',
                shippingStatus: 'preparing',
                isPayed: paymentMethod === 'banking',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Nếu là thanh toán banking, cập nhật trạng thái
            if (paymentMethod === 'banking') {
                order.orderStatus = 'processing';
                order.isPayed = true;
            }

            // Nếu là thanh toán banking, cập nhật trạng thái
            if (paymentMethod === 'cod') {
                order.orderStatus = 'pending';
                order.isPayed = false;
            }

            await order.save();

            // Log thông tin đơn hàng
            console.log('Đơn hàng mới được tạo:', {
                orderID: order.orderID,
                orderStatus: order.orderStatus,
                paymentMethod: order.paymentMethod
            });

            // Tạo chi tiết đơn hàng
            try {
                // Lấy orderDetailID cuối cùng
                const lastOrderDetail = await OrderDetail.findOne().sort({ orderDetailID: -1 });
                let nextOrderDetailID = lastOrderDetail ? lastOrderDetail.orderDetailID + 1 : 1;

                // Tạo danh sách chi tiết đơn hàng với giá đã tính
                const orderDetails = itemsWithPrice.map(item => ({
                    orderDetailID: nextOrderDetailID++,
                    orderID,
                    SKU: item.SKU,
                    quantity: item.quantity,
                    price: item.price,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));

                // Lưu chi tiết đơn hàng
                await OrderDetail.insertMany(orderDetails);

                // Cập nhật số lượng tồn kho
                for (const item of items) {
                    await ProductSizeStock.updateOne(
                        { SKU: item.SKU },
                        { $inc: { stock: -item.quantity } }
                    );
                }

                // Xóa các sản phẩm đã đặt khỏi giỏ hàng
                const skuList = items.map(item => item.SKU);
                await Cart.deleteMany({
                    userID: userID,
                    SKU: { $in: skuList }
                });

                res.status(201).json({
                    message: 'Tạo đơn hàng thành công',
                    order
                });

            } catch (error) {
                console.error('Lỗi khi tạo đơn hàng:', error);
                // Xóa đơn hàng nếu tạo chi tiết thất bại
                await Order.deleteOne({ orderID });
                res.status(500).json({
                    message: 'Có lỗi xảy ra khi tạo chi tiết đơn hàng',
                    error: error.message
                });
            }
        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error.message);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi tạo đơn hàng',
                error: error.message
            });
        }
    }

    // Hủy đơn hàng
    async cancelOrder(req, res) {
        try {
            const userID = req.user.userID;
            const { id } = req.params;

            const order = await Order.findOne({ orderID: id, userID });
            if (!order) {
                return res.status(404).json({
                    message: 'Không tìm thấy đơn hàng'
                });
            }

            // Kiểm tra trạng thái đơn hàng
            if (!['pending', 'confirmed'].includes(order.orderStatus)) {
                return res.status(400).json({
                    message: 'Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý hoặc đã xác nhận'
                });
            }

            // Hoàn lại số lượng tồn kho
            const orderDetails = await OrderDetail.find({ orderID: id });
            await Promise.all(orderDetails.map(detail =>
                ProductSizeStock.updateOne(
                    { SKU: detail.SKU },
                    { $inc: { stock: detail.quantity } }
                )
            ));

            // Hoàn lại mã giảm giá nếu có
            if (order.userCouponsID) {
                await UserCoupon.updateOne(
                    {
                        userCouponsID: order.userCouponsID,
                        userID
                    },
                    {
                        isUsed: false,
                        usedAt: null,
                        usageLeft: usageLeft + 1
                    }
                );
            }

            // Cập nhật trạng thái đơn hàng
            order.orderStatus = 'cancelled';
            order.cancelledAt = new Date();
            await order.save();

            res.json({
                message: 'Hủy đơn hàng thành công',
                order: {
                    ...order.toObject(),
                    totalPrice: order.totalPrice,
                    paymentPrice: order.paymentPrice
                }
            });
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi hủy đơn hàng',
                error: error.message
            });
        }
    }


    // ADMIN: Lấy tất cả đơn hàng
    async getAllOrders(req, res) {
        try {
            const { page = 1, limit = 10, status, search } = req.query;

            // Tạo filter dựa trên status và search nếu có
            const filter = {};
            if (status) {
                filter.orderStatus = status;
            }
            if (search) {
                filter.$or = [
                    { fullname: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } }
                ];
            }

            // Lấy danh sách đơn hàng với phân trang
            const orders = await Order.find(filter)
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('orderDetails')
                .populate('userInfo', 'username email');

            // Đếm tổng số đơn hàng
            const total = await Order.countDocuments(filter);

            res.json({
                orders,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng',
                error: error.message
            });
        }
    }

    // ADMIN: Lấy tất cả đơn hàng
    async getAllOrdersChoADMIN(req, res) {
        try {
            // Lấy tất cả đơn hàng
            const orders = await Order.find()
                .select('orderID userID fullname phone address totalPrice userCouponsID paymentPrice orderStatus shippingStatus isPayed createdAt updatedAt')
                .lean();


            // Tính toán thống kê
            const stats = {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, order) => sum + order.paymentPrice, 0),
                totalPaidOrders: orders.filter(order => order.isPayed).length,
                totalUnpaidOrders: orders.filter(order => !order.isPayed).length,
            };

            res.json({
                orders,
                stats
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng',
                error: error.message
            });
        }
    }

    //!Toàn thêm
    // ADMIN: Cập nhật trạng thái đơn hàng
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { orderStatus, shippingStatus, isPayed } = req.body;

            // Kiểm tra đơn hàng tồn tại
            let order = await Order.findOne({ orderID: id });
            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            // Danh sách trạng thái hợp lệ
            const validOrderStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'];
            const validShippingStatuses = ['preparing', 'shipping', 'delivered', 'returned', 'cancelled'];

            // Kiểm tra và cập nhật orderStatus
            if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
                return res.status(400).json({
                    message: 'Trạng thái đơn hàng không hợp lệ',
                    validStatuses: validOrderStatuses
                });
            }

            // Cập nhật trực tiếp bằng findOneAndUpdate
            const updateData = {};
            if (orderStatus) updateData.orderStatus = orderStatus;
            if (shippingStatus) updateData.shippingStatus = shippingStatus;
            if (typeof isPayed === 'boolean') updateData.isPayed = isPayed;

            const updatedOrder = await Order.findOneAndUpdate(
                { orderID: id },
                { $set: updateData },
                { new: true }
            );

            console.log('Cập nhật đơn hàng:', {
                orderID: id,
                orderStatus: updatedOrder.orderStatus, 
                shippingStatus: updatedOrder.shippingStatus,
                isPayed: updatedOrder.isPayed,
            });

            res.json({
                message: 'Cập nhật trạng thái đơn hàng thành công',
                order: updatedOrder // Trả về order đã cập nhật
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng',
                error: error.message
            });
        }
    }

    // ADMIN: Xoá đơn hàng
    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            await Order.deleteOne({ orderID: id });
            res.json({ message: 'Xoá đơn hàng thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Có lỗi xảy ra khi xoá đơn hàng', error: error.message });
        }
    }

    // Xác nhận thanh toán
    async confirmPayment(req, res) {
        try {
            const { orderID } = req.params;
            const order = await Order.findOne({ orderID });

            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            console.log('Order data in confirmPayment:', {
                orderID: order.orderID,
                note: order.note,
                orderData: order.toObject()
            });

            // Chỉ cập nhật isPayed = true nếu là thanh toán banking
            if (order.paymentMethod === 'banking') {
                order.isPayed = true;
                order.orderStatus = 'processing';
                await order.save();
            }

            // Lấy chi tiết đơn hàng và thông tin sản phẩm
            const orderDetails = await OrderDetail.find({ orderID });
            const detailsWithProducts = await Promise.all(
                orderDetails.map(async (detail) => {
                    const stockItem = await ProductSizeStock.findOne({ SKU: detail.SKU });
                    if (!stockItem) return null;

                    const [productID, colorID] = stockItem.SKU.split('_');
                    const [product, color] = await Promise.all([
                        Product.findOne({ productID: Number(productID) }),
                        ProductColor.findOne({
                            productID: Number(productID),
                            colorID: Number(colorID)
                        })
                    ]);

                    return {
                        orderDetailID: detail.orderDetailID,
                        quantity: detail.quantity,
                        SKU: detail.SKU,
                        size: stockItem.size,
                        stock: stockItem.stock,
                        product: {
                            productID: product.productID,
                            name: product.name,
                            price: Number(product.price),
                            colorName: color ? color.colorName : null,
                            image: color && color.images && color.images.length > 0 ? color.images[0] : null
                        }
                    };
                })
            );

            const orderData = {
                ...order.toObject(),
                orderDetails: detailsWithProducts.filter(detail => detail !== null)
            };

            console.log('Order data after processing:', {
                orderID: orderData.orderID,
                note: orderData.note,
                originalNote: order.note
            });

            // Lấy email của người dùng từ order
            const userEmail = order.email || req.user.email;

            // Tạo transporter với thông tin email gửi đi
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            // Format danh sách sản phẩm
            const productList = orderData.orderDetails.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <img src="${item.product.image}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover;">
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        ${item.product.name}<br>
                        <small>Màu: ${item.product.colorName}, Size: ${item.size}</small>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${(item.product.price * 1000).toLocaleString('vi-VN')}đ</td>
                </tr>
            `).join('');

            // Tạo nội dung email cho khách hàng
            const customerEmailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50; text-align: center;">
                        ${order.paymentMethod === 'banking' 
                            ? 'Xác Nhận Thanh Toán Thành Công' 
                            : 'Xác Nhận Đơn Hàng Thành Công'}
                    </h2>
                    <p>Xin chào quý khách,</p>
                    <p>
                        ${order.paymentMethod === 'banking'
                            ? `Chúng tôi xin thông báo đơn hàng <strong>#${orderData.orderID}</strong> của quý khách đã được thanh toán thành công.`
                            : `Cảm ơn quý khách đã đặt hàng. Đơn hàng <strong>#${orderData.orderID}</strong> của quý khách sẽ được thanh toán khi nhận hàng (COD).`
                        }
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333;">Chi tiết đơn hàng:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f5f5f5;">
                                    <th style="padding: 10px; text-align: left;">Hình ảnh</th>
                                    <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                                    <th style="padding: 10px; text-align: center;">Số lượng</th>
                                    <th style="padding: 10px; text-align: right;">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productList}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tổng tiền:</strong></td>
                                    <td style="padding: 10px; text-align: right;"><strong>${(orderData.totalPrice).toLocaleString('vi-VN')}đ</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Thành tiền:</strong></td>
                                    <td style="padding: 10px; text-align: right; color: #e53e3e;"><strong>${(orderData.paymentPrice).toLocaleString('vi-VN')}đ</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333;">Thông tin giao hàng:</h3>
                        <p><strong>Người nhận:</strong> ${orderData.fullname}</p>
                        <p><strong>Địa chỉ:</strong> ${orderData.address}</p>
                        <p><strong>Số điện thoại:</strong> ${orderData.phone}</p>
                        <p><strong>Ghi chú:</strong> ${order.note || 'Không có'}</p>
                        <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}</p>
                    </div>

                    <p style="text-align: center; color: #666;">Cảm ơn quý khách đã tin tưởng và mua sắm tại cửa hàng chúng tôi!</p>
                    <p style="text-align: center; color: #666;">Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
                </div>
            `;

            // Tạo nội dung email cho admin
            const adminEmailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50; text-align: center;">
                        ${order.paymentMethod === 'banking' 
                            ? '[Admin] Đơn hàng mới - Đã thanh toán' 
                            : '[Admin] Đơn hàng mới - Thanh toán COD'}
                    </h2>
                    <p>Xin chào Admin,</p>
                    <p>
                        ${order.paymentMethod === 'banking'
                            ? `Đơn hàng <strong>#${orderData.orderID}</strong> vừa được thanh toán thành công qua banking.`
                            : `Có đơn hàng mới <strong>#${orderData.orderID}</strong> thanh toán qua COD.`
                        }
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333;">Chi tiết đơn hàng:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f5f5f5;">
                                    <th style="padding: 10px; text-align: left;">Hình ảnh</th>
                                    <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                                    <th style="padding: 10px; text-align: center;">Số lượng</th>
                                    <th style="padding: 10px; text-align: right;">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productList}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tổng tiền:</strong></td>
                                    <td style="padding: 10px; text-align: right;"><strong>${(orderData.totalPrice).toLocaleString('vi-VN')}đ</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Thành tiền:</strong></td>
                                    <td style="padding: 10px; text-align: right; color: #e53e3e;"><strong>${(orderData.paymentPrice).toLocaleString('vi-VN')}đ</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333;">Thông tin khách hàng:</h3>
                        <p><strong>Họ tên:</strong> ${orderData.fullname}</p>
                        <p><strong>Email:</strong> ${userEmail}</p>
                        <p><strong>Số điện thoại:</strong> ${orderData.phone}</p>
                        <p><strong>Địa chỉ:</strong> ${orderData.address}</p>
                        <p><strong>Ghi chú:</strong> ${order.note || 'Không có'}</p>
                        <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}</p>
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <a href="${process.env.ADMIN_URL}/orders/${orderData.orderID}" 
                           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            Xem Chi Tiết Đơn Hàng
                        </a>
                    </div>
                </div>
            `;

            // Gửi email cho khách hàng
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: `${order.paymentMethod === 'banking' 
                    ? 'Xác nhận thanh toán thành công' 
                    : 'Xác nhận đơn hàng thành công'} - Đơn hàng #${orderData.orderID}`,
                html: customerEmailContent
            });

            // Gửi email cho admin
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_ADMIN,
                subject: `${order.paymentMethod === 'banking' 
                    ? '[Admin] Đơn hàng mới #' + orderData.orderID + ' - Đã thanh toán'
                    : '[Admin] Đơn hàng mới #' + orderData.orderID + ' - Thanh toán COD'}`,
                html: adminEmailContent
            });

            res.json({
                message: 'Xác nhận thanh toán thành công',
                order
            });
        } catch (error) {
            console.error('Lỗi trong quá trình thanh toán:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xác nhận thanh toán',
                error: error.message
            });
        }
    }
}

module.exports = new OrderController();
