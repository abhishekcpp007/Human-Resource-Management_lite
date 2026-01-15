const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const attendanceController = require('../controllers/attendanceController');

// Validation middleware
const validateAttendance = [
    body('employeeId')
        .notEmpty().withMessage('Employee ID is required')
        .isInt().withMessage('Employee ID must be a number'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isDate().withMessage('Invalid date format (use YYYY-MM-DD)'),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['Present', 'Absent']).withMessage('Status must be Present or Absent')
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
router.get('/', attendanceController.getAllAttendance);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/summary', attendanceController.getAttendanceSummary);
router.get('/employee/:id', attendanceController.getAttendanceByEmployee);
router.post('/', validateAttendance, handleValidation, attendanceController.markAttendance);

module.exports = router;
