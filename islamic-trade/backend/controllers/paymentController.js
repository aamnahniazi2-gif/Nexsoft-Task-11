const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price countInStock');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(cart.totalPrice * 100), // Stripe expects amount in cents
            currency: 'usd',
            metadata: {
                userId: req.user.id,
                cartId: cart._id.toString()
            }
        });
        
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook
// @access  Public
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handleSuccessfulPayment(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
};

// Helper function to handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
    try {
        const { userId, cartId } = paymentIntent.metadata;
        
        const cart = await Cart.findById(cartId)
            .populate('items.product');
        
        if (!cart) return;
        
        // Create order
        const order = new Order({
            user: userId,
            orderItems: cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.images[0]?.url || ''
            })),
            shippingAddress: {
                fullName: paymentIntent.shipping?.name || 'Customer',
                address: paymentIntent.shipping?.address?.line1 || '',
                city: paymentIntent.shipping?.address?.city || '',
                state: paymentIntent.shipping?.address?.state || '',
                zipCode: paymentIntent.shipping?.address?.postal_code || '',
                country: paymentIntent.shipping?.address?.country || ''
            },
            paymentMethod: 'stripe',
            paymentResult: {
                id: paymentIntent.id,
                status: paymentIntent.status,
                email_address: paymentIntent.receipt_email
            },
            itemsPrice: cart.totalPrice / (1 + (cart.coupon?.discount || 0) / 100),
            taxPrice: cart.totalPrice * 0.1, // 10% tax
            shippingPrice: cart.totalPrice > 100 ? 0 : 10, // Free shipping over $100
            totalPrice: cart.totalPrice,
            isPaid: true,
            paidAt: Date.now(),
            orderStatus: 'processing'
        });
        
        await order.save();
        
        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: {
                    countInStock: -item.quantity,
                    salesCount: item.quantity
                }
            });
        }
        
        // Clear cart
        cart.items = [];
        cart.coupon = {};
        await cart.save();
        
        console.log('Order created successfully:', order._id);
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// @desc    Create order (for COD)
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        const order = new Order({
            user: req.user.id,
            orderItems: cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.images[0]?.url || ''
            })),
            shippingAddress,
            paymentMethod,
            itemsPrice: cart.totalPrice / (1 + (cart.coupon?.discount || 0) / 100),
            taxPrice: cart.totalPrice * 0.1,
            shippingPrice: cart.totalPrice > 100 ? 0 : 10,
            totalPrice: cart.totalPrice
        });
        
        await order.save();
        
        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: {
                    countInStock: -item.quantity,
                    salesCount: item.quantity
                }
            });
        }
        
        // Clear cart
        cart.items = [];
        cart.coupon = {};
        await cart.save();
        
        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};