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
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
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
    totalPrice: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    },
    coupon: {
        code: String,
        discount: Number,
        discountType: {
            type: String,
            enum: ['percentage', 'fixed']
        }
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Apply coupon if exists
    if (this.coupon && this.coupon.code) {
        if (this.coupon.discountType === 'percentage') {
            this.totalPrice = this.totalPrice * (1 - this.coupon.discount / 100);
        } else if (this.coupon.discountType === 'fixed') {
            this.totalPrice = Math.max(0, this.totalPrice - this.coupon.discount);
        }
    }
    
    next();
});

module.exports = mongoose.model('Cart', cartSchema);