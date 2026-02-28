const mongoose = require('mongoose');

const selectedOptionSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const orderLineSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  basePrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedOptions: [selectedOptionSchema],
  lineSubtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestName: { type: String, trim: true, default: null },
  guestPhone: { type: String, trim: true, default: null },
  lines: [orderLineSchema],
  deliveryType: { type: String, enum: ['pickup', 'delivery'], required: true },
  deliveryCost: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'transfer'], required: true },
  deliveryAddress: { type: String, trim: true, default: null },
  notes: { type: String, trim: true, default: null },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  whatsappSent: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `PED-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
