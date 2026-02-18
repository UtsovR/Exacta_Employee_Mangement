import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const CreateUserForm = ({ onSuccess, onCancel }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        empId: '',
        password: '',
        team: 'DEVELOPMENT',
        joiningDate: new Date().toISOString().split('T')[0],
        dob: '',
        bloodGroup: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiRequest('/api/users', {
                method: 'POST',
                token,
                body: formData,
            });
            onSuccess();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBlur = (field) => {
        setTouched((previous) => ({ ...previous, [field]: true }));
    };

    const inputClasses = (field, isRequired = false) =>
        `w-full rounded-lg border px-3 py-2.5 text-sm transition-all bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-light ${
            isRequired && touched[field] && !formData[field]
                ? 'border-red-500'
                : 'border-brand-gray-border'
        }`;

    const labelClasses = 'mb-1.5 block text-sm font-semibold text-brand-dark';
    const fieldGroupClasses = 'space-y-1';

    const isFormValid =
        formData.name && formData.empId && formData.password && formData.team && formData.joiningDate;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span className="shrink-0 text-lg">!</span>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                <div className={fieldGroupClasses}>
                    <label className={labelClasses}>
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={inputClasses('name', true)}
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        onBlur={() => handleBlur('name')}
                        required
                    />
                    {touched.name && !formData.name && (
                        <p className="mt-1 text-xs text-red-500">Full name is required</p>
                    )}
                </div>

                <div className={fieldGroupClasses}>
                    <label className={labelClasses}>
                        Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={inputClasses('empId', true)}
                        placeholder="e.g. EMP001"
                        value={formData.empId}
                        onChange={(event) => setFormData({ ...formData, empId: event.target.value })}
                        onBlur={() => handleBlur('empId')}
                        required
                    />
                    {touched.empId && !formData.empId && (
                        <p className="mt-1 text-xs text-red-500">Employee ID is required</p>
                    )}
                </div>

                <div className={fieldGroupClasses}>
                    <label className={labelClasses}>
                        Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        className={inputClasses('password', true)}
                        placeholder="Set an initial password"
                        value={formData.password}
                        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                        onBlur={() => handleBlur('password')}
                        required
                    />
                    {touched.password && !formData.password && (
                        <p className="mt-1 text-xs text-red-500">Password is required</p>
                    )}
                </div>

                <div className={fieldGroupClasses}>
                    <label className={labelClasses}>
                        Department <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={inputClasses('team', true)}
                        value={formData.team}
                        onChange={(event) => setFormData({ ...formData, team: event.target.value })}
                        required
                    >
                        <option value="DEVELOPMENT">Development</option>
                        <option value="CALLER">Caller</option>
                    </select>
                </div>

                <div className={fieldGroupClasses}>
                    <label className={labelClasses}>
                        Date of Joining <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        className={inputClasses('joiningDate', true)}
                        value={formData.joiningDate}
                        onChange={(event) => setFormData({ ...formData, joiningDate: event.target.value })}
                        required
                    />
                </div>

                <div className={fieldGroupClasses}>
                    <label className={labelClasses}>Date of Birth</label>
                    <input
                        type="date"
                        className={inputClasses('dob')}
                        value={formData.dob}
                        onChange={(event) => setFormData({ ...formData, dob: event.target.value })}
                    />
                </div>

                <div className={fieldGroupClasses}>
                    <label className={labelClasses}>Blood Group</label>
                    <select
                        className={inputClasses('bloodGroup')}
                        value={formData.bloodGroup}
                        onChange={(event) => setFormData({ ...formData, bloodGroup: event.target.value })}
                    >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 border-t border-brand-gray-border pt-4">
                <Button
                    type="submit"
                    className="flex-1 justify-center rounded-lg bg-brand-blue-DEFAULT py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
                    isLoading={loading}
                    disabled={!isFormValid || loading}
                >
                    Save Employee
                </Button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-lg border border-brand-gray-border px-4 py-2.5 text-sm font-semibold text-brand-gray-text transition-colors hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CreateUserForm;
