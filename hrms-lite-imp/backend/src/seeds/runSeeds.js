const sequelize = require('../config/database');
const { seedEmployees } = require('./employeeSeed');
const { seedAttendance } = require('./attendanceSeed');

const runSeeds = async () => {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('✓ Models synchronized\n');

        // Seed employees
        console.log('📋 Seeding employees...');
        await seedEmployees();

        // Seed attendance
        console.log('\n📅 Seeding attendance...');
        await seedAttendance();

        console.log('\n✅ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
};

runSeeds();
