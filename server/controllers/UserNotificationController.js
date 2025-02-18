const UserNotification = require('../models/UserNotification');
const Notification = require('../models/Notification');

class UserNotificationController {
    // Lấy tất cả thông báo của user
    async getNotifications(req, res) {
        try {
            const userID = req.user.userID;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filter = req.query.filter || 'all';
            const skip = (page - 1) * limit;

            // Tạo điều kiện lọc
            const matchCondition = { userID };
            if (filter === 'unread') {
                matchCondition.isRead = false;
            } else if (filter === 'read') {
                matchCondition.isRead = true;
            }

            // Sử dụng facet để lấy cả danh sách và tổng số trong 1 query
            const result = await UserNotification.aggregate([
                {
                    $match: matchCondition
                },
                {
                    $facet: {
                        notifications: [
                            {
                                $lookup: {
                                    from: 'notifications',
                                    localField: 'notificationID',
                                    foreignField: 'notificationID',
                                    as: 'notification'
                                }
                            },
                            {
                                $unwind: '$notification'
                            },
                            {
                                $project: {
                                    _id: 1,
                                    userID: 1,
                                    userNotificationID: 1,
                                    isRead: 1,
                                    readAt: 1,
                                    createdAt: 1,
                                    notification: {
                                        notificationID: 1,
                                        title: '$notification.title',
                                        type: '$notification.type',
                                        message: '$notification.message',
                                        scheduledFor: '$notification.scheduledFor',
                                        expiresAt: '$notification.expiresAt',
                                        createdAt: '$notification.createdAt'
                                    }
                                }
                            },
                            {
                                $sort: { createdAt: -1 }
                            },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalCount: [
                            { $count: 'count' }
                        ],
                        unreadCount: [
                            {
                                $match: { isRead: false }
                            },
                            { $count: 'count' }
                        ]
                    }
                }
            ]);

            // Xử lý kết quả để lấy các giá trị cần thiết
            const notifications = result[0].notifications;
            const total = result[0].totalCount[0]?.count || 0;
            const unread = result[0].unreadCount[0]?.count || 0;
            const totalPages = Math.ceil(total / limit);

            res.json({
                message: 'Lấy danh sách thông báo thành công',
                data: {
                    userID,
                    total,
                    unread,
                    notifications,
                    currentPage: page,
                    totalPages,
                    limit
                }
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thông báo:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách thông báo',
                error: error.message
            });
        }
    }

    // Đánh dấu thông báo đã đọc
    async markAsRead(req, res) {
        try {
            const userID = req.user.userID;
            const { userNotificationID } = req.params;

            // Tìm thông báo dựa trên userID và userNotificationID
            const notification = await UserNotification.findOne({
                userID,
                userNotificationID: parseInt(userNotificationID)
            });

            // Kiểm tra nếu không tìm thấy thông báo
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông báo'
                });
            }

            // Kiểm tra nếu thông báo đã được đọc rồi thì không cần cập nhật
            if (notification.isRead) {
                return res.json({
                    success: true,
                    message: 'Thông báo đã được đọc trước đó',
                    notification
                });
            }

            // Cập nhật trạng thái đã đọc và thời gian đọc
            notification.isRead = true;
            notification.readAt = new Date();

            // Cập nhật số lượt đọc trong bảng Notification
            await Notification.updateOne(
                { notificationID: notification.notificationID },
                { 
                    $inc: { readCount: 1 },
                    $set: { lastReadAt: new Date() }
                }
            );

            // Lưu thay đổi
            await notification.save();

            res.json({
                success: true,
                message: 'Đánh dấu thông báo đã đọc thành công',
                notification
            });
        } catch (error) {
            console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi đánh dấu thông báo đã đọc',
                error: error.message
            });
        }
    }

    // Đánh dấu tất cả thông báo đã đọc
    async markAllAsRead(req, res) {
        try {
            const userID = req.user.userID;

            // Lấy danh sách các thông báo chưa đọc của user
            const unreadNotifications = await UserNotification.find({
                userID,
                isRead: false
            });

            // Nếu không có thông báo nào chưa đọc
            if (unreadNotifications.length === 0) {
                return res.json({
                    message: 'Không có thông báo nào cần đánh dấu đã đọc'
                });
            }

            // Cập nhật tất cả thông báo chưa đọc thành đã đọc
            await UserNotification.updateMany(
                { userID, isRead: false },
                { 
                    isRead: true, 
                    readAt: new Date() 
                }
            );

            // Cập nhật readCount trong bảng Notification
            const notificationIDs = unreadNotifications.map(n => n.notificationID);
            await Promise.all(
                notificationIDs.map(notificationID =>
                    Notification.updateOne(
                        { notificationID },
                        { $inc: { readCount: 1 } }
                    )
                )
            );

            res.json({
                success: true,
                message: 'Đánh dấu tất cả thông báo đã đọc thành công',
                count: unreadNotifications.length
            });
        } catch (error) {
            console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi đánh dấu tất cả thông báo đã đọc',
                error: error.message
            });
        }
    }

    // Lấy số lượng thông báo chưa đọc
    async getUnreadCount(req, res) {
        try {
            const userID = req.user.userID;
            const count = await UserNotification.getUnreadCount(userID);

            res.json({
                message: 'Lấy số lượng thông báo chưa đọc thành công',
                count
            });
        } catch (error) {
            console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy số lượng thông báo chưa đọc',
                error: error.message
            });
        }
    }
}

module.exports = new UserNotificationController();
