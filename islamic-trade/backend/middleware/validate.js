const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Common validation rules
exports.registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

exports.loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
];

exports.productValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    body('price')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price must be positive'),
    body('category')
        .notEmpty()
        .withMessage('Category is required'),
    body('countInStock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a positive integer')
];