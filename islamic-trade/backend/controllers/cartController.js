const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: 'items.product',
                select: 'name price images countInStock category brand slug'
            });
        
        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }
        
        // Check stock availability for all items
        let stockUpdated = false;
        for (const item of cart.items) {
            if (item.product && item.product.countInStock < item.quantity) {
                if (item.product.countInStock === 0) {
                    cart.items = cart.items.filter(i => i.product._id.toString() !== item.product._id.toString());
                } else {
                    item.quantity = item.product.countInStock;
                }
                stockUpdated = true;
            }
        }
        
        if (stockUpdated) {
            await cart.save();
            await cart.populate({
                path: 'items.product',
                select: 'name price images countInStock category brand slug'
            });
        }
        
        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        if (product.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }
        
        if (product.countInStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.countInStock} items available in stock`
            });
        }
        
        // Get or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }
        
        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );
        
        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > product.countInStock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more items. Maximum available: ${product.countInStock}`
                });
            }
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].price = product.price;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                name: product.name,
                image: product.images[0]?.url || ''
            });
        }
        
        await cart.save();
        
        // Populate product details
        await cart.populate({
            path: 'items.product',
            select: 'name price images countInStock category brand slug'
        });
        
        res.status(200).json({
            success: true,
            cart,
            message: 'Item added to cart'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        
        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity cannot be negative'
            });
        }
        
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        
        if (quantity === 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            if (quantity > product.countInStock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.countInStock} items available`
                });
            }
            
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].price = product.price;
        }
        
        await cart.save();
        
        await cart.populate({
            path: 'items.product',
            select: 'name price images countInStock category brand slug'
        });
        
        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );
        
        await cart.save();
        
        await cart.populate({
            path: 'items.product',
            select: 'name price images countInStock category brand slug'
        });
        
        res.status(200).json({
            success: true,
            cart,
            message: 'Item removed from cart'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.user.id },
            { items: [], coupon: undefined, notes: '' },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            cart,
            message: 'Cart cleared'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Apply coupon code
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a coupon code'
            });
        }
        
        // Find and validate coupon
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        
        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired coupon code'
            });
        }
        
        // Check if coupon has reached usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit reached'
            });
        }
        
        // Check user usage limit
        if (!coupon.canUserUse(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You have already used this coupon the maximum number of times'
            });
        }
        
        // Get cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        // Check minimum purchase
        const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase of $${coupon.minPurchase} required`
            });
        }
        
        // Check if coupon is restricted to specific products or categories
        if (coupon.products.length > 0 || coupon.categories.length > 0) {
            let isApplicable = false;
            
            for (const item of cart.items) {
                const product = await Product.findById(item.product).populate('category');
                
                if (coupon.products.includes(product._id) || 
                    (product.category && coupon.categories.includes(product.category._id))) {
                    isApplicable = true;
                    break;
                }
            }
            
            if (!isApplicable) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon is not applicable to items in your cart'
                });
            }
        }
        
        // Apply coupon to cart
        cart.coupon = {
            code: coupon.code,
            discount: coupon.discount,
            discountType: coupon.discountType,
            minPurchase: coupon.minPurchase
        };
        
        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discount) / 100;
            if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
        } else {
            discountAmount = coupon.discount;
        }
        
        await cart.save();
        
        res.status(200).json({
            success: true,
            cart,
            discountAmount,
            message: 'Coupon applied successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.user.id },
            { coupon: undefined },
            { new: true }
        ).populate({
            path: 'items.product',
            select: 'name price images countInStock category brand slug'
        });
        
        res.status(200).json({
            success: true,
            cart,
            message: 'Coupon removed'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save cart notes
// @route   PUT /api/cart/notes
// @access  Private
exports.saveCartNotes = async (req, res, next) => {
    try {
        const { notes } = req.body;
        
        const cart = await Cart.findOneAndUpdate(
            { user: req.user.id },
            { notes },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        next(error);
    }
};