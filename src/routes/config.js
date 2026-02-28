const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const AppConfig = require('../models/AppConfig');

router.get('/public', async (req, res) => {
  try {
    const deliveryCost = await AppConfig.findOne({ key: 'deliveryCost' });
    const storeName = await AppConfig.findOne({ key: 'storeName' });
    res.json({
      deliveryCost: deliveryCost?.value ?? 0,
      storeName: storeName?.value ?? 'Panchos',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const configs = await AppConfig.find();
    res.json({ configs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:key', authenticate, requireAdmin, async (req, res) => {
  try {
    const { value, label } = req.body;
    const config = await AppConfig.findOneAndUpdate(
      { key: req.params.key },
      { value, label },
      { new: true, upsert: true }
    );
    res.json({ config });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
