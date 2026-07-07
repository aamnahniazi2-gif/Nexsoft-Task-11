const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: String,
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed']
    },
    discount: {
        type: Number,
        required: [true, 'Please add a discount value'],
        min: 0
    },
    minPurchase: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usageCount: {
        type: Number,
        default: 0
    },
    userLimit: {
        type: Number,
        default: 1
    },
    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedCount: {
            type: Number,
            default: 0
        }
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    isIslamic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
    const now = new Date();
    
    if (!this.isActive) return false;
    if (now < this.startDate || now > this.endDate) return false;
    if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
    
    return true;
};

// Check if user can use coupon
couponSchema.methods.canUserUse = function(userId) {
    const userUsage = this.users.find(u => u.user.toString() === userId.toString());
    if (!userUsage) return true;
    return userUsage.usedCount < this.userLimit;
};

module.exports = mongoose.model('Coupon', couponSchema);