const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        let query = { isActive: true };
        
        // If parent is specified, get subcategories
        if (req.query.parent) {
            query.parent = req.query.parent;
        } else if (req.query.root === 'true') {
            query.parent = null;
        }
        
        const categories = await Category.find(query)
            .populate('children')
            .sort({ displayOrder: 1, name: 1 });
        
        // Get product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({
                    category: category._id,
                    status: 'active'
                });
                return {
                    ...category.toJSON(),
                    productCount
                };
            })
        );
        
        res.status(200).json({
            success: true,
            categories: categoriesWithCount
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('children')
            .populate('parent', 'name slug');
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Get product count
        const productCount = await Product.countDocuments({
            category: category._id,
            status: 'active'
        });
        
        res.status(200).json({
            success: true,
            category: {
                ...category.toJSON(),
                productCount
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
            .populate('children')
            .populate('parent', 'name slug');
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Get products for this category
        const products = await Product.find({
            category: category._id,
            status: 'active'
        })
            .limit(20)
            .populate('category', 'name slug');
        
        res.status(200).json({
            success: true,
            category,
            products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
exports.getCategoryTree = async (req, res, next) => {
    try {
        const categories = await Category.find({ parent: null, isActive: true })
            .populate({
                path: 'children',
                match: { isActive: true },
                populate: {
                    path: 'children',
                    match: { isActive: true }
                }
            })
            .sort({ displayOrder: 1 });
        
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
exports.getFeaturedCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({
            isActive: true,
            image: { $exists: true, $ne: null }
        })
            .limit(6)
            .sort({ displayOrder: 1 });
        
        // Get product count for each
        const categoriesWithProducts = await Promise.all(
            categories.map(async (category) => {
                const products = await Product.find({
                    category: category._id,
                    status: 'active'
                })
                    .limit(4)
                    .select('name price images rating');
                
                return {
                    ...category.toJSON(),
                    products,
                    productCount: await Product.countDocuments({
                        category: category._id,
                        status: 'active'
                    })
                };
            })
        );
        
        res.status(200).json({
            success: true,
            categories: categoriesWithProducts
        });
    } catch (error) {
        next(error);
    }
};