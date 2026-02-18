import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import PrivateRoute from '@/components/PrivateRoute';

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

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Suspense fallback={<RouteLoader />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route
                            path="/admin"
                            element={
                                <PrivateRoute roles={['ADMIN']}>
                                    <AdminLayout />
                                </PrivateRoute>
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
                                <PrivateRoute roles={['EMPLOYEE']}>
                                    <EmployeeLayout />
                                </PrivateRoute>
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

                        <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
