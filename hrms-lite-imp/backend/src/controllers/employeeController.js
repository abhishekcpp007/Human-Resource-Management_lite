const { Employee, Attendance } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// Get all employees with pagination
const getAllEmployees = async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = {};

        if (search) {
            where[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { employeeId: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (department) {
            where.department = department;
        }

        const { rows: employees, count: total } = await Employee.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            count: employees.length,
            total,
            page: parseInt(page),
            totalPages,
            data: employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employees',
            details: error.message
        });
    }
};

// Get single employee
const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id, {
            include: [{
                model: Attendance,
                as: 'attendanceRecords',
                limit: 10,
                order: [['date', 'DESC']]
            }]
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employee',
            details: error.message
        });
    }
};

// Create new employee
const createEmployee = async (req, res) => {
    try {
        const { employeeId, fullName, email, department } = req.body;

        // Check for duplicate employee ID (including soft deleted)
        const existingById = await Employee.findOne({
            where: { employeeId },
            paranoid: false
        });
        if (existingById) {
            if (existingById.deletedAt) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    details: { employeeId: 'Employee ID was previously used. Please use a different ID.' }
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: { employeeId: 'Employee ID already exists' }
            });
        }

        // Check for duplicate email (including soft deleted)
        const existingByEmail = await Employee.findOne({
            where: { email },
            paranoid: false
        });
        if (existingByEmail) {
            if (existingByEmail.deletedAt) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    details: { email: 'Email was previously used. Please use a different email.' }
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: { email: 'Email already exists' }
            });
        }

        const employee = await Employee.create({
            employeeId,
            fullName,
            email: email.toLowerCase(),
            department
        });

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        console.error('Error creating employee:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: error.errors.map(e => ({ [e.path]: e.message }))
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create employee',
            details: error.message
        });
    }
};

// Soft delete employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        const employeeName = employee.fullName;

        // This will soft delete (set deleted_at) due to paranoid: true
        await employee.destroy();

        res.json({
            success: true,
            message: `Employee "${employeeName}" has been archived successfully`
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to archive employee',
            details: error.message
        });
    }
};

// Restore soft deleted employee
const restoreEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id, { paranoid: false });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        if (!employee.deletedAt) {
            return res.status(400).json({
                success: false,
                error: 'Employee is not archived'
            });
        }

        await employee.restore();

        res.json({
            success: true,
            message: `Employee "${employee.fullName}" has been restored successfully`,
            data: employee
        });
    } catch (error) {
        console.error('Error restoring employee:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restore employee',
            details: error.message
        });
    }
};

// Get all departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Employee.findAll({
            attributes: [[fn('DISTINCT', col('department')), 'department']],
            raw: true
        });

        res.json({
            success: true,
            data: departments.map(d => d.department).filter(Boolean)
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch departments',
            details: error.message
        });
    }
};

// Get employee stats
const getEmployeeStats = async (req, res) => {
    try {
        const total = await Employee.count();

        const byDepartment = await Employee.findAll({
            attributes: [
                'department',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['department'],
            order: [[literal('count'), 'DESC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                totalEmployees: total,
                byDepartment
            }
        });
    } catch (error) {
        console.error('Error fetching employee stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employee stats',
            details: error.message
        });
    }
};

module.exports = {
    getAllEmployees,
    getEmployee,
    createEmployee,
    deleteEmployee,
    restoreEmployee,
    getDepartments,
    getEmployeeStats
};
