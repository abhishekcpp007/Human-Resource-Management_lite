const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

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
        references: {
            model: Employee,
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: { msg: 'Invalid date format' },
            notEmpty: { msg: 'Date is required' }
        }
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['Present', 'Absent']],
                msg: 'Status must be Present or Absent'
            }
        }
    }
}, {
    tableName: 'attendance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'date'],
            name: 'unique_employee_date'
        }
    ]
});

// Define relationship
Attendance.belongsTo(Employee, {
    foreignKey: 'employeeId',
    as: 'employee',
    onDelete: 'CASCADE'
});

Employee.hasMany(Attendance, {
    foreignKey: 'employeeId',
    as: 'attendanceRecords'
});

module.exports = Attendance;
