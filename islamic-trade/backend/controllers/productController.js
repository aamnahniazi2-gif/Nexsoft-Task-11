const Product = require('../models/Product');
const { cloudinary } = require('../utils/cloudinary');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.page) || 1;
        
        // Build query
        const query = {};
        
        // Search functionality
        if (req.query.keyword) {
            query.$text = { $search: req.query.keyword };
        }
        
        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }
        
        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }
        
        // Filter by rating
        if (req.query.rating) {
            query.rating = { $gte: Number(req.query.rating) };
        }
        
        // Filter Islamic products
        if (req.query.isIslamic) {
            query.isIslamic = req.query.isIslamic === 'true';
        }
        
        // Filter featured products
        if (req.query.featured) {
            query.isFeatured = req.query.featured === 'true';
        }
        
        // Sort options
        let sortOption = {};
        switch (req.query.sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'rating':
                sortOption = { rating: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'bestsellers':
                sortOption = { salesCount: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }
        
        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('reviews.user', 'name avatar');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            review => review.user.toString() === req.user.id.toString()
        );
        
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'Product already reviewed'
            });
        }
        
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user.id
        };
        
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        
        await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Review added'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const relatedProducts = await Product.find({
            _id: { $ne: product._id },
            category: product.category
        })
            .limit(4)
            .populate('category', 'name');
        
        res.json({
            success: true,
            relatedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};