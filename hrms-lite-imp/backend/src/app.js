const express = require('express');
const cors = require('cors');

// Load dotenv only in development - Vercel provides env vars in production
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv').config();
    } catch (e) {
        console.log('dotenv not available, using process.env directly');
    }
}

const sequelize = require('./config/database');
const { employeeRoutes, attendanceRoutes, dashboardRoutes } = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

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

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Database sync (for serverless, sync on first request)
let dbInitialized = false;
const initDb = async () => {
    if (!dbInitialized) {
        try {
            await sequelize.authenticate();
            // Use force: false to only create tables if they don't exist
            // This avoids alter table conflicts with foreign keys
            await sequelize.sync({ force: false });
            dbInitialized = true;
            console.log('Database connected and synced');
        } catch (error) {
            console.error('Database connection error:', error);
        }
    }
};

// Initialize database connection
initDb();

// Start server only in development (not for serverless)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    const startServer = async () => {
        try {
            await sequelize.authenticate();
            console.log('Database connected successfully');
            // Use force: false to only create tables if they don't exist
            await sequelize.sync({ force: false });
            console.log('Database synced');

            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
                console.log(`API Health: http://localhost:${PORT}/api/health`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };
    startServer();
}

module.exports = app;
