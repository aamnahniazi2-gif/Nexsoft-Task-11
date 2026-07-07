const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.page) || 1;
        
        // Build query
        const query = {};
        
        // Search functionality
        if (req.query.keyword) {
            query.$or = [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } },
                { tags: { $regex: req.query.keyword, $options: 'i' } },
                { brand: { $regex: req.query.keyword, $options: 'i' } }
            ];
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
        if (req.query.isIslamic === 'true') {
            query.isIslamic = true;
        }
        
        // Filter halal certified products
        if (req.query.halalCertified === 'true') {
            query.halalCertified = true;
        }
        
        // Filter featured products
        if (req.query.featured === 'true') {
            query.isFeatured = true;
        }
        
        // Filter by brand
        if (req.query.brand) {
            query.brand = req.query.brand;
        }
        
        // Filter by status
        query.status = 'active';
        
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
            case 'featured':
                sortOption = { isFeatured: -1, createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }
        
        // Price filter
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }
        
        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .populate('reviews.user', 'name avatar')
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.status(200).json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
            hasMore: page < Math.ceil(count / pageSize)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('reviews.user', 'name avatar')
            .populate('createdBy', 'name');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Increment view count
        product.viewCount += 1;
        await product.save({ validateBeforeSave: false });
        
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('category', 'name slug')
            .populate('reviews.user', 'name avatar');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res, next) => {
    try {
        const { rating, title, comment } = req.body;
        
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
                message: 'You have already reviewed this product'
            });
        }
        
        // Check if user has purchased this product
        const Order = require('../models/Order');
        const hasPurchased = await Order.findOne({
            user: req.user.id,
            'orderItems.product': product._id,
            isPaid: true
        });
        
        const review = {
            user: req.user.id,
            name: req.user.name,
            rating: Number(rating),
            title,
            comment,
            verified: !!hasPurchased
        };
        
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        
        // Calculate average rating
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / 
                        product.reviews.length;
        
        await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('reviews.user', 'name avatar');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const pageSize = 10;
        const page = Number(req.query.page) || 1;
        
        const reviews = product.reviews
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice((page - 1) * pageSize, page * pageSize);
        
        res.status(200).json({
            success: true,
            reviews,
            page,
            pages: Math.ceil(product.reviews.length / pageSize),
            total: product.reviews.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark review as helpful
// @route   PUT /api/products/:id/reviews/:reviewId/helpful
// @access  Private
exports.markReviewHelpful = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const review = product.reviews.id(req.params.reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        if (req.body.helpful) {
            review.helpful.yes += 1;
        } else {
            review.helpful.no += 1;
        }
        
        await product.save();
        
        res.status(200).json({
            success: true,
            helpful: review.helpful
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res, next) => {
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
            category: product.category,
            status: 'active'
        })
            .limit(6)
            .populate('category', 'name slug');
        
        // If not enough related products, get some from the same brand
        if (relatedProducts.length < 6 && product.brand) {
            const brandProducts = await Product.find({
                _id: { $ne: product._id, $nin: relatedProducts.map(p => p._id) },
                brand: product.brand,
                status: 'active'
            })
                .limit(6 - relatedProducts.length)
                .populate('category', 'name slug');
            
            relatedProducts.push(...brandProducts);
        }
        
        res.status(200).json({
            success: true,
            relatedProducts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ 
            isFeatured: true,
            status: 'active'
        })
            .limit(8)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product stats
// @route   GET /api/products/stats
// @access  Public
exports.getProductStats = async (req, res, next) => {
    try {
        const stats = await Product.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    totalProducts: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: '$numReviews' }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search query'
            });
        }
        
        const products = await Product.find({
            $text: { $search: q },
            status: 'active'
        })
            .populate('category', 'name slug')
            .limit(20)
            .select('name price images rating numReviews');
        
        res.status(200).json({
            success: true,
            products,
            query: q
        });
    } catch (error) {
        next(error);
    }
};