const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  updateOrderStatus,
  getMetrics,
  getTopClients,
  exportOrdersCsv,
} = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.get('/orders', getOrders);
router.get('/orders/export', exportOrdersCsv);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/metrics', getMetrics);
router.get('/top-clients', getTopClients);

module.exports = router;
