const Notification = require('../models/Notification');
const UserNotification = require('../models/UserNotification');
const User = require('../models/User');

class NotificationController {

    //!ADMIN - Lấy tất cả thông báo cho admin
    async getNotficationChoADMIN(req, res) {
        try {
            // Lấy tất cả thông báo không cần lọc
            const notifications = await Notification.find()
                .select('_id notificationID title type message readCount scheduledFor expiresAt createdAt createdBy')
                .lean();

            // Tính toán thống kê
            const stats = {
                totalNotifications: notifications.length,
                totalPendingNotifications: notifications.filter(n => n.scheduledFor > new Date()).length,
                totalExpiredNotifications: notifications.filter(n => n.expiresAt < new Date()).length,
                totalActiveNotifications: notifications.filter(n => n.scheduledFor <= new Date() && n.expiresAt >= new Date()).length
            };

            res.json({
                notifications,
                stats
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách thông báo',
                error: error.message
            });
        }
    }

    //!ADMIN - Tạo thông báo
    async createNotification(req, res) {
        try {
            const adminID = req.user.userID;
            const { title, type, message, scheduledFor, expiresAt, userIDs = [] } = req.body;

            // Validate userIDs nếu được cung cấp
            if (userIDs.length > 0) {
                const existingUsers = await User.find({ userID: { $in: userIDs } });
                if (existingUsers.length !== userIDs.length) {
                    return res.status(400).json({ 
                        message: 'Một số userID không tồn tại trong hệ thống',
                        validUserIDs: existingUsers.map(u => u.userID)
                    });
                }
            }

            // Tạo notification mới
            const lastNotification = await Notification.findOne().sort({ notificationID: -1 });
            const notificationID = lastNotification ? lastNotification.notificationID + 1 : 1;

            const newNotification = new Notification({
                notificationID,
                title,
                type,
                message,
                scheduledFor: new Date(scheduledFor),
                expiresAt: new Date(expiresAt),
                createdBy: adminID,
                readCount: 0
            });

            await newNotification.save();

            // Tạo user_notifications
            const lastUserNotification = await UserNotification.findOne().sort({ userNotificationID: -1 });
            let nextUserNotificationID = lastUserNotification ? lastUserNotification.userNotificationID + 1 : 1;

            let targetUsers;
            if (userIDs.length > 0) {
                // Nếu có userIDs, chỉ tạo cho những user được chỉ định
                targetUsers = userIDs;
            } else {
                // Nếu không có userIDs, tạo cho tất cả users
                const allUsers = await User.find({}, { userID: 1 });
                targetUsers = allUsers.map(user => user.userID);
            }

            const userNotifications = targetUsers.map(userID => ({
                userNotificationID: nextUserNotificationID++,
                notificationID,
                userID,
                isRead: false
            }));

            await UserNotification.insertMany(userNotifications);

            res.status(201).json({
                message: 'Tạo thông báo thành công',
                notification: newNotification,
                targetUserCount: targetUsers.length
            });

        } catch (error) {
            console.error('Lỗi khi tạo thông báo:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi tạo thông báo',
                error: error.message
            });
        }
    }

    //!ADMIN - Cập nhật thông báo
    async updateNotification(req, res) {
        try {
            const { id } = req.params;
            const { title, type, message, scheduledFor, expiresAt } = req.body;

            const notification = await Notification.findOne({ notificationID: id });
            if (!notification) {
                return res.status(404).json({ message: 'Không tìm thấy thông báo' });
            }

            // Chỉ cho phép cập nhật thông báo chưa gửi
            if (!notification.isPending) {
                return res.status(400).json({ message: 'Không thể cập nhật thông báo đã gửi' });
            }

            // Cập nhật thông tin
            if (title) notification.title = title;
            if (type) notification.type = type;
            if (message) notification.message = message;
            if (scheduledFor) notification.scheduledFor = new Date(scheduledFor);
            if (expiresAt) notification.expiresAt = new Date(expiresAt);

            await notification.save();

            res.json({
                message: 'Cập nhật thông báo thành công'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật thông báo',
                error: error.message
            });
        }
    }

    //!ADMIN - Xóa thông báo
    async deleteNotification(req, res) {
        try {
            const { id } = req.params;

            const notification = await Notification.findOne({ notificationID: id });
            if (!notification) {
                return res.status(404).json({ message: 'Không tìm thấy thông báo' });
            }

            // Xóa thông báo và các user notification liên quan
            await Promise.all([
                notification.deleteOne(),
                UserNotification.deleteMany({ notificationID: id })
            ]);

            res.json({ message: 'Xóa thông báo thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa thông báo',
                error: error.message
            });
        }
    }

}

module.exports = new NotificationController();
