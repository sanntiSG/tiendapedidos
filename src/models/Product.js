const mongoose = require('mongoose');

const optionItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: null },
  available: { type: Boolean, default: true },
});

const optionGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['toggle', 'counter', 'single', 'multi'], required: true },
  required: { type: Boolean, default: false },
  items: [optionItemSchema],
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  basePrice: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: null },
  tags: [{ type: String, trim: true }],
  optionGroups: [optionGroupSchema],
  available: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
