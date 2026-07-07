const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        const { 
            shippingAddress, 
            paymentMethod,
            shippingMethod,
            notes 
        } = req.body;
        
        // Get cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        // Validate stock
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.product.name} not found`
                });
            }
            if (product.countInStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} has only ${product.countInStock} items in stock`
                });
            }
        }
        
        // Calculate prices
        const itemsPrice = cart.subtotal;
        const taxPrice = itemsPrice * 0.1; // 10% tax
        const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
        const totalPrice = itemsPrice + taxPrice + shippingPrice - cart.discountAmount;
        
        // Create order
        const order = await Order.create({
            user: req.user.id,
            orderItems: cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.images[0]?.url || '',
                sku: item.product.sku
            })),
            shippingAddress,
            payment: {
                method: paymentMethod,
                status: 'pending'
            },
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountPrice: cart.discountAmount,
            totalPrice,
            coupon: cart.coupon,
            shippingMethod,
            notes,
            statusHistory: [{
                status: 'pending',
                date: new Date(),
                comment: 'Order placed'
            }]
        });
        
        // Update coupon usage
        if (cart.coupon && cart.coupon.code) {
            await Coupon.findOneAndUpdate(
                { code: cart.coupon.code },
                { 
                    $inc: { usageCount: 1 },
                    $push: { 
                        users: {
                            user: req.user.id,
                            usedCount: 1
                        }
                    }
                }
            );
        }
        
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
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { items: [], coupon: undefined, notes: '' }
        );
        
        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images slug');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Make sure user owns order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;
        
        const count = await Order.countDocuments({ user: req.user.id });
        const orders = await Order.find({ user: req.user.id })
            .populate('orderItems.product', 'name images slug')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.status(200).json({
            success: true,
            orders,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        order.isPaid = true;
        order.paidAt = Date.now();
        order.payment.status = 'completed';
        order.payment.transactionId = req.body.transactionId;
        order.payment.paidAt = Date.now();
        order.orderStatus = 'confirmed';
        
        order.statusHistory.push({
            status: 'confirmed',
            date: new Date(),
            comment: 'Payment received'
        });
        
        const updatedOrder = await order.save();
        
        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.orderStatus = 'delivered';
        
        order.statusHistory.push({
            status: 'delivered',
            date: new Date(),
            comment: 'Order delivered'
        });
        
        const updatedOrder = await order.save();
        
        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if user owns order
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        // Check if order can be cancelled
        if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }
        
        order.orderStatus = 'cancelled';
        order.cancelReason = req.body.reason;
        
        order.statusHistory.push({
            status: 'cancelled',
            date: new Date(),
            comment: `Order cancelled: ${req.body.reason}`
        });
        
        // Restore product stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: item.quantity }
            });
        }
        
        const updatedOrder = await order.save();
        
        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
exports.trackOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .select('orderNumber orderStatus trackingNumber trackingCompany estimatedDelivery statusHistory');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.status(200).json({
            success: true,
            tracking: {
                orderNumber: order.orderNumber,
                status: order.orderStatus,
                trackingNumber: order.trackingNumber,
                trackingCompany: order.trackingCompany,
                estimatedDelivery: order.estimatedDelivery,
                history: order.statusHistory
            }
        });
    } catch (error) {
        next(error);
    }
};