const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    verified: {
        type: Boolean,
        default: false
    },
    helpful: {
        yes: { type: Number, default: 0 },
        no: { type: Number, default: 0 }
    },
    images: [{
        public_id: String,
        url: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        maxlength: [200, 'Product name cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    brand: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be positive'],
        default: 0
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price must be positive']
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please add a category']
    },
    subCategory: String,
    countInStock: {
        type: Number,
        required: [true, 'Please add stock count'],
        min: [0, 'Stock cannot be negative'],
        max: [10000, 'Stock cannot exceed 10000'],
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [reviewSchema],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isIslamic: {
        type: Boolean,
        default: false
    },
    halalCertified: {
        type: Boolean,
        default: false
    },
    halalCertificate: {
        number: String,
        issuedBy: String,
        issueDate: Date,
        expiryDate: Date,
        image: {
            public_id: String,
            url: String
        }
    },
    specifications: {
        type: Map,
        of: String
    },
    variations: [{
        name: String,
        options: [String]
    }],
    tags: [{
        type: String,
        trim: true
    }],
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    salesCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft', 'deleted'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for search and performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual for availability status
productSchema.virtual('availability').get(function() {
    if (this.countInStock === 0) return 'Out of Stock';
    if (this.countInStock <= 5) return 'Low Stock';
    return 'In Stock';
});

// Calculate discount percentage before save
productSchema.pre('save', function(next) {
    if (this.originalPrice && this.originalPrice > this.price) {
        this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);