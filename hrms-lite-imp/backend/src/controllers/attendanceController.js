const { Employee, Attendance } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// Get all attendance records with pagination
const getAllAttendance = async (req, res) => {
    try {
        const { date, from, to, employee, status, page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = {};

        if (date) {
            where.date = date;
        }

        if (from) {
            where.date = { ...where.date, [Op.gte]: from };
        }

        if (to) {
            where.date = { ...where.date, [Op.lte]: to };
        }

        if (employee) {
            where.employeeId = employee;
        }

        if (status) {
            where.status = status;
        }

        const { rows: attendance, count: total } = await Attendance.findAndCountAll({
            where,
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeId', 'fullName', 'department']
            }],
            order: [['date', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            count: attendance.length,
            total,
            page: parseInt(page),
            totalPages,
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch attendance records',
            details: error.message
        });
    }
};

// Mark attendance
const markAttendance = async (req, res) => {
    try {
        const { employeeId, date, status } = req.body;

        // Verify employee exists
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        // Check for existing attendance
        const existing = await Attendance.findOne({
            where: { employeeId, date }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: { date: `Attendance already marked for ${employee.fullName} on ${date}` }
            });
        }

        const attendance = await Attendance.create({
            employeeId,
            date,
            status
        });

        // Fetch with employee details
        const result = await Attendance.findByPk(attendance.id, {
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeId', 'fullName', 'department']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: result
        });
    } catch (error) {
        console.error('Error marking attendance:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: error.errors.map(e => ({ [e.path]: e.message }))
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to mark attendance',
            details: error.message
        });
    }
};

// Get attendance by employee with pagination
const getAttendanceByEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { from, to, page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        let where = { employeeId: id };

        if (from) {
            where.date = { ...where.date, [Op.gte]: from };
        }

        if (to) {
            where.date = { ...where.date, [Op.lte]: to };
        }

        const { rows: attendance, count: total } = await Attendance.findAndCountAll({
            where,
            order: [['date', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        const allAttendance = await Attendance.findAll({ where: { employeeId: id } });
        const present = allAttendance.filter(a => a.status === 'Present').length;
        const absent = allAttendance.filter(a => a.status === 'Absent').length;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                fullName: employee.fullName,
                department: employee.department
            },
            summary: {
                totalDays: allAttendance.length,
                presentDays: present,
                absentDays: absent,
                attendancePercentage: allAttendance.length > 0 ? Math.round((present / allAttendance.length) * 100 * 100) / 100 : 0
            },
            page: parseInt(page),
            totalPages,
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching employee attendance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch attendance records',
            details: error.message
        });
    }
};

// Get today's attendance
const getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const totalEmployees = await Employee.count();

        const attendance = await Attendance.findAll({
            where: { date: today },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeId', 'fullName', 'department']
            }]
        });

        const present = attendance.filter(a => a.status === 'Present').length;
        const absent = attendance.filter(a => a.status === 'Absent').length;
        const notMarked = totalEmployees - attendance.length;

        res.json({
            success: true,
            date: today,
            stats: {
                totalEmployees,
                present,
                absent,
                notMarked
            },
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching today attendance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch today attendance',
            details: error.message
        });
    }
};

// Get attendance summary for all employees
const getAttendanceSummary = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [{
                model: Attendance,
                as: 'attendanceRecords'
            }]
        });

        const summary = employees.map(emp => {
            const records = emp.attendanceRecords || [];
            const total = records.length;
            const present = records.filter(r => r.status === 'Present').length;
            const absent = records.filter(r => r.status === 'Absent').length;

            return {
                employeeId: emp.id,
                employeeCode: emp.employeeId,
                employeeName: emp.fullName,
                department: emp.department,
                totalDays: total,
                presentDays: present,
                absentDays: absent,
                attendancePercentage: total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0
            };
        });

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching attendance summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch attendance summary',
            details: error.message
        });
    }
};

module.exports = {
    getAllAttendance,
    markAttendance,
    getAttendanceByEmployee,
    getTodayAttendance,
    getAttendanceSummary
};
