const { body, validationResult } = require('express-validator');

exports.validateSignup = [
    body('ID').isLength({ min: 5 }).withMessage('ID must be at least 5 characters long'),
    body('PASSWORD').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

