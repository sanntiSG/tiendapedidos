const express = require('express');
const router = express.Router();
const { googleLogin, getMe, updatePhone, getTopCustomers } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/google', googleLogin);
router.get('/top-customers', getTopCustomers);
router.get('/me', authenticate, getMe);
router.patch('/phone', authenticate, updatePhone);

module.exports = router;
