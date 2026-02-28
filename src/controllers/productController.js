const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { moderateImage } = require('../utils/moderation');
const fs = require('fs');

async function getProducts(req, res) {
  try {
    const filter = {};
    if (req.query.tag) filter.tags = req.query.tag;
    if (!req.query.includeUnavailable) filter.available = true;
    const products = await Product.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function handleImageProcess(file) {
  if (!file) return null;

  // 1. Subida directa a Cloudinary (Sin moderador porque solo el Admin sube porductos)
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'pancho-app-products',
  });

  // 2. Eliminar archivo local temporal
  fs.unlinkSync(file.path);

  return result.secure_url;
}

async function createProduct(req, res) {
  try {
    const data = { ...req.body };

    // El body viene como string si se usa FormData, hay que parsearlo
    if (typeof data.optionGroups === 'string') {
      data.optionGroups = JSON.parse(data.optionGroups);
    }
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (data.basePrice !== undefined) data.basePrice = Number(data.basePrice);
    if (data.order !== undefined) data.order = Number(data.order);
    if (data.available !== undefined) data.available = data.available === 'true' || data.available === true;

    if (req.file) {
      const imageUrl = await handleImageProcess(req.file);
      data.imageUrl = imageUrl;
    }

    const product = new Product(data);
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const data = { ...req.body };

    // Parsing si viene de FormData
    if (typeof data.optionGroups === 'string') {
      data.optionGroups = JSON.parse(data.optionGroups);
    }
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (data.basePrice !== undefined) data.basePrice = Number(data.basePrice);
    if (data.order !== undefined) data.order = Number(data.order);
    if (data.available !== undefined) data.available = data.available === 'true' || data.available === true;

    if (req.file) {
      const imageUrl = await handleImageProcess(req.file);
      data.imageUrl = imageUrl;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ message: 'Producto eliminado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
