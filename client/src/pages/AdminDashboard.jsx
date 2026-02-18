import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { apiRequest } from '@/lib/api';
import StatCard from '../components/ui/StatCard';
import EmployeeStatusTable from '../components/dashboard/EmployeeStatusTable';
import CreateUserForm from '../components/CreateUserForm';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { Users, Briefcase, Coffee, AlertTriangle, Plus, LayoutDashboard, Calendar, FileCheck } from 'lucide-react';
import AdminLeaveManager from '../components/admin/AdminLeaveManager';
import AdminAttendanceManager from '../components/admin/AdminAttendanceManager';
import clsx from 'clsx';

const AdminDashboard = () => {
  const { token } = useAuth();
  const socket = useSocket();
  const [employees, setEmployees] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('LIVE_STATUS'); // LIVE_STATUS, ATTENDANCE, LEAVES

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await apiRequest('/api/users', { token });
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleRealtimeUpdate = () => {
      fetchEmployees();
    };

    socket.on('statusUpdate', handleRealtimeUpdate);
    socket.on('globalStatusUpdate', handleRealtimeUpdate);

    return () => {
      socket.off('statusUpdate', handleRealtimeUpdate);
      socket.off('globalStatusUpdate', handleRealtimeUpdate);
    };
  }, [fetchEmployees, socket]);

  // Stats Calculation
  const stats = useMemo(() => {
    const total = employees.length;
    const working = employees.filter(e => e.currentStatus === 'WORKING').length;
    const onBreak = employees.filter(e => e.currentStatus === 'ON_BREAK').length;
    const lunch = employees.filter(e => e.currentStatus === 'LUNCH').length;

    return { total, working, onBreak, lunch };
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Admin Dashboard</h1>
          <p className="text-brand-gray-text">Real-time overview of employee status and activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={Plus}
            className="shadow-md hover:shadow-lg transition-all"
          >
            Add Employee
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-brand-gray-border w-fit">
        <button
          onClick={() => setActiveTab('LIVE_STATUS')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'LIVE_STATUS'
              ? "bg-brand-blue-DEFAULT text-white shadow-md shadow-blue-100"
              : "text-brand-gray-text hover:bg-gray-50"
          )}
        >
          <LayoutDashboard size={18} />
          Live Status
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'ATTENDANCE'
              ? "bg-brand-blue-DEFAULT text-white shadow-md shadow-blue-100"
              : "text-brand-gray-text hover:bg-gray-50"
          )}
        >
          <Calendar size={18} />
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('LEAVES')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'LEAVES'
              ? "bg-brand-blue-DEFAULT text-white shadow-md shadow-blue-100"
              : "text-brand-gray-text hover:bg-gray-50"
          )}
        >
          <FileCheck size={18} />
          Leave Requests
        </button>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'LIVE_STATUS' && (
        <div className="animate-in fade-in duration-300">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Employees"
              value={stats.total}
              icon={Users}
              color="blue"
              subtext="Registered in system"
            />
            <StatCard
              title="Currently Working"
              value={stats.working}
              icon={Briefcase}
              color="green"
              subtext="Active status"
            />
            <StatCard
              title="On Break"
              value={stats.onBreak}
              icon={Coffee}
              color="yellow"
              subtext="Currently away"
            />
            <StatCard
              title="On Lunch"
              value={stats.lunch}
              icon={AlertTriangle}
              color="red"
              subtext="On timed lunch"
            />
          </div>

          <div className="h-[600px]">
            <EmployeeStatusTable
              employees={employees}
              onAddEmployee={() => setShowCreateModal(true)}
            />
          </div>
        </div>
      )}

      {activeTab === 'ATTENDANCE' && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <AdminAttendanceManager />
        </div>
      )}

      {activeTab === 'LEAVES' && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <AdminLeaveManager />
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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

export default AdminDashboard;
