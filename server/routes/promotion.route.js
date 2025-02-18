const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/PromotionController');
const { authenticateAdmin, authenticateToken } = require('../middlewares/auth.middleware');

//!ADMIN
router.post('/create', authenticateAdmin, promotionController.createPromotion);
router.put('/update/:promotionID', authenticateAdmin, promotionController.updatePromotion);
router.delete('/delete/:promotionID', authenticateAdmin, promotionController.deletePromotion);
router.get('/all', authenticateAdmin, promotionController.getAllPromotions);
router.patch('/toggle-status/:id', authenticateAdmin, promotionController.toggleStatus);

// Routes cho cả admin và customer
router.get('/active', promotionController.getActivePromotions);
router.get('/:promotionID', promotionController.getPromotionById);
router.get('/product/:productId', promotionController.getPromotionsForProduct);

module.exports = router; 