import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    Activity, Settings, AlertTriangle, Search,
    UserCog, Database, Server, ShieldAlert, FileSearch,
    Fingerprint, Cpu, Globe, Lock, ShieldCheck,
    UserX, UserCheck, ShieldOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SuperAdminDashboard.css';

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

    const handleUserToggle = async (id: string, field: 'active' | 'ban', value: boolean) => {
        setProcessingId(id);
        try {
            const endpoint = field === 'active' ? `/admin/users/${id}/active` : `/admin/users/${id}/ban`;
            const payload = field === 'active' ? { isActive: value } : { isBanned: value };
            await api.patch(endpoint, payload);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, [field === 'active' ? 'isActive' : 'isBanned']: value } : u));
        } catch (error) {
            console.error('User update failed:', error);
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
            <div className="super-admin-container">
                {/* Header */}
                <header className="super-header">
                    <div className="super-header-content">
                        <div className="super-header-badge">
                            <ShieldAlert size={14} />
                            Root Access Authority
                        </div>
                        <h1 className="super-page-title">System Terminal</h1>
                        <p className="super-page-subtitle">Platform-wide infrastructure and permission override.</p>
                    </div>

                    <div className="super-tabs-container">
                        {[
                            { id: 'users', label: 'Nodes', icon: <UserCog size={14} /> },
                            { id: 'logs', label: 'Telemetry', icon: <FileSearch size={14} /> },
                            { id: 'config', label: 'Kernel', icon: <Cpu size={14} /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`super-tab-btn ${activeTab === tab.id
                                    ? 'super-tab-active'
                                    : 'super-tab-inactive'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="super-content-container">
                    <AnimatePresence mode="wait">
                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="users-section"
                            >
                                <div className="search-container-super">
                                    <Search className="search-icon-super" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Scan Global Registry by Identifier or Secure Mail..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input-super"
                                    />
                                </div>

                                <div className="users-table-card">
                                    <div className="users-table-header">
                                        <div className="col-span-1 text-center">Protocol</div>
                                        <div className="col-span-5">Subject Identity</div>
                                        <div className="col-span-3 text-center">Clearance Grade</div>
                                        <div className="col-span-3 text-right">Authority Override</div>
                                    </div>
                                    {loading ? (
                                        <LoadingState />
                                    ) : (
                                        <div className="users-list">
                                            {filteredUsers.map((u, i) => (
                                                <div key={u.id} className="user-row">
                                                    <div className="user-index">#{(i + 1).toString().padStart(3, '0')}</div>
                                                    <div className="user-identity">
                                                        <div className="user-avatar-box">
                                                            <div className="user-avatar-gradient" />
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="user-name">{u.name}</p>
                                                            <p className="user-email">{u.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 flex flex-col items-center gap-1">
                                                        <span className={`role-badge ${u.role === 'super_admin' ? 'role-super-admin' :
                                                            u.role === 'admin' ? 'role-admin' : 'role-user'
                                                            }`}>
                                                            {u.role.replace('_', ' ')}
                                                        </span>
                                                        <div className="flex gap-2 mt-1">
                                                            <div className={`status-dot ${u.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} title={u.isActive ? 'Active' : 'Inactive'} />
                                                            {u.isBanned && <div className="status-dot bg-rose-500 animate-pulse" title="Banned" />}
                                                        </div>
                                                    </div>
                                                    <div className="user-actions">
                                                        {u.role !== 'super_admin' && (
                                                            <>
                                                                <div className="role-select-container">
                                                                    <select
                                                                        disabled={processingId === u.id}
                                                                        value={u.role}
                                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                                        className="role-select"
                                                                    >
                                                                        <option value="user">User Node</option>
                                                                        <option value="organizer">Organizer Node</option>
                                                                        <option value="admin">Admin Node</option>
                                                                    </select>
                                                                    <div className="role-select-icon">
                                                                        <Settings size={12} />
                                                                    </div>
                                                                </div>
                                                                <div className="system-overrides">
                                                                    <button
                                                                        onClick={() => handleUserToggle(u.id, 'active', !u.isActive)}
                                                                        disabled={processingId === u.id}
                                                                        className={`override-btn ${u.isActive ? 'btn-suspend' : 'btn-activate'}`}
                                                                        title={u.isActive ? 'Suspend access' : 'Restore access'}
                                                                    >
                                                                        {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUserToggle(u.id, 'ban', !u.isBanned)}
                                                                        disabled={processingId === u.id}
                                                                        className={`override-btn ${u.isBanned ? 'btn-unban' : 'btn-ban'}`}
                                                                        title={u.isBanned ? 'Lift terminal ban' : 'Issue terminal ban'}
                                                                    >
                                                                        {u.isBanned ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                        {u.role === 'super_admin' && (
                                                            <div className="fingerprint-icon-box">
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
                                <div className="logs-card">
                                    <div className="logs-header">
                                        <div className="logs-title">
                                            <Database size={18} /> Audit_Registry.sys
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="logs-status">Scanning Grid...</span>
                                            <Activity size={18} className="animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="logs-table-wrapper">
                                        <table className="logs-table">
                                            <thead className="logs-thead">
                                                <tr>
                                                    <th className="logs-th">Sequence_Time</th>
                                                    <th className="logs-th">Initiator_Node</th>
                                                    <th className="logs-th">Operation_Protocol</th>
                                                    <th className="logs-th">Target_Object</th>
                                                    <th className="logs-th text-right">Data_Frame</th>
                                                </tr>
                                            </thead>
                                            <tbody className="logs-tbody">
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="log-row">
                                                        <td className="log-time">{new Date(log.timestamp).toLocaleString()}</td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="log-actor-name">{log.actor.name}</span>
                                                                <span className="log-actor-role">{log.actor.role}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`log-badge ${log.action.includes('BAN') || log.action.includes('DISABLE') || log.action.includes('KILL')
                                                                ? 'log-badge-danger' :
                                                                log.action.includes('APPROVE') || log.action.includes('CLEAR')
                                                                    ? 'log-badge-success' : 'log-badge-info'
                                                                }`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="log-target">{log.target || 'NULL_SET'}</td>
                                                        <td className="px-8 py-5 text-right">
                                                            <button className="log-inspect-btn">
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
                                className="config-grid"
                            >
                                {/* Platform Status */}
                                <div className="config-card">
                                    <div className="config-icon-bg">
                                        <AlertTriangle size={160} />
                                    </div>
                                    <h3 className="config-title">
                                        <Server className="text-rose-500" /> Infrastructure Core
                                    </h3>

                                    <div className={`maintenance-box ${config.maintenanceMode
                                        ? 'maintenance-active'
                                        : 'maintenance-inactive'
                                        }`}>
                                        <div className="kill-switch-header">
                                            <div>
                                                <p className="font-black text-xl tracking-tighter uppercase mb-1">Emergency Kill-Switch</p>
                                                <p className={`text-xs font-bold ${config.maintenanceMode ? 'text-white/80' : 'text-rose-500/60'}`}>Terminate all public transactions and sync immediately.</p>
                                            </div>
                                            <div
                                                onClick={toggleMaintenance}
                                                className={`toggle-container ${config.maintenanceMode ? 'toggle-active' : 'toggle-inactive'
                                                    }`}
                                            >
                                                <motion.div
                                                    animate={{ x: config.maintenanceMode ? 24 : 0 }}
                                                    className={`toggle-thumb ${config.maintenanceMode ? 'bg-white' : 'bg-rose-500'}`}
                                                />
                                            </div>
                                        </div>
                                        {config.maintenanceMode ? (
                                            <div className="system-status animate-pulse">
                                                <ShieldAlert size={18} /> SYSTEM_STATUS: OFFLINE_LOCKED
                                            </div>
                                        ) : (
                                            <div className="system-status">
                                                <ShieldCheck size={18} /> SYSTEM_STATUS: OPERATIONAL
                                            </div>
                                        )}
                                    </div>

                                    <div className="region-info">
                                        <div className="region-label">
                                            <Globe size={18} className="text-primary" /> Region Cluster
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-tighter text-white">Global_Sector_Alpha</span>
                                    </div>
                                </div>

                                {/* Financial Config */}
                                <div className="config-card">
                                    <div className="config-icon-bg-indigo">
                                        <Lock size={160} />
                                    </div>
                                    <h3 className="config-title">
                                        <Settings className="text-indigo-500" /> Protocol Logic
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="commission-label">
                                                <Activity size={12} className="text-indigo-400" /> Platform Fee Scalar
                                            </label>
                                            <div className="commission-input-group">
                                                <div className="relative flex-grow group/input">
                                                    <input
                                                        type="number"
                                                        value={config.platformCommission}
                                                        onChange={(e) => setConfig({ ...config, platformCommission: Number(e.target.value) })}
                                                        className="commission-input"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-2xl text-indigo-500 opacity-50">%</span>
                                                </div>
                                                <button className="commit-btn">
                                                    Commit
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-text-dim font-medium ml-1">Universal tax applied to all validated ticket transactions.</p>
                                        </div>

                                        <div className="pt-8 border-t border-white/[0.03] space-y-4">
                                            <div className="protocol-info-row">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-text-dim">Encryption_Level</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">AES-512-QUANTUM</span>
                                            </div>
                                            <div className="protocol-info-row">
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
    <div className="loading-state-container">
        <div className="relative">
            <Server className="text-rose-500 animate-pulse" size={64} />
            <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 animate-pulse" />
        </div>
        <span className="loading-pulse">Establishing Root Handshake...</span>
    </div>
);

export default SuperAdminDashboard;
