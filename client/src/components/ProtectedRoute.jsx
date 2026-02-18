import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-gray-light text-brand-blue-dark font-bold">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-DEFAULT mr-3"></div>
                Loading...
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
