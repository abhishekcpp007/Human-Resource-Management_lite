const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const seedAttendance = async () => {
    try {
        // Clear existing attendance
        await Attendance.destroy({ where: {}, force: true });

        // Get all employees
        const employees = await Employee.findAll({ where: { deletedAt: null } });

        if (employees.length === 0) {
            console.log('No employees found. Please seed employees first.');
            return [];
        }

        const attendanceRecords = [];
        const today = new Date();

        // Generate attendance for last 30 days
        for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
            const date = new Date(today);
            date.setDate(date.getDate() - dayOffset);

            // Skip weekends
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            const dateStr = date.toISOString().split('T')[0];

            for (const employee of employees) {
                // Random attendance: 85% present, 15% absent
                const isPresent = Math.random() > 0.15;

                attendanceRecords.push({
                    employeeId: employee.id,
                    date: dateStr,
                    status: isPresent ? 'Present' : 'Absent'
                });
            }
        }

        // Insert attendance records
        const created = await Attendance.bulkCreate(attendanceRecords, {
            ignoreDuplicates: true
        });

        console.log(`✓ Created ${created.length} attendance records`);
        return created;
    } catch (error) {
        console.error('Error seeding attendance:', error);
        throw error;
    }
};

module.exports = { seedAttendance };
