import { useDashboard } from '../hooks/useData';
import { LoadingState, ErrorState } from '../components/common';

const StatCard = ({ title, value, icon, color, subValue }) => {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600 shadow-primary-500/25',
        success: 'from-success-500 to-success-600 shadow-success-500/25',
        danger: 'from-error-500 to-error-600 shadow-error-500/25',
        warning: 'from-warning-500 to-warning-600 shadow-warning-500/25',
        accent: 'from-accent-500 to-accent-600 shadow-accent-500/25',
    };

    return (
        <div className="stat-card group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[var(--text-tertiary)] text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-1">{value}</p>
                    {subValue && (
                        <p className="text-xs text-[var(--text-muted)]">{subValue}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { data, loading, error, refetch } = useDashboard();

    if (loading) return <LoadingState message="Loading dashboard..." />;
    if (error) return <ErrorState message={error} onRetry={refetch} />;

    const stats = data?.stats || {};
    const { totalEmployees, presentToday, absentToday, notMarked, date } = stats;
    const departments = data?.departments || [];
    const recentAttendance = data?.recentAttendance || [];
    const recentEmployees = data?.recentEmployees || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
                <p className="text-[var(--text-tertiary)]">Welcome back! Here's your HR overview for today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={totalEmployees || 0}
                    color="primary"
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Present Today"
                    value={presentToday || 0}
                    subValue={date || new Date().toISOString().split('T')[0]}
                    color="success"
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Absent Today"
                    value={absentToday || 0}
                    color="danger"
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Not Marked"
                    value={notMarked || 0}
                    color="warning"
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Departments */}
                <div className="card">
                    <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Departments
                    </h2>
                    {departments && departments.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                            {departments.map((dept, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-tertiary)] hover:bg-[var(--interactive-hover)] transition-colors">
                                    <span className="text-[var(--text-secondary)] font-medium">{dept.department}</span>
                                    <span className="text-sm text-primary-500 dark:text-primary-400 font-semibold">{dept.count} employees</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text-muted)] text-sm text-center py-8">No departments yet</p>
                    )}
                </div>

                {/* Recent Attendance */}
                <div className="card">
                    <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-success-500 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Recent Activity
                    </h2>
                    {recentAttendance && recentAttendance.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                            {recentAttendance.map((record, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-tertiary)] hover:bg-[var(--interactive-hover)] transition-colors">
                                    <div>
                                        <p className="text-[var(--text-secondary)] font-medium">{record.employee?.name || 'Unknown'}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{record.date}</p>
                                    </div>
                                    <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text-muted)] text-sm text-center py-8">No attendance records yet</p>
                    )}
                </div>
            </div>

            {/* Recent Employees */}
            <div className="card">
                <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Recently Added Employees
                </h2>
                {recentEmployees && recentEmployees.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto pr-2 scrollbar-thin">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentEmployees.map((emp) => (
                                <div key={emp.id} className="p-4 rounded-xl bg-[var(--surface-tertiary)] hover:bg-[var(--interactive-hover)] transition-colors border border-[var(--border-subtle)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                                            {emp.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[var(--text-primary)] font-medium truncate">{emp.name}</p>
                                            <p className="text-xs text-[var(--text-muted)] truncate">{emp.department}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-[var(--text-muted)] text-sm text-center py-8">No employees added yet</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
