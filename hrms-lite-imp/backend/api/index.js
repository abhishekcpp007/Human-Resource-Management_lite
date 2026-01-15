// Self-contained serverless API for Vercel
// All code in one file to avoid module resolution issues

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');

// App setup
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
// Enable SSL if connecting to TiDB Cloud or in production
const dbHost = (process.env.DB_HOST || 'localhost').trim();
const requiresSSL = dbHost.includes('tidbcloud.com') || (process.env.NODE_ENV || '').trim() === 'production';
const sequelize = new Sequelize(
    (process.env.DB_NAME || 'hrms_lite').trim(),
    (process.env.DB_USER || 'phpmyadmin').trim(),
    (process.env.DB_PASSWORD || 'root').trim(),
    {
        host: dbHost,
        port: parseInt((process.env.DB_PORT || '3306').trim()),
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true
        },
        dialectOptions: requiresSSL ? {
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: false
            }
        } : {}
    }
);

// Employee Model
const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'employee_id'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    department: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    position: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    joinDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'join_date'
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'On Leave'),
        defaultValue: 'Active'
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
    }
}, {
    tableName: 'employees',
    paranoid: true
});

// Attendance Model
const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'employee_id',
        references: { model: 'employees', key: 'id' },
        onDelete: 'CASCADE'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent'),
        allowNull: false
    }
}, {
    tableName: 'attendance',
    indexes: [{ unique: true, fields: ['employee_id', 'date'] }]
});

// Associations
Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendanceRecords' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Database initialization
let dbInitialized = false;
const initDb = async () => {
    if (!dbInitialized) {
        try {
            await sequelize.authenticate();
            await sequelize.sync({ force: false });
            dbInitialized = true;
            console.log('Database connected and synced');
        } catch (error) {
            console.error('Database connection error:', error);
        }
    }
};
initDb();

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'HRMS Lite API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            dashboard: '/api/dashboard',
            employees: '/api/employees',
            attendance: '/api/attendance'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'HRMS Lite API is running',
        timestamp: new Date().toISOString()
    });
});

// Dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Debug: Log the date being used
        console.log('Dashboard query date:', today);

        // Count employees (without deletedAt filter since it might not be set)
        const totalEmployees = await Employee.count({ where: { status: 'Active' } });
        const presentToday = await Attendance.count({ where: { date: today, status: 'Present' } });
        const absentToday = await Attendance.count({ where: { date: today, status: 'Absent' } });
        const notMarked = totalEmployees - (presentToday + absentToday);

        const departments = await Employee.findAll({
            attributes: ['department', [Sequelize.fn('COUNT', '*'), 'count']],
            where: { status: 'Active' },
            group: ['department'],
            raw: true
        });

        const recentEmployees = await Employee.findAll({
            where: { status: 'Active' },
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['id', 'employeeId', 'name', 'department', 'position', 'createdAt']
        });

        const recentAttendance = await Attendance.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeId', 'name'] }]
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalEmployees,
                    presentToday,
                    absentToday,
                    notMarked,
                    date: today
                },
                departments,
                recentEmployees,
                recentAttendance
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Employees endpoints
app.get('/api/employees', async (req, res) => {
    try {
        const { search, department, status } = req.query;
        const where = { deletedAt: null };

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { employeeId: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        if (department) where.department = department;
        if (status) where.status = status;

        const employees = await Employee.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { name, email, phone, department, position, salary, joinDate, status } = req.body;

        // Find the highest existing employee number to avoid duplicates
        const lastEmployee = await Employee.findOne({
            order: [['id', 'DESC']],
            paranoid: false // Include soft-deleted records
        });
        const nextNum = lastEmployee ? lastEmployee.id + 1 : 1;
        const employeeId = `EMP${String(nextNum).padStart(3, '0')}`;

        const employee = await Employee.create({
            employeeId, name, email, phone, department, position, salary, joinDate, status: status || 'Active'
        });
        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        console.error('Employee creation error:', error);
        // Return more specific error message for debugging
        const errorMessage = error.errors
            ? error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
            : error.message;
        res.status(400).json({ success: false, error: errorMessage });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
        await employee.destroy();
        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Attendance endpoints
app.get('/api/attendance', async (req, res) => {
    try {
        const { date, status, employeeId } = req.query;
        const where = {};
        if (date) where.date = date;
        if (status) where.status = status;
        if (employeeId) where.employeeId = employeeId;

        const attendance = await Attendance.findAll({
            where,
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeId', 'name', 'department'] }],
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/attendance', async (req, res) => {
    try {
        const { employeeId, date, status } = req.body;
        const [attendance, created] = await Attendance.findOrCreate({
            where: { employeeId, date },
            defaults: { employeeId, date, status }
        });

        if (!created) {
            attendance.status = status;
            await attendance.save();
        }

        const result = await Attendance.findByPk(attendance.id, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeId', 'name', 'department'] }]
        });
        res.status(created ? 201 : 200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/attendance/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findAll({
            where: { date: today },
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeId', 'name', 'department'] }]
        });
        res.json({ success: true, data: attendance, date: today });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/attendance/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.date = { [Op.between]: [startDate, endDate] };
        }

        const summary = await Attendance.findAll({
            where,
            attributes: [
                'employeeId',
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'Present' THEN 1 ELSE 0 END")), 'presentDays'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'Absent' THEN 1 ELSE 0 END")), 'absentDays'],
                [Sequelize.fn('COUNT', '*'), 'totalDays']
            ],
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeId', 'name', 'department'] }],
            group: ['employeeId', 'employee.id']
        });
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

module.exports = app;
