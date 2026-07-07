const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    image: {
        public_id: String,
        url: String
    },
    icon: {
        type: String,
        default: 'folder'
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    ancestors: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },
        name: String,
        slug: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isIslamic: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    metaTitle: String,
    metaDescription: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for performance
categorySchema.index({ parent: 1 });
categorySchema.index({ slug: 1 });

// Virtual for subcategories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual for product count
categorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true
});

// Create slug from name
categorySchema.pre('save', function(next) {
    this.slug = this.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-');
    next();
});

module.exports = mongoose.model('Category', categorySchema);