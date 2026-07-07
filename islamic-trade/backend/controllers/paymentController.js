const stripe = require('../config/stripe');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe/create-intent
// @access  Private
exports.createStripePaymentIntent = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price images');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        // Calculate order amount
        const amount = Math.round(cart.totalPrice * 100); // Convert to cents
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                userId: req.user.id.toString(),
                cartId: cart._id.toString(),
                integration_check: 'accept_a_payment'
            },
            description: `Islamic Trade Order - ${cart.totalItems} items`
        });
        
        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount / 100
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm Stripe payment
// @route   POST /api/payment/stripe/confirm
// @access  Private
exports.confirmStripePayment = async (req, res, next) => {
    try {
        const { paymentIntentId, orderId } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            // Update order
            const order = await Order.findById(orderId);
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.payment.status = 'completed';
                order.payment.transactionId = paymentIntentId;
                order.payment.details = paymentIntent;
                order.orderStatus = 'confirmed';
                
                order.statusHistory.push({
                    status: 'confirmed',
                    date: new Date(),
                    comment: 'Payment confirmed via Stripe'
                });
                
                await order.save();
            }
            
            res.status(200).json({
                success: true,
                message: 'Payment confirmed',
                paymentIntent
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment not completed',
                status: paymentIntent.status
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payment/stripe/webhook
// @access  Public
exports.handleStripeWebhook = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            case 'charge.refunded':
                await handleChargeRefunded(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

// @desc    Create PayPal order
// @route   POST /api/payment/paypal/create-order
// @access  Private
exports.createPayPalOrder = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        // Here you would integrate with PayPal API
        // This is a simplified version
        res.status(200).json({
            success: true,
            message: 'PayPal order created',
            totalAmount: cart.totalPrice
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment methods
// @route   GET /api/payment/methods
// @access  Public
exports.getPaymentMethods = async (req, res, next) => {
    try {
        const methods = [
            {
                id: 'stripe',
                name: 'Credit/Debit Card',
                description: 'Pay with Stripe',
                icon: 'credit-card',
                enabled: true
            },
            {
                id: 'paypal',
                name: 'PayPal',
                description: 'Pay with PayPal',
                icon: 'paypal',
                enabled: true
            },
            {
                id: 'cod',
                name: 'Cash on Delivery',
                description: 'Pay when you receive your order',
                icon: 'cash',
                enabled: true
            },
            {
                id: 'bank_transfer',
                name: 'Bank Transfer',
                description: 'Transfer directly to our bank account',
                icon: 'bank',
                enabled: false
            }
        ];
        
        res.status(200).json({
            success: true,
            methods
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions for webhook handling
async function handlePaymentIntentSucceeded(paymentIntent) {
    try {
        const { userId, cartId } = paymentIntent.metadata;
        
        if (!userId || !cartId) return;
        
        // Create order from cart
        const cart = await Cart.findById(cartId).populate('items.product');
        if (!cart || cart.items.length === 0) return;
        
        const order = new Order({
            user: userId,
            orderItems: cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.images[0]?.url || ''
            })),
            shippingAddress: paymentIntent.shipping || {
                fullName: 'Customer',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'US'
            },
            payment: {
                method: 'stripe',
                status: 'completed',
                transactionId: paymentIntent.id,
                amount: paymentIntent.amount / 100
            },
            itemsPrice: cart.subtotal,
            taxPrice: cart.subtotal * 0.1,
            shippingPrice: cart.subtotal > 100 ? 0 : 10,
            totalPrice: paymentIntent.amount / 100,
            isPaid: true,
            paidAt: new Date(),
            orderStatus: 'confirmed'
        });
        
        await order.save();
        
        // Update stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { countInStock: -item.quantity }
            });
        }
        
        // Clear cart
        await Cart.findByIdAndUpdate(cartId, { items: [], coupon: undefined });
        
        console.log(`Order ${order.orderNumber} created from payment ${paymentIntent.id}`);
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

async function handlePaymentIntentFailed(paymentIntent) {
    console.log(`Payment failed for intent ${paymentIntent.id}`);
    // Handle failed payment logic
}

async function handleChargeRefunded(charge) {
    console.log(`Charge refunded: ${charge.id}`);
    // Handle refund logic
}