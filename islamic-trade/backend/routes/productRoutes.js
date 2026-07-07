const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    getProductBySlug,
    createProductReview,
    getProductReviews,
    markReviewHelpful,
    getRelatedProducts,
    getFeaturedProducts,
    getProductStats,
    searchProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/stats', getProductStats);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getProductReviews);

// Protected routes
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews/:reviewId/helpful', protect, markReviewHelpful);

module.exports = router;