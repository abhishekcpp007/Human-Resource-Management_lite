import { useState, useCallback, useEffect } from 'react';
import { Modal, LoadingState, ErrorState, EmptyState, Toast, Pagination } from '../components/common';
import { employeeAPI } from '../services/api';

const AddEmployeeForm = ({ onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        department: '',
        
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.department.trim()) newErrors.department = 'Department is required';
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="label">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`input ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g., John Doe"
                />
                {errors.fullName && <p className="text-error-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div>
                <label className="label">Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="e.g., john.doe@company.com"
                />
                {errors.email && <p className="text-error-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
                <label className="label">Department</label>
                <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`input ${errors.department ? 'input-error' : ''}`}
                    placeholder="e.g., Engineering"
                />
                {errors.department && <p className="text-error-400 text-xs mt-1">{errors.department}</p>}
            </div>

            
            <div className="flex gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <div className="spinner w-4 h-4" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Employee
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const DeleteConfirmModal = ({ employee, onConfirm, onCancel, isDeleting }) => {
    return (
        <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Archive Employee</h3>
            <p className="text-[var(--text-tertiary)] mb-6">
                Are you sure you want to archive <strong className="text-[var(--text-secondary)]">{employee?.name}</strong>?
                The employee record will be hidden but can be restored later.
            </p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="btn btn-secondary flex-1">
                    Cancel
                </button>
                <button onClick={onConfirm} className="btn btn-danger flex-1" disabled={isDeleting}>
                    {isDeleting ? 'Archiving...' : 'Archive'}
                </button>
            </div>
        </div>
    );
};

const Employees = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteEmployee, setDeleteEmployee] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
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

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = { page, limit };
            if (searchTerm) params.search = searchTerm;
            const response = await employeeAPI.getAll(params);
            setEmployees(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotal(response.total || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleAddEmployee = async (data) => {
        setIsSubmitting(true);
        try {
            // Transform fullName to name for API
            const apiData = {
                ...data,
                name: data.fullName,
                joinDate: new Date().toISOString().split('T')[0]
            };
            delete apiData.fullName;
            await employeeAPI.create(apiData);
            setIsAddModalOpen(false);
            showToast('Employee added successfully!', 'success');
            fetchEmployees();
        } catch (err) {
            showToast(err.message || 'Failed to add employee', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEmployee = async () => {
        if (!deleteEmployee) return;
        setIsSubmitting(true);
        try {
            await employeeAPI.delete(deleteEmployee.id);
            setDeleteEmployee(null);
            showToast('Employee archived successfully!', 'success');
            fetchEmployees();
        } catch (err) {
            showToast(err.message || 'Failed to archive employee', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && page === 1 && !searchTerm) return <LoadingState message="Loading employees..." />;
    if (error) return <ErrorState message={error} onRetry={fetchEmployees} />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">Employees</h1>
                    <p className="text-[var(--text-tertiary)]">Manage your employee records</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Employee
                </button>
            </div>

            {/* Search - Dark style matching reference design */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12"
                />
            </div>

            {/* Employee List */}
            {employees.length === 0 ? (
                <EmptyState
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                    title={searchTerm ? 'No employees found' : 'No employees yet'}
                    description={searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first employee'}
                    actionLabel={!searchTerm ? 'Add Employee' : null}
                    onAction={!searchTerm ? () => setIsAddModalOpen(true) : null}
                />
            ) : (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Joined</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {employee.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">{employee.name}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{employee.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-[var(--text-secondary)]">{employee.email}</td>
                                        <td>
                                            <span className="badge badge-info">{employee.department}</span>
                                        </td>
                                        <td className="text-[var(--text-muted)] text-sm">
                                            {new Date(employee.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => setDeleteEmployee(employee)}
                                                className="btn btn-ghost btn-icon text-warning-400 hover:text-warning-300 hover:bg-warning-500/10"
                                                title="Archive employee"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
                                            </button>
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

            {/* Add Employee Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
                <AddEmployeeForm
                    onSubmit={handleAddEmployee}
                    onCancel={() => setIsAddModalOpen(false)}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteEmployee} onClose={() => setDeleteEmployee(null)} title="Confirm Archive" size="sm">
                <DeleteConfirmModal
                    employee={deleteEmployee}
                    onConfirm={handleDeleteEmployee}
                    onCancel={() => setDeleteEmployee(null)}
                    isDeleting={isSubmitting}
                />
            </Modal>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
};

export default Employees;
