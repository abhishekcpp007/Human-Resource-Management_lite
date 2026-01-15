const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const employeeController = require('../controllers/employeeController');

// Validation middleware
const validateEmployee = [
    body('employeeId')
        .trim()
        .notEmpty().withMessage('Employee ID is required')
        .isLength({ max: 50 }).withMessage('Employee ID must be less than 50 characters'),
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 100 }).withMessage('Full name must be less than 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('department')
        .trim()
        .notEmpty().withMessage('Department is required')
        .isLength({ max: 100 }).withMessage('Department must be less than 100 characters')
];

// Handle validation errors
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: errors.array().reduce((acc, err) => {
                acc[err.path] = err.msg;
                return acc;
            }, {})
        });
    }
    next();
};

// Routes
router.get('/', employeeController.getAllEmployees);
router.get('/departments', employeeController.getDepartments);
router.get('/stats', employeeController.getEmployeeStats);
router.get('/:id', employeeController.getEmployee);
router.post('/', validateEmployee, handleValidation, employeeController.createEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;





