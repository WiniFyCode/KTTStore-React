const Address = require('../models/Address');
const User = require('../models/User');

class AddressController {
    // Lấy danh sách địa chỉ của user
    async getAddresses(req, res) {
        try {
            const userID = req.user.userID;

            const addresses = await Address.find({
                userID,
                isDelete: false
            }).sort('-isDefault createdAt');

            res.json(addresses);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách địa chỉ',
                error: error.message
            });
        }
    }

    // Thêm địa chỉ mới
    async addAddress(req, res) {
        try {
            const userID = req.user.userID;
            const { address, isDefault = false } = req.body;

            // Kiểm tra user tồn tại
            const user = await User.findOne({ userID });
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Tạo ID mới cho địa chỉ
            const lastAddress = await Address.findOne().sort({ addressID: -1 });
            const addressID = lastAddress ? lastAddress.addressID + 1 : 1;

            // Nếu là địa chỉ đầu tiên, tự động set làm mặc định
            const addressCount = await Address.countDocuments({
                userID,
                isDelete: false
            });
            const shouldBeDefault = addressCount === 0 ? true : isDefault;

            const newAddress = new Address({
                addressID,
                userID,
                address,
                isDefault: shouldBeDefault
            });

            await newAddress.save();

            res.status(201).json({
                message: 'Thêm địa chỉ thành công',
                address: newAddress
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi thêm địa chỉ',
                error: error.message
            });
        }
    }

    // Cập nhật địa chỉ
    async updateAddress(req, res) {
        try {
            const { id } = req.params;
            const userID = req.user.userID;
            const { address, isDefault } = req.body;

            const addressDoc = await Address.findOne({
                addressID: id,
                userID,
                isDelete: false
            });

            if (!addressDoc) {
                return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
            }

            // Cập nhật thông tin
            if (address) addressDoc.address = address;
            if (typeof isDefault === 'boolean') addressDoc.isDefault = isDefault;

            await addressDoc.save();

            res.json({
                message: 'Cập nhật địa chỉ thành công',
                address: addressDoc
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật địa chỉ',
                error: error.message
            });
        }
    }

    // Xóa địa chỉ (soft delete)
    async deleteAddress(req, res) {
        try {
            const { id } = req.params;
            const userID = req.user.userID;

            const address = await Address.findOne({
                addressID: id,
                userID,
                isDelete: false
            });

            if (!address) {
                return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
            }

            // Kiểm tra có đơn hàng nào đang sử dụng địa chỉ này không
            const Order = require('../models/Order');
            const hasOrders = await Order.exists({
                addressID: id,
                status: { $nin: ['cancelled', 'delivered'] }
            });
            if (hasOrders) {
                return res.status(400).json({
                    message: 'Không thể xóa địa chỉ đang được sử dụng trong đơn hàng'
                });
            }

            // Nếu xóa địa chỉ mặc định, set địa chỉ khác làm mặc định
            if (address.isDefault) {
                const otherAddress = await Address.findOne({
                    userID,
                    addressID: { $ne: id },
                    isDelete: false
                });
                if (otherAddress) {
                    otherAddress.isDefault = true;
                    await otherAddress.save();
                }
            }

            address.isDelete = true;
            address.isDefault = false;
            await address.save();

            res.json({ message: 'Xóa địa chỉ thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa địa chỉ',
                error: error.message
            });
        }
    }

    // Set địa chỉ mặc định
    async setDefaultAddress(req, res) {
        try {
            const { id } = req.params;
            const userID = req.user.userID;

            const address = await Address.findOne({
                addressID: id,
                userID,
                isDelete: false
            });

            if (!address) {
                return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
            }

            // Nếu địa chỉ đã là mặc định thì không cần làm gì
            if (address.isDefault) {
                return res.json({
                    message: 'Địa chỉ này đã là mặc định',
                    address
                });
            }

            // Set địa chỉ này làm mặc định
            address.isDefault = true;
            await address.save(); // Middleware sẽ tự động hủy mặc định của các địa chỉ khác

            res.json({
                message: 'Đã set địa chỉ mặc định',
                address
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi set địa chỉ mặc định',
                error: error.message
            });
        }
    }
}

module.exports = new AddressController();
