const Target = require('../models/Target');

class TargetController {
    // Lấy tất cả target (đối tượng)
    async getTargets(req, res) {
        try {
            const targets = await Target.find().sort('name');
            
            // Lấy số lượng sản phẩm cho mỗi target
            const productCounts = await Target.getProductCount();
            
            // Thêm số lượng sản phẩm vào kết quả
            const targetsWithCount = targets.map(target => ({
                ...target.toJSON(),
                productCount: productCounts[target.targetID] || 0
            }));

            res.json(targetsWithCount);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy danh sách đối tượng',
                error: error.message
            });
        }
    }

    // Lấy target theo ID
    async getTargetById(req, res) {
        try {
            const { id } = req.params;
            const target = await Target.findOne({ targetID: id });

            if (!target) {
                return res.status(404).json({ message: 'Không tìm thấy đối tượng' });
            }

            // Lấy số lượng sản phẩm của target này
            const productCounts = await Target.getProductCount();
            const targetWithCount = {
                ...target.toJSON(),
                productCount: productCounts[target.targetID] || 0
            };

            res.json(targetWithCount);
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi lấy thông tin đối tượng',
                error: error.message
            });
        }
    }

    // Tạo target mới
    async createTarget(req, res) {
        try {
            const { name } = req.body;

            // Kiểm tra name có phải là Nam hoặc Nữ
            if (!['Nam', 'Nữ'].includes(name)) {
                return res.status(400).json({
                    message: 'Tên đối tượng phải là Nam hoặc Nữ'
                });
            }

            // Tạo ID mới cho target
            const lastTarget = await Target.findOne().sort({ targetID: -1 });
            const targetID = lastTarget ? lastTarget.targetID + 1 : 1;

            const target = new Target({
                targetID,
                name
            });

            await target.save();

            res.status(201).json({
                message: 'Tạo đối tượng thành công',
                target
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi tạo đối tượng',
                error: error.message
            });
        }
    }

    // Cập nhật target
    async updateTarget(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            // Kiểm tra name có phải là Nam hoặc Nữ
            if (!['Nam', 'Nữ'].includes(name)) {
                return res.status(400).json({
                    message: 'Tên đối tượng phải là Nam hoặc Nữ'
                });
            }

            const target = await Target.findOne({ targetID: id });
            if (!target) {
                return res.status(404).json({ message: 'Không tìm thấy đối tượng' });
            }

            target.name = name;
            await target.save();

            res.json({
                message: 'Cập nhật đối tượng thành công',
                target
            });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi cập nhật đối tượng',
                error: error.message
            });
        }
    }

    // Xóa target
    async deleteTarget(req, res) {
        try {
            const { id } = req.params;

            const target = await Target.findOne({ targetID: id });
            if (!target) {
                return res.status(404).json({ message: 'Không tìm thấy đối tượng' });
            }

            // Kiểm tra xem có sản phẩm nào đang sử dụng target này không
            const Product = require('../models/Product');
            const productsUsingTarget = await Product.countDocuments({ targetID: id });
            
            if (productsUsingTarget > 0) {
                return res.status(400).json({
                    message: 'Không thể xóa đối tượng này vì đang có sản phẩm sử dụng'
                });
            }

            await target.deleteOne();

            res.json({ message: 'Xóa đối tượng thành công' });
        } catch (error) {
            res.status(500).json({
                message: 'Có lỗi xảy ra khi xóa đối tượng',
                error: error.message
            });
        }
    }
}

module.exports = new TargetController();
