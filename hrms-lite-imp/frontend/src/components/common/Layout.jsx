import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-dark-950">
            {/* Background gradient effect */}
            <div className="fixed inset-0 bg-gradient-to-br from-primary-950/20 via-dark-950 to-secondary-950/10 pointer-events-none" />
            <div className="fixed top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl pointer-events-none" />

            <Sidebar />

            <main className="ml-64 min-h-screen relative">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
