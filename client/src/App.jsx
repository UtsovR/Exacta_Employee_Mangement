import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import PrivateRoute from '@/components/PrivateRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const Login = lazy(() => import('@/pages/Login'));
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const EmployeesPage = lazy(() => import('@/pages/EmployeesPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const EmployeeLayout = lazy(() => import('@/components/layout/EmployeeLayout'));
const EmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
const EmployeeProfile = lazy(() => import('@/pages/EmployeeProfile'));
const EmployeeActivity = lazy(() => import('@/pages/EmployeeActivity'));
const EmployeeNotifications = lazy(() => import('@/pages/EmployeeNotifications'));
const EmployeeSupport = lazy(() => import('@/pages/EmployeeSupport'));

const RouteLoader = () => (
    <div className="flex min-h-screen items-center justify-center bg-brand-gray-light">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand-blue-DEFAULT" />
    </div>
);

const LoginRoute = () => {
    const { loading, session } = useAuth();

    if (loading) {
        return <RouteLoader />;
    }

    return session ? <Navigate to="/" replace /> : <Login />;
};

const HomeRoute = () => {
    const { loading, user } = useAuth();

    if (loading) {
        return <RouteLoader />;
    }

    if (!user) {
        return <RouteLoader />;
    }

    if (user?.role === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/employee/dashboard" replace />;
};

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Suspense fallback={<RouteLoader />}>
                    <Routes>
                        <Route path="/login" element={<LoginRoute />} />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <PrivateRoute roles={['ADMIN']}>
                                        <AdminLayout />
                                    </PrivateRoute>
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="employees" element={<EmployeesPage />} />
                            <Route path="reports" element={<ReportsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        <Route
                            path="/employee"
                            element={
                                <ProtectedRoute>
                                    <PrivateRoute roles={['EMPLOYEE']}>
                                        <EmployeeLayout />
                                    </PrivateRoute>
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/employee/dashboard" replace />} />
                            <Route path="dashboard" element={<EmployeeDashboard />} />
                            <Route path="profile" element={<EmployeeProfile />} />
                            <Route path="activity" element={<EmployeeActivity />} />
                            <Route path="notifications" element={<EmployeeNotifications />} />
                            <Route path="support" element={<EmployeeSupport />} />
                            <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
                        </Route>

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/employee/dashboard" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <HomeRoute />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
