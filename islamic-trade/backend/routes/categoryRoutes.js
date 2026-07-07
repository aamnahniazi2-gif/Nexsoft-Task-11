const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    getCategoryBySlug,
    getCategoryTree,
    getFeaturedCategories
} = require('../controllers/categoryController');

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/featured', getFeaturedCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);

module.exports = router;