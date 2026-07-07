const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1'],
        max: [100, 'Quantity cannot exceed 100'],
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    name: String,
    image: String,
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    coupon: {
        code: String,
        discount: Number,
        discountType: {
            type: String,
            enum: ['percentage', 'fixed']
        },
        minPurchase: Number
    },
    totalItems: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    notes: String,
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
    }
}, {
    timestamps: true
});

// Index for performance
cartSchema.index({ user: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    // Calculate total items
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    
    // Calculate subtotal
    this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Apply coupon if exists
    this.discountAmount = 0;
    if (this.coupon && this.coupon.code) {
        if (this.coupon.minPurchase && this.subtotal < this.coupon.minPurchase) {
            this.coupon = undefined;
        } else {
            if (this.coupon.discountType === 'percentage') {
                this.discountAmount = (this.subtotal * this.coupon.discount) / 100;
            } else if (this.coupon.discountType === 'fixed') {
                this.discountAmount = this.coupon.discount;
            }
        }
    }
    
    // Calculate total price
    this.totalPrice = Math.max(0, this.subtotal - this.discountAmount);
    
    next();
});

module.exports = mongoose.model('Cart', cartSchema);