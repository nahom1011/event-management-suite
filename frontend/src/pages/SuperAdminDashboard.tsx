import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    Activity, Settings, AlertTriangle, Search,
    UserCog, Database, Server, ShieldAlert, FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'config'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [config, setConfig] = useState({ maintenanceMode: false, platformCommission: 5 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const { data } = await api.get('/admin/users');
                setUsers(data.data.users);
            } else if (activeTab === 'logs') {
                const { data } = await api.get('/admin/audit-logs');
                setLogs(data.data.logs);
            }
        } catch (error) {
            console.error('Failed to fetch super admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setProcessingId(userId);
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Role change failed:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const toggleMaintenance = async () => {
        const newStatus = !config.maintenanceMode;
        try {
            await api.post('/admin/emergency-kill-switch', { maintenanceMode: newStatus });
            setConfig({ ...config, maintenanceMode: newStatus });
        } catch (error) {
            console.error('Maintenance toggle failed:', error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <div className="py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black mb-2 tracking-tight flex items-center gap-4">
                            <ShieldAlert className="text-rose-500" size={48} />
                            Platform Authority
                        </h1>
                        <p className="text-text-dim text-lg uppercase tracking-widest font-bold">Super Admin Terminal</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-radius-lg border border-white/5">
                        {[
                            { id: 'users', label: 'Access Control', icon: <UserCog size={16} /> },
                            { id: 'logs', label: 'Audit Trail', icon: <FileSearch size={16} /> },
                            { id: 'config', label: 'System Config', icon: <Settings size={16} /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-text-dim hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="glass-morphism p-4 rounded-radius-lg border border-white/5 relative">
                                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search across all platform users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-4 outline-none focus:border-rose-500/30 transition-all font-medium"
                                    />
                                </div>

                                <div className="glass-morphism rounded-radius-xl overflow-hidden border border-white/5">
                                    <div className="bg-white/5 p-4 border-b border-white/5 grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-text-dim">
                                        <div className="col-span-1 text-center">ID</div>
                                        <div className="col-span-5">User Account</div>
                                        <div className="col-span-3 text-center">Current Role</div>
                                        <div className="col-span-3 text-right">Assign Authority</div>
                                    </div>
                                    {loading ? (
                                        <LoadingState />
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {filteredUsers.map((u, i) => (
                                                <div key={u.id} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                                                    <div className="col-span-1 text-center text-[10px] text-text-dim font-mono">{i + 1}</div>
                                                    <div className="col-span-5 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center font-bold text-rose-500">{u.name.charAt(0)}</div>
                                                        <div>
                                                            <p className="font-bold">{u.name}</p>
                                                            <p className="text-xs text-text-dim">{u.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 text-center">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${u.role === 'super_admin' ? 'bg-rose-500 text-white' :
                                                                u.role === 'admin' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-text'
                                                            }`}>
                                                            {u.role.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-3 flex justify-end gap-2">
                                                        {u.role !== 'super_admin' && (
                                                            <select
                                                                disabled={processingId === u.id}
                                                                value={u.role}
                                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                                className="bg-white/5 border border-white/10 text-xs font-bold p-2 rounded-lg outline-none focus:border-rose-500/50 transition-all"
                                                            >
                                                                <option value="user">USER</option>
                                                                <option value="organizer">ORGANIZER</option>
                                                                <option value="admin">ADMIN</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'logs' && (
                            <motion.div
                                key="logs"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="glass-morphism rounded-radius-xl overflow-hidden border border-white/10 bg-black/20 font-mono text-sm">
                                    <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between text-rose-500">
                                        <div className="flex items-center gap-2 uppercase tracking-tighter font-black">
                                            <Database size={16} /> Platform_Audit_Log.out
                                        </div>
                                        <Activity size={16} className="animate-pulse" />
                                    </div>
                                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-[10px] text-text-dim uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-3">Timestamp</th>
                                                    <th className="px-6 py-3">Actor</th>
                                                    <th className="px-6 py-3">Action</th>
                                                    <th className="px-6 py-3">Target</th>
                                                    <th className="px-6 py-3 text-right">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-3 text-text-dim whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                                        <td className="px-6 py-3">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{log.actor.name}</span>
                                                                <span className="text-[10px] opacity-50 uppercase">{log.actor.role}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.action.includes('BAN') || log.action.includes('DISABLE') ? 'bg-red-500/20 text-red-500' :
                                                                    log.action.includes('APPROVE') ? 'bg-emerald-500/20 text-emerald-500' : 'bg-indigo-500/20 text-indigo-500'
                                                                }`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 opacity-50 font-mono text-xs">{log.target || '-'}</td>
                                                        <td className="px-6 py-3 text-right">
                                                            <button className="text-[10px] text-rose-500 hover:underline">View Metadata</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'config' && (
                            <motion.div
                                key="config"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                {/* Platform Status */}
                                <div className="glass-morphism p-8 rounded-radius-xl border border-white/5 space-y-6">
                                    <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                                        <Server className="text-rose-500" /> Platform Infrastructure
                                    </h3>

                                    <div className="p-6 bg-rose-500/10 rounded-radius-lg border border-rose-500/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-black text-rose-500 uppercase tracking-tighter">Emergency Kill-Switch</p>
                                                <p className="text-xs text-rose-500/70">Disables all public transactions and logins immediately.</p>
                                            </div>
                                            <div
                                                onClick={toggleMaintenance}
                                                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${config.maintenanceMode ? 'bg-rose-500' : 'bg-white/10'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: config.maintenanceMode ? 24 : 0 }}
                                                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                                                />
                                            </div>
                                        </div>
                                        {config.maintenanceMode && (
                                            <div className="flex items-center gap-2 text-rose-500 font-bold animate-pulse text-sm">
                                                <AlertTriangle size={16} /> SYSTEM IS CURRENTLY OFFLINE
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Financial Config */}
                                <div className="glass-morphism p-8 rounded-radius-xl border border-white/5 space-y-6">
                                    <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                                        <Settings className="text-indigo-500" /> System Parameters
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-text-dim uppercase tracking-widest">Platform Commission (%)</label>
                                            <div className="flex gap-4">
                                                <input
                                                    type="number"
                                                    value={config.platformCommission}
                                                    onChange={(e) => setConfig({ ...config, platformCommission: Number(e.target.value) })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-indigo-500/50"
                                                />
                                                <button className="bg-indigo-500 text-white px-6 rounded-lg font-bold hover:bg-indigo-600 transition-all">Save</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
};

const LoadingState = () => (
    <div className="p-20 text-center text-text-dim animate-pulse flex flex-col items-center gap-4">
        <Server className="animate-bounce" size={48} />
        <span className="font-bold uppercase tracking-widest">Fetching Platform Data...</span>
    </div>
);

export default SuperAdminDashboard;
