const { Sequelize } = require('sequelize');
// dotenv is loaded by app.js or by Vercel in production

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
    process.env.DB_NAME || 'hrms_lite',
    process.env.DB_USER || 'phpmyadmin',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
        // TiDB Cloud requires SSL
        dialectOptions: isProduction ? {
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: false
            }
        } : {}
    }
);

module.exports = sequelize;

