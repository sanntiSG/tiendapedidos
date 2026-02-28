const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createOrder, getMyOrders, getWhatsappUrl } = require('../controllers/orderController');

router.post('/', createOrder);
router.post('/:id/whatsapp-url', getWhatsappUrl);
router.get('/my', authenticate, getMyOrders);

module.exports = router;
