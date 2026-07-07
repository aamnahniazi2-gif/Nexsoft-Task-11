const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// ==================== Dashboard ====================

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        
        // Basic counts
        const [
            totalProducts,
            totalOrders,
            totalUsers,
            totalCategories,
            activeProducts,
            pendingOrders
        ] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ role: 'user' }),
            Category.countDocuments(),
            Product.countDocuments({ status: 'active' }),
            Order.countDocuments({ orderStatus: 'pending' })
        ]);
        
        // Revenue calculations
        const orders = await Order.find({ isPaid: true });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        
        // This month revenue
        const thisMonthOrders = await Order.find({
            isPaid: true,
            createdAt: { $gte: thisMonth }
        });
        const thisMonthRevenue = thisMonthOrders.reduce((acc, order) => acc + order.totalPrice, 0);
        
        // Last month revenue
        const lastMonthOrders = await Order.find({
            isPaid: true,
            createdAt: { $gte: lastMonth, $lt: thisMonth }
        });
        const lastMonthRevenue = lastMonthOrders.reduce((acc, order) => acc + order.totalPrice, 0);
        
        // Revenue growth
        const revenueGrowth = lastMonthRevenue > 0 
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
            : 100;
        
        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Top selling products
        const topProducts = await Product.find()
            .sort({ salesCount: -1 })
            .limit(10)
            .select('name price salesCount images rating');
        
        // Orders by status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);
        
        // Monthly revenue (last 12 months)
        const monthlyRevenue = await Order.aggregate([
            {
                $match: { isPaid: true }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
                $limit: 12
            }
        ]);
        
        // Daily orders (last 30 days)
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dailyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);
        
        // Low stock products
        const lowStockProducts = await Product.find({
            countInStock: { $lte: 10, $gt: 0 }
        })
            .select('name countInStock price')
            .limit(10);
        
        // Out of stock products
        const outOfStockProducts = await Product.find({
            countInStock: 0
        })
            .select('name price')
            .limit(10);
        
        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                activeProducts,
                totalOrders,
                pendingOrders,
                totalUsers,
                totalCategories,
                totalRevenue,
                thisMonthRevenue,
                lastMonthRevenue,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                recentOrders,
                topProducts,
                ordersByStatus,
                monthlyRevenue,
                dailyOrders,
                lowStockProducts,
                outOfStockProducts
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== Product Management ====================

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getProducts = async (req, res, next) => {
    try {
        const pageSize = 20;
        const page = Number(req.query.page) || 1;
        
        const query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.keyword) {
            query.name = { $regex: req.query.keyword, $options: 'i' };
        }
        
        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.status(200).json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;
        
        const product = await Product.create(req.body);
        
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        req.body.updatedBy = req.user.id;
        
        let product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('category', 'name');
        
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Delete images from cloudinary
        if (product.images && product.images.length > 0) {
            for (const image of product.images) {
                if (image.public_id) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }
        }
        
        await product.remove();
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload product images
// @route   POST /api/admin/products/upload
// @access  Private/Admin
exports.uploadProductImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image'
            });
        }
        
        const images = [];
        
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'islamic-trade/products',
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' }
                ]
            });
            
            images.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }
        
        res.status(200).json({
            success: true,
            images
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk update products
// @route   PUT /api/admin/products/bulk
// @access  Private/Admin
exports.bulkUpdateProducts = async (req, res, next) => {
    try {
        const { productIds, update } = req.body;
        
        await Product.updateMany(
            { _id: { $in: productIds } },
            update
        );
        
        res.status(200).json({
            success: true,
            message: `${productIds.length} products updated`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk delete products
// @route   DELETE /api/admin/products/bulk
// @access  Private/Admin
exports.bulkDeleteProducts = async (req, res, next) => {
    try {
        const { productIds } = req.body;
        
        // Delete images first
        const products = await Product.find({ _id: { $in: productIds } });
        for (const product of products) {
            if (product.images && product.images.length > 0) {
                for (const image of product.images) {
                    if (image.public_id) {
                        await cloudinary.uploader.destroy(image.public_id);
                    }
                }
            }
        }
        
        await Product.deleteMany({ _id: { $in: productIds } });
        
        res.status(200).json({
            success: true,
            message: `${productIds.length} products deleted`
        });
    } catch (error) {
        next(error);
    }
};

// ==================== Category Management ====================

// @desc    Get all categories (admin)
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find()
            .populate('parent', 'name')
            .populate('createdBy', 'name')
            .sort({ displayOrder: 1, name: 1 });
        
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;
        
        const category = await Category.create(req.body);
        
        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
    try {
        let category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        
        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if category has products
        const productCount = await Product.countDocuments({ category: category._id });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${productCount} products. Please reassign or delete products first.`
            });
        }
        
        // Delete category image from cloudinary
        if (category.image && category.image.public_id) {
            await cloudinary.uploader.destroy(category.image.public_id);
        }
        
        await category.remove();
        
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== Order Management ====================

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
    try {
        const pageSize = 20;
        const page = Number(req.query.page) || 1;
        
        const query = {};
        if (req.query.status) {
            query.orderStatus = req.query.status;
        }
        if (req.query.payment) {
            query['payment.status'] = req.query.payment;
        }
        
        const count = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.status(200).json({
            success: true,
            orders,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
exports.updateOrder = async (req, res, next) => {
    try {
        const { orderStatus, trackingNumber, trackingCompany, estimatedDelivery, adminNotes } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Update fields
        if (orderStatus) {
            order.orderStatus = orderStatus;
            
            if (orderStatus === 'delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            
            order.statusHistory.push({
                status: orderStatus,
                date: new Date(),
                comment: `Status updated by admin`,
                updatedBy: req.user.id
            });
        }
        
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (trackingCompany) order.trackingCompany = trackingCompany;
        if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
        if (adminNotes) order.adminNotes = adminNotes;
        
        await order.save();
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

// ==================== User Management ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const pageSize = 20;
        const page = Number(req.query.page) || 1;
        
        const query = {};
        if (req.query.role) {
            query.role = req.query.role;
        }
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        const count = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.status(200).json({
            success: true,
            users,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user's orders
        const orders = await Order.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.status(200).json({
            success: true,
            user,
            orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const { role, isActive, name, email } = req.body;
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (role) user.role = role;
        if (typeof isActive !== 'undefined') user.isActive = isActive;
        if (name) user.name = name;
        if (email) user.email = email;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Don't allow deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }
        
        await user.remove();
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};