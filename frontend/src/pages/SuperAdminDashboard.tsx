import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    Activity, Settings, AlertTriangle, Search,
    UserCog, Database, Server, ShieldAlert, FileSearch,
    Fingerprint, Cpu, Globe, Lock, ShieldCheck
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
            <div className="max-w-7xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rose-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            <ShieldAlert size={14} />
                            Root Access Authority
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter">System Terminal</h1>
                        <p className="text-text-dim font-medium text-lg">Platform-wide infrastructure and permission override.</p>
                    </div>

                    <div className="flex bg-rose-500/5 p-1.5 rounded-2xl border border-rose-500/10 backdrop-blur-3xl shadow-2xl">
                        {[
                            { id: 'users', label: 'Nodes', icon: <UserCog size={14} /> },
                            { id: 'logs', label: 'Telemetry', icon: <FileSearch size={14} /> },
                            { id: 'config', label: 'Kernel', icon: <Cpu size={14} /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id
                                        ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20'
                                        : 'text-text-dim hover:text-rose-400 hover:bg-rose-500/5'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-rose-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Scan Global Registry by Identifier or Secure Mail..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-5 outline-none focus:border-rose-500/50 focus:bg-white/[0.05] transition-all font-black text-lg"
                                    />
                                </div>

                                <div className="glass-morphism rounded-radius-xl overflow-hidden border border-white/5 shadow-2xl bg-white/[0.01]">
                                    <div className="bg-white/[0.02] p-8 border-b border-white/[0.03] grid grid-cols-12 gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                                        <div className="col-span-1 text-center">Protocol</div>
                                        <div className="col-span-5">Subject Identity</div>
                                        <div className="col-span-3 text-center">Clearance Grade</div>
                                        <div className="col-span-3 text-right">Authority Override</div>
                                    </div>
                                    {loading ? (
                                        <LoadingState />
                                    ) : (
                                        <div className="divide-y divide-white/[0.03]">
                                            {filteredUsers.map((u, i) => (
                                                <div key={u.id} className="p-8 grid grid-cols-12 gap-8 items-center hover:bg-rose-500/[0.02] transition-all group">
                                                    <div className="col-span-1 text-center text-[10px] text-text-dim font-mono font-bold">#{(i + 1).toString().padStart(3, '0')}</div>
                                                    <div className="col-span-5 flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-black text-2xl text-rose-500 shadow-xl shadow-rose-500/5 relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent" />
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-xl tracking-tight leading-tight group-hover:text-rose-400 transition-colors">{u.name}</p>
                                                            <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mt-1">{u.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 text-center">
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${u.role === 'super_admin' ? 'bg-rose-500 text-white border-rose-500' :
                                                                u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/5 text-text-dim border-white/10'
                                                            }`}>
                                                            {u.role.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-3 flex justify-end gap-3 translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all">
                                                        {u.role !== 'super_admin' && (
                                                            <div className="relative">
                                                                <select
                                                                    disabled={processingId === u.id}
                                                                    value={u.role}
                                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                                    className="appearance-none bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest py-3 px-6 pr-10 rounded-xl outline-none focus:border-rose-500/50 transition-all cursor-pointer hover:bg-white/10"
                                                                >
                                                                    <option value="user">User Node</option>
                                                                    <option value="organizer">Organizer Node</option>
                                                                    <option value="admin">Admin Node</option>
                                                                </select>
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
                                                                    <Settings size={12} />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {u.role === 'super_admin' && (
                                                            <div className="w-10 h-10 flex items-center justify-center text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                                                <Fingerprint size={18} />
                                                            </div>
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
                                <div className="glass-morphism rounded-radius-xl overflow-hidden border border-rose-500/10 bg-black/40 font-mono text-sm shadow-2xl">
                                    <div className="bg-rose-500/5 p-6 border-b border-rose-500/10 flex items-center justify-between text-rose-500">
                                        <div className="flex items-center gap-3 uppercase tracking-[0.2em] font-black text-xs">
                                            <Database size={18} /> Audit_Registry.sys
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning Grid...</span>
                                            <Activity size={18} className="animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-[9px] text-text-dim uppercase tracking-[0.15em]">
                                                <tr>
                                                    <th className="px-8 py-5 border-b border-white/5">Sequence_Time</th>
                                                    <th className="px-8 py-5 border-b border-white/5">Initiator_Node</th>
                                                    <th className="px-8 py-5 border-b border-white/5">Operation_Protocol</th>
                                                    <th className="px-8 py-5 border-b border-white/5">Target_Object</th>
                                                    <th className="px-8 py-5 border-b border-white/5 text-right">Data_Frame</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03]">
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-rose-500/[0.03] transition-colors group">
                                                        <td className="px-8 py-5 text-text-dim whitespace-nowrap text-xs font-bold">{new Date(log.timestamp).toLocaleString()}</td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-text group-hover:text-rose-400 transition-colors uppercase tracking-tight">{log.actor.name}</span>
                                                                <span className="text-[9px] opacity-40 uppercase font-black">{log.actor.role}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${log.action.includes('BAN') || log.action.includes('DISABLE') || log.action.includes('KILL')
                                                                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                                    log.action.includes('APPROVE') || log.action.includes('CLEAR')
                                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                                }`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 opacity-40 font-mono text-[10px] font-bold">{log.target || 'NULL_SET'}</td>
                                                        <td className="px-8 py-5 text-right">
                                                            <button className="text-[9px] font-black uppercase tracking-widest text-rose-500/50 hover:text-rose-500 transition-colors hover:underline flex items-center gap-1.5 ml-auto">
                                                                <FileSearch size={10} /> Inspect_Frame
                                                            </button>
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
                                <div className="glass-morphism p-10 rounded-radius-xl border border-white/5 space-y-8 relative overflow-hidden group">
                                    <div className="absolute -bottom-10 -right-10 text-rose-500/5 group-hover:text-rose-500/10 transition-colors">
                                        <AlertTriangle size={160} />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                                        <Server className="text-rose-500" /> Infrastructure Core
                                    </h3>

                                    <div className={`p-8 rounded-3xl border transition-all duration-500 ${config.maintenanceMode
                                            ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/40 border-rose-400'
                                            : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                                        }`}>
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <p className="font-black text-xl tracking-tighter uppercase mb-1">Emergency Kill-Switch</p>
                                                <p className={`text-xs font-bold ${config.maintenanceMode ? 'text-white/80' : 'text-rose-500/60'}`}>Terminate all public transactions and sync immediately.</p>
                                            </div>
                                            <div
                                                onClick={toggleMaintenance}
                                                className={`w-16 h-10 rounded-2xl p-1.5 cursor-pointer transition-all border-2 ${config.maintenanceMode ? 'bg-white/20 border-white' : 'bg-rose-500/10 border-rose-500/40'
                                                    }`}
                                            >
                                                <motion.div
                                                    animate={{ x: config.maintenanceMode ? 24 : 0 }}
                                                    className={`w-6 h-6 rounded-xl shadow-2xl transition-colors ${config.maintenanceMode ? 'bg-white' : 'bg-rose-500'}`}
                                                />
                                            </div>
                                        </div>
                                        {config.maintenanceMode ? (
                                            <div className="flex items-center gap-3 font-black text-xs tracking-[0.2em] animate-pulse">
                                                <ShieldAlert size={18} /> SYSTEM_STATUS: OFFLINE_LOCKED
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 font-black text-xs tracking-[0.2em]">
                                                <ShieldCheck size={18} /> SYSTEM_STATUS: OPERATIONAL
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between text-text-dim">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                            <Globe size={18} className="text-primary" /> Region Cluster
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-tighter text-white">Global_Sector_Alpha</span>
                                    </div>
                                </div>

                                {/* Financial Config */}
                                <div className="glass-morphism p-10 rounded-radius-xl border border-white/5 space-y-8 relative overflow-hidden group">
                                    <div className="absolute -bottom-10 -right-10 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors">
                                        <Lock size={160} />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                                        <Settings className="text-indigo-500" /> Protocol Logic
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Activity size={12} className="text-indigo-400" /> Platform Fee Scalar
                                            </label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-grow group/input">
                                                    <input
                                                        type="number"
                                                        value={config.platformCommission}
                                                        onChange={(e) => setConfig({ ...config, platformCommission: Number(e.target.value) })}
                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 outline-none focus:border-indigo-500/50 transition-all font-black text-2xl tracking-tighter"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-2xl text-indigo-500 opacity-50">%</span>
                                                </div>
                                                <button className="bg-indigo-500 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                                                    Commit
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-text-dim font-medium ml-1">Universal tax applied to all validated ticket transactions.</p>
                                        </div>

                                        <div className="pt-8 border-t border-white/[0.03] space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-text-dim">Encryption_Level</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">AES-512-QUANTUM</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-text-dim">Node_Latency</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">12ms_STABLE</span>
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
    <div className="p-32 text-center flex flex-col items-center gap-6">
        <div className="relative">
            <Server className="text-rose-500 animate-pulse" size={64} />
            <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 animate-pulse" />
        </div>
        <span className="font-black text-[10px] uppercase tracking-[0.4em] text-rose-500 animate-pulse">Establishing Root Handshake...</span>
    </div>
);

export default SuperAdminDashboard;
