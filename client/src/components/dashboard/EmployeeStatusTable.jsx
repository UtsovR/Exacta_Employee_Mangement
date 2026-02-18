import { useState, useEffect } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Plus, Search, MoreVertical, UserX } from 'lucide-react';
import clsx from 'clsx';

const StatusTimer = ({ startTime, status }) => {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval;
        const isActive = status === 'ON_BREAK' || status === 'LUNCH';
        if (isActive && startTime) {
            const start = new Date(startTime).getTime();
            // Update immediately
            const update = () => {
                const now = new Date().getTime();
                setDuration(Math.max(0, Math.floor((now - start) / 1000)));
            };
            update();
            interval = setInterval(update, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [startTime, status]);

    if (status !== 'ON_BREAK' && status !== 'LUNCH') return <span className="text-gray-400">-</span>;

    const mins = Math.floor(duration / 60);
    const secs = duration % 60;

    // Color code if overdue (assuming 15 mins break)
    const isOverdue = status === 'ON_BREAK' && duration > 900; // 15 mins

    return (
        <span className={clsx("font-mono font-medium", isOverdue ? "text-red-600 fire-animation" : "text-brand-dark")}>
            {mins}m {secs.toString().padStart(2, '0')}s
        </span>
    );
};

const EmployeeStatusTable = ({ employees, onAddEmployee }) => {
    const [filterTeam, setFilterTeam] = useState('All');
    const [search, setSearch] = useState('');

    const filteredEmployees = employees.filter(emp => {
        const matchesTeam = filterTeam === 'All' || emp.team === filterTeam;
        const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
        return matchesTeam && matchesSearch;
    });

    // Unique teams
    const teams = ['All', ...new Set(employees.map(e => e.team).filter(Boolean))];

    const getStatusVariant = (status) => {
        switch (status) {
            case 'WORKING': return 'working';
            case 'ON_BREAK': return 'break';
            case 'LUNCH': return 'neutral'; // Or custom lunch color
            default: return 'neutral';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-brand-gray-border flex flex-col h-full">
            {/* Table Header / Actions */}
            <div className="p-6 border-b border-brand-gray-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-brand-dark">Employee Status</h2>
                    <p className="text-sm text-brand-gray-text">Real-time monitoring of break activities</p>
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

                    <Button onClick={onAddEmployee} icon={Plus}>
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-brand-gray-light text-brand-gray-text text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Team</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Break Duration</th>
                            <th className="px-6 py-4">Account</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-border">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-brand-gray-light/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-brand-blue-highlight text-brand-blue-dark flex items-center justify-center font-bold text-xs mr-3">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-brand-dark">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-brand-gray-text">{emp.team || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusVariant(emp.currentStatus)}>
                                            {emp.currentStatus?.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <StatusTimer startTime={emp.breakStartTime} status={emp.currentStatus} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={clsx("w-2 h-2 rounded-full mr-2", emp.isActive ? "bg-green-500" : "bg-red-500")}></div>
                                            <span className="text-xs text-brand-gray-text">{emp.isActive ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-brand-gray-text hover:text-brand-blue-DEFAULT transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-brand-gray-border">
                                            <UserX className="text-brand-gray-text" size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-brand-dark mb-1">No employees matching your search</h3>
                                        <p className="text-sm text-brand-gray-text mb-6">Try adjusting your filters or add a new team member.</p>
                                        <Button
                                            icon={Plus}
                                            onClick={onAddEmployee}
                                            variant="secondary"
                                            className="px-6"
                                        >
                                            Add New Employee
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeStatusTable;
