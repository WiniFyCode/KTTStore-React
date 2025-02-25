const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {

    //!ADMIN - Lấy danh sách người dùng và thống kê
    // "user" + "stats : tổng người dùng , người dùng đang hoạt động , người dùng bị khóa"
    async getUsersChoADMIN(req, res) {
        try {
            // Lấy tất cả người dùng
            const users = await User.find()
                .select('_id userID email fullname gender phone address role isDisabled ');

            // Tính toán thống kê
            const stats = {
                totalUser: users.length,
                totalActiveUser: users.filter(user => !user.isDisabled).length,
                totalDeactivatedUser: users.filter(user => user.isDisabled).length
            };

            res.json({
                users,
                stats
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách người dùng',
                error: error.message
            });
        }
    }

    //!ADMIN - Cập nhật thông tin người dùng
    async updateUser(req, res) {
        try {
            // Lấy userID từ params thay vì token
            const { id } = req.params;
            // Lấy thông tin cần update từ body request
            const { fullname, gender, phone } = req.body;

            // Tìm user trong database bằng id từ params
            const user = await User.findOne({ userID: id });
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Kiểm tra nếu user là admin thì không được phép chỉnh sửa
            if (user.role === 'admin') {
                return res.status(403).json({
                    message: 'Không được phép chỉnh sửa thông tin của admin'
                });
            }

            // Kiểm tra nếu số điện thoại mới khác số cũ
            if (phone && phone !== user.phone) {
                // Kiểm tra xem số điện thoại mới có trùng với user khác không
                const existingUser = await User.findOne({
                    phone,
                    userID: { $ne: id } // Sử dụng id từ params
                });
                if (existingUser) {
                    return res.status(400).json({
                        message: 'Số điện thoại đã được sử dụng'
                    });
                }
            }

            // Cập nhật thông tin mới (chỉ cập nhật nếu có gửi lên)
            if (fullname) user.fullname = fullname;
            if (gender) user.gender = gender;
            if (phone) user.phone = phone;

            // Lưu vào database
            await user.save();

            // Loại bỏ thông tin nhạy cảm trước khi trả về
            const userResponse = user.toJSON();
            delete userResponse.password;
            delete userResponse.resetPasswordToken;
            delete userResponse.resetPasswordExpires;

            res.json({
                message: 'Cập nhật thông tin thành công',
                user: userResponse
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật thông tin',
                error: error.message
            });
        }
    }

    //!ADMIN: Vô hiệu hóa/Kích hoạt tài khoản
    async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { isDisabled } = req.body;

            const user = await User.findOne({ userID: id });
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Không cho phép vô hiệu hóa tài khoản admin
            if (user.role === 'admin' && isDisabled) {
                return res.status(400).json({
                    message: 'Không thể vô hiệu hóa tài khoản admin'
                });
            }

            user.isDisabled = isDisabled;
            await user.save();

            res.json({
                message: isDisabled ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản',
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thay đổi trạng thái tài khoản',
                error: error.message
            });
        }
    }

    // USER: Lấy thông tin cá nhân
    async getProfile(req, res) {
        try {
            const userID = req.user.userID;

            const user = await User.findOne({ userID })
                .select('-password -resetPasswordToken -resetPasswordExpires')
                .populate('addresses');

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin cá nhân',
                error: error.message
            });
        }
    }

    // USER: Cập nhật thông tin cá nhân
    async updateProfile(req, res) {
        try {
            // Lấy userID từ token đăng nhập
            const userID = req.user.userID;
            // Lấy thông tin cần update từ body request
            const { fullname, gender, phone } = req.body;

            // Tìm user trong database
            const user = await User.findOne({ userID });
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Kiểm tra nếu số điện thoại mới khác số cũ
            if (phone && phone !== user.phone) {
                // Kiểm tra xem số điện thoại mới có trùng với user khác không
                const existingUser = await User.findOne({
                    phone,
                    userID: { $ne: userID } // Loại trừ user hiện tại
                });
                if (existingUser) {
                    return res.status(400).json({
                        message: 'Số điện thoại đã được sử dụng'
                    });
                }
            }

            // Cập nhật thông tin mới (chỉ cập nhật nếu có gửi lên)
            if (fullname) user.fullname = fullname;
            if (gender) user.gender = gender;
            if (phone) user.phone = phone;

            // Lưu vào database
            await user.save();

            // Loại bỏ thông tin nhạy cảm trước khi trả về
            const userResponse = user.toJSON();
            delete userResponse.password;
            delete userResponse.resetPasswordToken;
            delete userResponse.resetPasswordExpires;

            res.json({
                message: 'Cập nhật thông tin thành công',
                user: userResponse
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật thông tin',
                error: error.message
            });
        }
    }

    // USER: Đổi mật khẩu
    async changePassword(req, res) {
        try {
            // Lấy userID từ token đăng nhập
            const userID = req.user.userID;
            // Lấy thông tin mật khẩu mới từ request body
            const { currentPassword, newPassword } = req.body;

            console.log('Đổi mật khẩu cho userID:', userID);

            // Validate mật khẩu mới
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ 
                    message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
                });
            }

            // Tìm user trong database bằng userID
            const user = await User.findOne({ userID });
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            console.log('Tìm thấy người dùng:', user.email);

            // Kiểm tra mật khẩu hiện tại
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
            }

            console.log('Mật khẩu hiện tại đã xác nhận');

            // Hash mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật trực tiếp vào database để đảm bảo lưu đúng
            const updatedUser = await User.findOneAndUpdate(
                { userID },
                { $set: { password: hashedNewPassword } },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error('Không thể cập nhật mật khẩu');
            }

            console.log('Mật khẩu đã được cập nhật thành công');

            res.json({ 
                message: 'Đổi mật khẩu thành công',
                success: true,
                newPassword: newPassword
            });
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            res.status(500).json({
                message: 'Có lỗi xảy ra khi đổi mật khẩu',
                error: error.message
            });
        }
    }
}

module.exports = new UserController();
