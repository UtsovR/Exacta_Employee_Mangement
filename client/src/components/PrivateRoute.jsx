import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    // Debug logging for troubleshooting
    // console.log("PrivateRoute Check:", { user, isAuthenticated, loading, roles, path: window.location.pathname });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-gray-light text-brand-blue-dark font-bold">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-DEFAULT mr-3"></div>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // console.log("PrivateRoute: Role mismatch", { userRole: user?.role, required: roles });
        // Redirect logic based on role to prevent infinite loops if they try to access wrong dashboard
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
