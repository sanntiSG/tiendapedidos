const Order = require('../models/Order');
const User = require('../models/User');
const AppConfig = require('../models/AppConfig');
const Product = require('../models/Product');
const { calculateLineSubtotal, calculateOrderTotal } = require('../utils/priceCalculator');
const { buildWhatsappMessage, buildWhatsappUrl } = require('../utils/whatsappBuilder');
const validator = require('validator');

async function createOrder(req, res) {
  try {
    const {
      lines,
      deliveryType,
      paymentMethod,
      deliveryAddress,
      notes,
      guestName,
      guestPhone,
      userId,
    } = req.body;

    if (!lines || !lines.length) {
      return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' });
    }
    if (!['pickup', 'delivery'].includes(deliveryType)) {
      return res.status(400).json({ error: 'Tipo de entrega invalido.' });
    }
    if (!['cash', 'transfer'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Metodo de pago invalido.' });
    }
    if (deliveryType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Se requiere direccion para delivery.' });
    }

    let buyer = null;
    if (userId) {
      buyer = await User.findById(userId);
    }

    const buyerPhone = buyer?.phone || guestPhone;
    const buyerName = buyer?.name || guestName;

    if (!buyerPhone || !validator.isMobilePhone(buyerPhone, 'any')) {
      return res.status(400).json({ error: 'Se requiere un numero de telefono valido.' });
    }
    if (!buyerName) {
      return res.status(400).json({ error: 'Se requiere nombre del comprador.' });
    }

    const deliveryCostConfig = await AppConfig.findOne({ key: 'deliveryCost' });
    const deliveryCost = deliveryType === 'delivery'
      ? (deliveryCostConfig?.value ?? 0)
      : 0;

    const processedLines = await Promise.all(
      lines.map(async (line) => {
        const product = await Product.findById(line.productId);
        if (!product || !product.available) {
          throw new Error(`Producto no disponible: ${line.productId}`);
        }

        const selectedOptions = (line.selectedOptions || []).map((opt) => ({
          groupName: opt.groupName,
          itemName: opt.itemName,
          quantity: opt.quantity || 1,
          unitPrice: opt.unitPrice,
          subtotal: opt.unitPrice * (opt.quantity || 1),
        }));

        const lineSubtotal = calculateLineSubtotal(
          product.basePrice,
          selectedOptions,
          line.quantity
        );

        return {
          productId: product._id,
          productName: product.name,
          basePrice: product.basePrice,
          quantity: line.quantity,
          selectedOptions,
          lineSubtotal,
        };
      })
    );

    const { subtotal, total } = calculateOrderTotal(processedLines, deliveryCost);

    const order = new Order({
      userId: buyer?._id || null,
      guestName: buyer ? null : buyerName,
      guestPhone: buyer ? null : buyerPhone,
      lines: processedLines,
      deliveryType,
      deliveryCost,
      paymentMethod,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
      notes: notes || null,
      subtotal,
      total,
    });

    await order.save();

    if (buyer) {
      buyer.totalSpent += total;
      buyer.orderCount += 1;
      await buyer.save();
    }

    res.status(201).json({ order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getWhatsappUrl(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

    let buyerName = order.guestName;
    let buyerPhone = order.guestPhone;

    if (order.userId) {
      const user = await User.findById(order.userId);
      if (user) {
        buyerName = user.name;
        buyerPhone = user.phone;
      }
    }

    const message = buildWhatsappMessage(order, buyerName, buyerPhone);
    const url = buildWhatsappUrl(process.env.WHATSAPP_VENDOR_NUMBER, message);

    order.whatsappSent = true;
    await order.save();

    res.json({ url, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createOrder, getWhatsappUrl, getMyOrders };
