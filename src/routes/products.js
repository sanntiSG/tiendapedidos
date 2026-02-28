const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
