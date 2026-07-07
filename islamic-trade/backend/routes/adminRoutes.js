const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    bulkUpdateProducts,
    bulkDeleteProducts,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getOrders,
    updateOrder,
    getUsers,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../utils/multer');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Product routes
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/upload', upload.array('images', 5), uploadProductImages);
router.put('/products/bulk/update', bulkUpdateProducts);
router.delete('/products/bulk/delete', bulkDeleteProducts);

// Category routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Order routes
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrder);

// User routes
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;