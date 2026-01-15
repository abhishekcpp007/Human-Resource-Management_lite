# HRMS Lite - Human Resource Management System

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

![HRMS Lite Dashboard](https://via.placeholder.com/800x400?text=HRMS+Lite+Dashboard)

## Live Demo

- **Frontend URL**: [To be deployed on Vercel]
- **Backend API**: [To be deployed on Render]

## Features

### Employee Management
- Add new employees with Employee ID, Full Name, Email, and Department
- View all employees in a searchable table
- Delete employees (with cascade deletion of attendance records)

### Attendance Management
- Mark daily attendance (Present/Absent) for any employee
- Filter attendance records by date and status
- View attendance summary for each employee

### Dashboard
- Total employees count
- Today's attendance statistics (Present, Absent, Not Marked)
- Department-wise employee distribution
- Recent activity feed

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL with Sequelize ORM |
| **Styling** | Tailwind CSS with custom dark theme |

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd hrms-lite/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your database credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hrms_lite
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
CORS_ORIGIN=http://localhost:5173
```

4. Create the database:
```bash
mysql -u your_user -p -e "CREATE DATABASE hrms_lite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd hrms-lite/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Documentation

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Add new employee |
| GET | `/api/employees/:id` | Get single employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/departments` | List unique departments |
| GET | `/api/employees/stats` | Get employee statistics |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance records |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/today` | Get today's attendance |
| GET | `/api/attendance/employee/:id` | Get employee's attendance |
| GET | `/api/attendance/summary` | Get attendance summary |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

## Project Structure

```
hrms-lite/
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   └── index.css        # Tailwind CSS styles
│   └── package.json
│
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Sequelize models
│   │   └── routes/          # API routes
│   └── package.json
│
└── README.md
```

## Assumptions & Limitations

1. **Single Admin User**: No authentication required (as per requirements)
2. **No Edit Functionality**: Only Add/View/Delete operations
3. **Date Format**: Using YYYY-MM-DD format
4. **Employee ID**: Admin-provided unique identifier
5. **No Bulk Operations**: Attendance marked one at a time
6. **No Export**: CSV/PDF export out of scope

## Bonus Features Implemented

- [x] Filter attendance records by date
- [x] Display total present days per employee
- [x] Basic dashboard summary with counts and charts

## Screenshots

### Dashboard
Modern dark-themed dashboard with stats cards and activity feed.

### Employee Management
Add, view, and delete employees with search functionality.

### Attendance Tracking
Mark attendance with status selection and date filtering.

---

Built with React, Node.js, and MySQL
