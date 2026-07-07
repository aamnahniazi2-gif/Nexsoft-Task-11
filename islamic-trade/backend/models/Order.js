const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    sku: String
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    zipCode: {
        type: String,
        required: [true, 'Zip code is required']
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'US'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

const paymentSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true,
        enum: ['stripe', 'paypal', 'cod', 'bank_transfer']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: String,
    amount: Number,
    currency: {
        type: String,
        default: 'USD'
    },
    paidAt: Date,
    refundedAt: Date,
    details: mongoose.Schema.Types.Mixed
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    payment: paymentSchema,
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    discountPrice: {
        type: Number,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    coupon: {
        code: String,
        discount: Number
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date,
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    trackingNumber: String,
    trackingCompany: String,
    shippingMethod: String,
    estimatedDelivery: Date,
    cancelReason: String,
    returnReason: String,
    notes: String,
    adminNotes: String,
    statusHistory: [{
        status: String,
        date: Date,
        comment: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'payment.status': 1 });

// Generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        // Get count of orders today
        const count = await this.constructor.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            }
        });
        
        const sequence = (count + 1).toString().padStart(4, '0');
        this.orderNumber = `IT-${year}${month}${day}-${sequence}`;
    }
    next();
});

// Virtual for delivery time remaining
orderSchema.virtual('deliveryTimeRemaining').get(function() {
    if (!this.estimatedDelivery) return null;
    const now = new Date();
    const diff = this.estimatedDelivery - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))); // in days
});

module.exports = mongoose.model('Order', orderSchema);