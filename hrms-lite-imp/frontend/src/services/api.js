import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error || error.message || 'Something went wrong';
        return Promise.reject({ message, details: error.response?.data?.details });
    }
);

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard'),
};

// Employee API
export const employeeAPI = {
    getAll: (params) => api.get('/employees', { params }),
    getById: (id) => api.get(`/employees/${id}`),
    create: (data) => api.post('/employees', data),
    delete: (id) => api.delete(`/employees/${id}`),
    getDepartments: () => api.get('/employees/departments'),
    getStats: () => api.get('/employees/stats'),
};

// Attendance API
export const attendanceAPI = {
    getAll: (params) => api.get('/attendance', { params }),
    getToday: () => api.get('/attendance/today'),
    getSummary: () => api.get('/attendance/summary'),
    getByEmployee: (id, params) => api.get(`/attendance/employee/${id}`, { params }),
    mark: (data) => api.post('/attendance', data),
};

export default api;
