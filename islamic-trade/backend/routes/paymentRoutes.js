const express = require('express');
const router = express.Router();
const {
    createStripePaymentIntent,
    confirmStripePayment,
    handleStripeWebhook,
    createPayPalOrder,
    getPaymentMethods
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.get('/methods', getPaymentMethods);

// Protected routes
router.post('/stripe/create-intent', protect, createStripePaymentIntent);
router.post('/stripe/confirm', protect, confirmStripePayment);
router.post('/paypal/create-order', protect, createPayPalOrder);

module.exports = router;