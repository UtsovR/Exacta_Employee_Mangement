import { useState, useEffect } from 'react';
import Button from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { X, Lock, User, Briefcase, Calendar, Droplet, Hash, Mail } from 'lucide-react';

const EditEmployeeModal = ({ employee, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        empId: '',
        email: '',
        team: '',
        role: '',
        joiningDate: '',
        dob: '',
        bloodGroup: '',
        password: '' // Only for reset
    });

    const [resetPassword, setResetPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || '',
                empId: employee.empId || '',
                email: employee.email || '',
                team: employee.team || 'DEVELOPMENT',
                role: employee.role || 'EMPLOYEE',
                joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
                dob: employee.dob ? employee.dob.split('T')[0] : '',
                bloodGroup: employee.bloodGroup || '',
                password: ''
            });
        }
    }, [employee]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = { ...formData };
            if (!resetPassword) delete payload.password; // Don't send empty password if not resetting

            const res = await fetch(`/api/users/${employee.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update employee');

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full pl-10 pr-4 py-2 border border-brand-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-light transition-all";
    const labelClasses = "block text-xs font-semibold text-brand-gray-text mb-1 uppercase tracking-wide";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-brand-gray-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-brand-dark">Edit Employee Details</h2>
                        <p className="text-sm text-brand-gray-text">Update profile information for {employee?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-brand-gray-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center gap-2">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 🔐 Login & Access */}
                        <section className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-brand-blue-dark mb-4 flex items-center gap-2">
                                <Lock size={16} /> Login & Access
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Employee ID (Read Only)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-4 h-4" />
                                        <input
                                            value={formData.empId}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-border bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Password</label>
                                    {!resetPassword ? (
                                        <button
                                            type="button"
                                            onClick={() => setResetPassword(true)}
                                            className="w-full py-2 border border-dashed border-brand-blue-DEFAULT text-brand-blue-DEFAULT rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                                        >
                                            Reset Password
                                        </button>
                                    ) : (
                                        <div className="relative animate-in fade-in slide-in-from-top-2">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-4 h-4" />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="New Password"
                                                className={inputClasses}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setResetPassword(false); setFormData(p => ({ ...p, password: '' })); }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 px-2"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 👤 Personal Information */}
                        <section>
                            <h3 className="text-sm font-bold text-brand-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <User size={16} /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-4 h-4" />
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-4 h-4" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={inputClasses}
                                            placeholder="john@exacta.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-4 h-4" />
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className={inputClasses.replace('pl-10', 'pl-10')} // tiny fix
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Blood Group</label>
                                    <div className="relative">
                                        <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text w-4 h-4" />
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            className={inputClasses}
                                        >
                                            <option value="">Select</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 🏢 Work Details */}
                        <section>
                            <h3 className="text-sm font-bold text-brand-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Briefcase size={16} /> Work Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClasses}>Department</label>
                                    <select
                                        name="team"
                                        value={formData.team}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-3`} // Override padding
                                    >
                                        <option value="DEVELOPMENT">Development</option>
                                        <option value="CALLER">Caller</option>
                                        <option value="HR">HR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-3`}
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Joining Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-3`}
                                    />
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-brand-gray-border bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-brand-gray-border rounded-lg text-sm font-medium text-brand-gray-text hover:bg-white hover:text-brand-dark transition-all"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={loading}
                        className="px-8 bg-brand-blue-DEFAULT hover:bg-brand-blue-dark text-white shadow-lg shadow-blue-200"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
