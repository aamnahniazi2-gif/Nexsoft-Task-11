const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrder,
    getMyOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
    cancelOrder,
    trackOrder
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Protected routes
router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/track', trackOrder);

// Admin routes
router.put('/:id/deliver', admin, updateOrderToDelivered);

module.exports = router;