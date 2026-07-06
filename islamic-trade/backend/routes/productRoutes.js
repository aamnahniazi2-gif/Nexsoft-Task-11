const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProductReview,
    getRelatedProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;