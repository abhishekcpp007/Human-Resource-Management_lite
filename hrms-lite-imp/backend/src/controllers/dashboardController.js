const { Employee, Attendance } = require('../models');
const { fn, col, literal, Op } = require('sequelize');

// Get dashboard data
const getDashboard = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Total employees
        const totalEmployees = await Employee.count();

        // Today's attendance
        const todayAttendance = await Attendance.findAll({
            where: { date: today }
        });

        const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
        const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;
        const notMarkedToday = totalEmployees - todayAttendance.length;

        // Department-wise count
        const departments = await Employee.findAll({
            attributes: [
                'department',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['department'],
            order: [[literal('count'), 'DESC']],
            raw: true
        });

        // Recent attendance (last 5)
        const recentAttendance = await Attendance.findAll({
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['employeeId', 'fullName']
            }],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        // Recent employees (last 5)
        const recentEmployees = await Employee.findAll({
            attributes: ['id', 'employeeId', 'fullName', 'department', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        res.json({
            success: true,
            data: {
                totalEmployees,
                today: {
                    date: today,
                    present: presentToday,
                    absent: absentToday,
                    notMarked: notMarkedToday
                },
                departments,
                recentAttendance: recentAttendance.map(a => ({
                    id: a.id,
                    employeeName: a.employee?.fullName,
                    employeeId: a.employee?.employeeId,
                    date: a.date,
                    status: a.status,
                    createdAt: a.created_at
                })),
                recentEmployees
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data',
            details: error.message
        });
    }
};

module.exports = {
    getDashboard
};
