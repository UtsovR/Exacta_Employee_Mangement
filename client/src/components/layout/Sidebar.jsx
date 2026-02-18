import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileBarChart, LogOut, User, Bell, HelpCircle, History, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'ADMIN';

    const adminItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Employees', path: '/admin/employees' },
        { icon: FileBarChart, label: 'Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    const employeeItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/employee/dashboard' },
        { icon: User, label: 'My Profile', path: '/employee/profile' },
        { icon: History, label: 'My Activity', path: '/employee/activity' },
        { icon: Bell, label: 'Notifications', path: '/employee/notifications' },
        { icon: HelpCircle, label: 'Help / Support', path: '/employee/support' },
    ];

    const navItems = isAdmin ? adminItems : employeeItems;

    return (
        <aside className="w-64 bg-white border-r border-brand-gray-border h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
            {/* Logo Section */}
            <div className="p-6 border-b border-brand-gray-border flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-blue-DEFAULT rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
                    E
                </div>
                <div>
                    <h1 className="text-xl font-bold text-brand-dark tracking-tight leading-none">Exacta</h1>
                    <p className="text-xs font-medium text-brand-gray-text mt-0.5">Workspace</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group relative overflow-hidden',
                                isActive
                                    ? 'bg-brand-blue-highlight text-brand-blue-dark'
                                    : 'text-brand-gray-text hover:bg-gray-50 hover:text-brand-dark'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue-DEFAULT rounded-r-full" />
                                )}
                                <item.icon className={clsx("w-5 h-5 mr-3 transition-colors", isActive ? "text-brand-blue-DEFAULT" : "text-gray-400 group-hover:text-gray-600")} />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom User Section */}
            <div className="p-4 border-t border-brand-gray-border bg-gray-50/50">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-blue-dark font-bold shadow-sm">
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-semibold text-brand-dark truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-brand-gray-text capitalize truncate">{user?.role?.toLowerCase() || 'employee'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-white border border-brand-gray-border rounded-lg text-sm font-medium text-brand-gray-text hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
