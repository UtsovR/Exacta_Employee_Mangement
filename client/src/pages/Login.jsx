import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Lock, User } from 'lucide-react';
import Button from '../components/ui/Button';

const Login = () => {
    const [empId, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(empId, password);
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            console.error('[Login] Login failure:', err.message);
            setError(err.message || 'Unable to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-gray-light flex flex-col justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-brand-gray-border">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-blue-highlight rounded-full flex items-center justify-center mx-auto mb-4 text-brand-blue-dark">
                        <Briefcase size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-dark">Exacta Break Tracker</h1>
                    <p className="text-brand-gray-text mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Employee ID</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-5 h-5" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-brand-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:border-transparent transition-all"
                                placeholder="Enter your ID"
                                value={empId}
                                onChange={(e) => setEmpId(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-5 h-5" />
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border border-brand-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:border-transparent transition-all"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full justify-center"
                        size="lg"
                        isLoading={isLoading}
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs text-brand-gray-text">
                    &copy; 2024 Exacta Web Solutions. Internal Use Only.
                </div>
            </div>
        </div>
    );
};

export default Login;
