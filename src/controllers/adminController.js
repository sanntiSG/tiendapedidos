const Order = require('../models/Order');
const User = require('../models/User');
const { STATUS_LABELS, formatARS } = require('../utils/whatsappBuilder');

async function getOrders(req, res) {
  try {
    const { status, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!Object.keys(STATUS_LABELS).includes(status)) {
      return res.status(400).json({ error: 'Estado invalido.' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMetrics(req, res) {
  try {
    const [totalOrders, totalRevenue, byStatus, dailySales, topProducts] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Argentina/Buenos_Aires' },
            },
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$lines' },
        {
          $group: {
            _id: '$lines.productName',
            count: { $sum: '$lines.quantity' },
            revenue: { $sum: '$lines.lineSubtotal' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus,
      dailySales,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTopClients(req, res) {
  try {
    const clients = await User.find({ role: 'user', orderCount: { $gt: 0 } })
      .sort({ totalSpent: -1 })
      .limit(6)
      .select('name email phone totalSpent orderCount createdAt');
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function exportOrdersCsv(req, res) {
  try {
    const { from, to, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    const rows = [
      ['Numero', 'Fecha', 'Comprador', 'Telefono', 'Tipo entrega', 'Metodo pago', 'Subtotal', 'Costo envio', 'Total', 'Estado'].join(','),
    ];

    for (const o of orders) {
      const name = o.userId ? o.userId.name : o.guestName;
      const phone = o.userId ? o.userId.phone : o.guestPhone;
      const row = [
        o.orderNumber,
        new Date(o.createdAt).toLocaleString('es-AR'),
        `"${name}"`,
        phone,
        o.deliveryType === 'pickup' ? 'Retiro en local' : 'Delivery',
        o.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia',
        o.subtotal,
        o.deliveryCost,
        o.total,
        STATUS_LABELS[o.status],
      ].join(',');
      rows.push(row);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pedidos-${Date.now()}.csv"`);
    res.send('\uFEFF' + rows.join('\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getOrders, getOrder, updateOrderStatus, getMetrics, getTopClients, exportOrdersCsv };
