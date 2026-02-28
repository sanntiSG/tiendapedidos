const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  consentPromotions: { type: Boolean, default: false },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  picture: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
