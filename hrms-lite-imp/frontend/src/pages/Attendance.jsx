import { useState, useEffect, useCallback } from 'react';
import { Modal, LoadingState, ErrorState, EmptyState, Toast, DatePicker, Pagination, Select } from '../components/common';
import { employeeAPI, attendanceAPI } from '../services/api';

const MarkAttendanceForm = ({ onSubmit, onCancel, isSubmitting }) => {
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [formData, setFormData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await employeeAPI.getAll({ limit: 1000 });
                setEmployees(response.data || []);
            } catch (err) {
                console.error('Failed to fetch employees:', err);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({ ...prev, date }));
        if (errors.date) {
            setErrors((prev) => ({ ...prev, date: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.employeeId) newErrors.employeeId = 'Please select an employee';
        if (!formData.date) newErrors.date = 'Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                employeeId: parseInt(formData.employeeId),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="label">Employee</label>
                {loadingEmployees ? (
                    <div className="input flex items-center justify-center">
                        <div className="spinner w-5 h-5" />
                    </div>
                ) : (
                    <Select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="Select an employee"
                        error={errors.employeeId}
                        options={employees.map((emp) => ({
                            value: emp.id,
                            label: `${emp.name} (${emp.employeeId})`
                        }))}
                    />
                )}
            </div>

            <div>
                <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                    placeholder="Select attendance date"
                />
                {errors.date && <p className="text-error-400 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
                <label className="label">Status</label>
                <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${formData.status === 'Present'
                        ? 'bg-success-500/20 border-success-500/50 text-success-400'
                        : 'bg-[var(--surface-tertiary)] border-[var(--border-primary)] text-[var(--text-tertiary)] hover:border-[var(--text-muted)]'
                        }`}>
                        <input
                            type="radio"
                            name="status"
                            value="Present"
                            checked={formData.status === 'Present'}
                            onChange={handleChange}
                            className="sr-only"
                        />
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Present
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${formData.status === 'Absent'
                        ? 'bg-error-500/20 border-error-500/50 text-error-400'
                        : 'bg-[var(--surface-tertiary)] border-[var(--border-primary)] text-[var(--text-tertiary)] hover:border-[var(--text-muted)]'
                        }`}>
                        <input
                            type="radio"
                            name="status"
                            value="Absent"
                            checked={formData.status === 'Absent'}
                            onChange={handleChange}
                            className="sr-only"
                        />
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Absent
                    </label>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting || loadingEmployees}>
                    {isSubmitting ? (
                        <>
                            <div className="spinner w-4 h-4" />
                            Marking...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark Attendance
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const Attendance = () => {
    const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [toast, setToast] = useState(null);
    const limit = 10;

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const hideToast = () => setToast(null);

    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = { page, limit };
            if (dateFilter) params.date = dateFilter;
            if (statusFilter) params.status = statusFilter;
            const response = await attendanceAPI.getAll(params);
            setAttendance(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotal(response.total || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, limit, dateFilter, statusFilter]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    useEffect(() => {
        setPage(1);
    }, [dateFilter, statusFilter]);

    const handleMarkAttendance = async (data) => {
        setIsSubmitting(true);
        try {
            await attendanceAPI.mark(data);
            setIsMarkModalOpen(false);
            showToast('Attendance marked successfully!', 'success');
            fetchAttendance();
        } catch (err) {
            showToast(err.message || 'Failed to mark attendance', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearFilters = () => {
        setDateFilter('');
        setStatusFilter('');
    };

    if (loading && page === 1 && !dateFilter && !statusFilter) return <LoadingState message="Loading attendance records..." />;
    if (error) return <ErrorState message={error} onRetry={fetchAttendance} />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">Attendance</h1>
                    <p className="text-[var(--text-tertiary)]">Track and manage employee attendance</p>
                </div>
                <button onClick={() => setIsMarkModalOpen(true)} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Mark Attendance
                </button>
            </div>

            {/* Filters - Simplified design */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <DatePicker
                        label="Filter by Date"
                        value={dateFilter}
                        onChange={setDateFilter}
                        placeholder="Select a date"
                    />
                </div>
                <div className="flex-1">
                    <Select
                        label="Filter by Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        placeholder="All Status"
                        options={[
                            { value: '', label: 'All Status' },
                            { value: 'Present', label: 'Present' },
                            { value: 'Absent', label: 'Absent' }
                        ]}
                    />
                </div>
                {(dateFilter || statusFilter) && (
                    <div className="flex items-end">
                        <button onClick={clearFilters} className="btn btn-ghost">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Attendance List */}
            {attendance.length === 0 ? (
                <EmptyState
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                    title={dateFilter || statusFilter ? 'No records found' : 'No attendance records yet'}
                    description={dateFilter || statusFilter ? 'Try adjusting your filters' : 'Start by marking attendance for employees'}
                    action={
                        (dateFilter || statusFilter) ? (
                            <button onClick={clearFilters} className="btn btn-secondary">
                                Clear Filters
                            </button>
                        ) : null
                    }
                    actionLabel={!dateFilter && !statusFilter ? 'Mark Attendance' : null}
                    onAction={!dateFilter && !statusFilter ? () => setIsMarkModalOpen(true) : null}
                />
            ) : (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Marked On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {record.employee?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">{record.employee?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{record.employee?.employeeId || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-[var(--text-secondary)] font-medium">
                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td>
                                            <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                                                {record.status === 'Present' ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="text-[var(--text-muted)] text-sm">
                                            {new Date(record.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={limit}
                        onPageChange={setPage}
                    />
                </>
            )}

            {/* Mark Attendance Modal */}
            <Modal isOpen={isMarkModalOpen} onClose={() => setIsMarkModalOpen(false)} title="Mark Attendance">
                <MarkAttendanceForm
                    onSubmit={handleMarkAttendance}
                    onCancel={() => setIsMarkModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
};

export default Attendance;
