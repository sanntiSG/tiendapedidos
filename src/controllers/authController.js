const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Token de Google requerido.' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      user.picture = picture; // Actualizar siempre la foto
    } else {
      const isAdmin = email === process.env.ADMIN_EMAIL;
      user = new User({ googleId, name, email, role: isAdmin ? 'admin' : 'user', picture });
    }

    await user.save();

    const token = signToken(user._id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Error en googleLogin:', err.message);
    res.status(401).json({ error: 'No se pudo verificar el token de Google.' });
  }
}

async function getMe(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

async function updatePhone(req, res) {
  const { phone, consentPromotions } = req.body;
  if (!phone || !validator.isMobilePhone(phone, 'any')) {
    return res.status(400).json({ error: 'Numero de telefono invalido.' });
  }
  req.user.phone = phone.trim();
  if (typeof consentPromotions === 'boolean') {
    req.user.consentPromotions = consentPromotions;
  }
  await req.user.save();
  res.json({ user: sanitizeUser(req.user) });
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    consentPromotions: user.consentPromotions,
    totalSpent: user.totalSpent,
    orderCount: user.orderCount,
    picture: user.picture,
  };
}

async function getTopCustomers(req, res) {
  try {
    const topCustomers = await User.find({
      role: 'user',
      orderCount: { $gt: 0 }
    })
      .sort({ orderCount: -1, totalSpent: -1 })
      .limit(6)
      .select('name orderCount totalSpent picture');

    res.json({ topCustomers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { googleLogin, getMe, updatePhone, getTopCustomers };
