import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI, employeeAPI, attendanceAPI } from '../services/api';

// Dashboard hook
export const useDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dashboardAPI.getStats();
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// Employees hook
export const useEmployees = (params = {}) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await employeeAPI.getAll(params);
            setEmployees(response.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const addEmployee = async (data) => {
        const response = await employeeAPI.create(data);
        await fetchEmployees();
        return response;
    };

    const deleteEmployee = async (id) => {
        const response = await employeeAPI.delete(id);
        await fetchEmployees();
        return response;
    };

    return { employees, loading, error, refetch: fetchEmployees, addEmployee, deleteEmployee };
};

// Attendance hook
export const useAttendance = (params = {}) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await attendanceAPI.getAll(params);
            setAttendance(response.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const markAttendance = async (data) => {
        const response = await attendanceAPI.mark(data);
        await fetchAttendance();
        return response;
    };

    return { attendance, loading, error, refetch: fetchAttendance, markAttendance };
};

// Employee attendance hook
export const useEmployeeAttendance = (employeeId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!employeeId) return;
        try {
            setLoading(true);
            setError(null);
            const response = await attendanceAPI.getByEmployee(employeeId);
            setData(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// Departments hook
export const useDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await employeeAPI.getDepartments();
                setDepartments(response.data || []);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    return { departments, loading };
};

// Toast notification hook
export const useToast = () => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const hideToast = useCallback(() => setToast(null), []);

    return { toast, showToast, hideToast };
};
