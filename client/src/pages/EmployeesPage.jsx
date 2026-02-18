import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import EditEmployeeModal from '../components/EditEmployeeModal';
import CreateUserForm from '../components/CreateUserForm';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import { Mail, Edit, Search, Users, Plus } from 'lucide-react';

const EmployeeCard = ({ employee, onEdit }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-brand-gray-border overflow-hidden hover:shadow-md transition-shadow group">
            {/* ... card content ... */}
            <div className="p-6 pb-4 flex items-start justify-between">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-brand-blue-highlight text-brand-blue-dark flex items-center justify-center font-bold text-lg mr-4 overflow-hidden">
                        {employee.profilePhoto ? (
                            <img src={employee.profilePhoto} alt={employee.name} className="w-full h-full object-cover" />
                        ) : (
                            employee.name?.charAt(0) || '?'
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark text-lg">{employee.name}</h3>
                        <p className="text-sm text-brand-gray-text">{employee.role}</p>
                    </div>
                </div>
                {/* ... */}
            </div>

            {/* ... middle content ... */}
            <div className="px-6 py-2">
                <div className="flex items-center text-sm text-brand-gray-text mb-2">
                    <Mail size={14} className="mr-2" />
                    {employee.email || 'No email provided'}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-brand-dark">Team:</span>
                    <span className="text-sm text-brand-gray-text">{employee.team || 'Unassigned'}</span>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-gray-border flex items-center justify-between bg-gray-50/50">
                <div>
                    <span className="text-xs text-brand-gray-text uppercase tracking-wider font-semibold block mb-1">Status</span>
                    <Badge variant={
                        employee.currentStatus === 'WORKING' ? 'working' :
                            employee.currentStatus === 'ON_BREAK' ? 'break' : 'neutral'
                    }>
                        {employee.currentStatus?.replace('_', ' ')}
                    </Badge>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(employee)}
                        className="p-2 hover:bg-white rounded border border-transparent hover:border-brand-gray-border text-brand-gray-text hover:text-brand-blue-DEFAULT transition-all shadow-sm"
                    >
                        <Edit size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const EmployeesPage = () => {
    const { user, token } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [filterTeam, setFilterTeam] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null); // New State
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await fetch('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const filteredEmployees = employees.filter(emp => {
        const matchesTeam = filterTeam === 'All' || emp.team === filterTeam;
        const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
        return matchesTeam && matchesSearch;
    });

    const teams = ['All', ...new Set(employees.map(e => e.team).filter(Boolean))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-dark">Employees</h1>
                    <p className="text-brand-gray-text">Manage your team members and their roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="pl-9 pr-4 py-2 border border-brand-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-light w-full sm:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="pl-3 pr-8 py-2 border border-brand-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-light bg-white"
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                    >
                        {teams.map(t => <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>)}
                    </select>
                    {user?.role === 'ADMIN' && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="shadow-sm hover:shadow-md transition-all whitespace-nowrap bg-brand-blue-DEFAULT hover:bg-brand-blue-dark text-white"
                        >
                            ➕ Add Employee
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid or Empty State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-DEFAULT"></div>
                </div>
            ) : filteredEmployees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployees.map(emp => (
                        <EmployeeCard key={emp.id} employee={emp} onEdit={setEditingEmployee} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-dashed border-brand-gray-border p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-brand-gray-light rounded-full flex items-center justify-center mb-4">
                        <Users className="text-brand-gray-text" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark mb-2">No employees found</h3>
                    <p className="text-brand-gray-text mb-6 max-w-xs">
                        {search
                            ? `We couldn't find any employees matching "${search}".`
                            : "Start by adding your first employee to the system."}
                    </p>
                    {user?.role === 'ADMIN' && (
                        <Button
                            icon={Plus}
                            onClick={() => setShowCreateModal(true)}
                        >
                            Add Employee
                        </Button>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    {/* ... Existing Create Modal Content ... */}
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative border border-brand-gray-border animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-6 right-6 text-brand-gray-text hover:text-brand-dark transition-colors p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Plus className="rotate-45" size={24} />
                        </button>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-brand-dark">Add New Employee</h2>
                            <p className="text-brand-gray-text text-sm">Fill in the details below to create a new employee profile.</p>
                        </div>
                        <CreateUserForm
                            onSuccess={() => {
                                setShowCreateModal(false);
                                fetchEmployees();
                                setToast({ message: 'Employee added successfully!', type: 'success' });
                            }}
                            onCancel={() => setShowCreateModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingEmployee && (
                <EditEmployeeModal
                    employee={editingEmployee}
                    onClose={() => setEditingEmployee(null)}
                    onSuccess={() => {
                        setEditingEmployee(null);
                        fetchEmployees();
                        setToast({ message: 'Employee details updated successfully', type: 'success' });
                    }}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default EmployeesPage;
