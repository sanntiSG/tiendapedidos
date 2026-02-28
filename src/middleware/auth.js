const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no provisto.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
