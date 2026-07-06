const express = require('express');
const router = express.Router();
const {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getOrders,
    updateOrderStatus,
    getDashboardStats,
    getUsers,
    updateUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../utils/multer');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Product routes
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/upload', upload.array('images', 5), uploadProductImages);

// Category routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Order routes
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

module.exports = router;