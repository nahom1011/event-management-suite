import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    ShieldCheck, User, Check, X,
    Mail, Phone, MapPin, Eye,
    UserX, UserCheck, ShieldOff, Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'organizers' | 'events' | 'users'>('organizers');
    const [organizers, setOrganizers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'organizers') {
                const { data } = await api.get('/admin/pending-organizers');
                setOrganizers(data.data.applications);
            } else if (activeTab === 'events') {
                const { data } = await api.get('/admin/pending-events');
                setEvents(data.data.events);
            } else {
                const { data } = await api.get('/admin/users');
                setUsers(data.data.users);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleOrganizerReview = async (id: string, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            await api.patch(`/admin/review-organizer/${id}`, { status });
            setOrganizers(prev => prev.filter(app => app.id !== id));
        } catch (error) {
            console.error('Review failed:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleEventReview = async (id: string, status: 'approved' | 'live' | 'cancelled') => {
        setProcessingId(id);
        try {
            await api.patch(`/admin/review-event/${id}`, { status });
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Review failed:', error);
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

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <div className="py-8">
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black mb-2 tracking-tight">Admin Moderation</h1>
                        <p className="text-text-dim text-lg">Maintain platform integrity and review submissions.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-radius-lg border border-white/5">
                        {['organizers', 'events', 'users'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all capitalize ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-dim hover:text-white'
                                    }`}
                            >
                                {tab}
                                {tab === 'organizers' && organizers.length > 0 && <span className="ml-1 opacity-50">({organizers.length})</span>}
                                {tab === 'events' && events.length > 0 && <span className="ml-1 opacity-50">({events.length})</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'users' && (
                    <div className="mb-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-radius-lg pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                )}

                <div className="glass-morphism rounded-radius-xl overflow-hidden border border-white/5">
                    {activeTab === 'organizers' ? (
                        <OrganizerTable organizers={organizers} loading={loading} processingId={processingId} onReview={handleOrganizerReview} />
                    ) : activeTab === 'events' ? (
                        <EventTable events={events} loading={loading} processingId={processingId} onReview={handleEventReview} />
                    ) : (
                        <UserTable users={filteredUsers} loading={loading} processingId={processingId} onToggle={handleUserToggle} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

const OrganizerTable = ({ organizers, loading, processingId, onReview }: any) => (
    <>
        <div className="bg-white/5 p-4 border-b border-white/5 grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-text-dim">
            <div className="col-span-4">Organizer / Company</div>
            <div className="col-span-4">Contact Details</div>
            <div className="col-span-2 text-center">Applied Date</div>
            <div className="col-span-2 text-right">Actions</div>
        </div>
        {loading ? <LoadingIndicator /> : organizers.length > 0 ? (
            <div className="divide-y divide-white/5">
                {organizers.map((app: any) => (
                    <motion.div key={app.id} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-500/20 text-primary rounded-lg flex items-center justify-center font-bold">{app.organizationName.charAt(0)}</div>
                            <div>
                                <p className="font-bold text-lg">{app.organizationName}</p>
                                <p className="text-text-dim text-sm flex items-center gap-1"><User size={12} /> {app.user.name}</p>
                            </div>
                        </div>
                        <div className="col-span-4 space-y-1">
                            <p className="text-sm flex items-center gap-2"><Mail size={14} className="text-text-dim" /> {app.user.email}</p>
                            <p className="text-sm flex items-center gap-2"><Phone size={14} className="text-text-dim" /> {app.phone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2 text-center text-text-dim">{new Date(app.createdAt).toLocaleDateString()}</div>
                        <div className="col-span-2 flex justify-end gap-3">
                            <button onClick={() => onReview(app.id, 'rejected')} disabled={!!processingId} className="w-10 h-10 rounded-lg border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-all"><X size={20} /></button>
                            <button onClick={() => onReview(app.id, 'approved')} disabled={!!processingId} className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all"><Check size={20} /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : <EmptyQueue message="No pending organizer applications." />}
    </>
);

const EventTable = ({ events, loading, processingId, onReview }: any) => (
    <>
        <div className="bg-white/5 p-4 border-b border-white/5 grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-text-dim">
            <div className="col-span-4">Event Details</div>
            <div className="col-span-3">Organizer</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-3 text-right">Actions</div>
        </div>
        {loading ? <LoadingIndicator /> : events.length > 0 ? (
            <div className="divide-y divide-white/5">
                {events.map((event: any) => (
                    <motion.div key={event.id} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-4">
                            <p className="font-bold text-lg">{event.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-text-dim flex items-center gap-1"><MapPin size={12} /> {event.location || 'Online'}</span>
                            </div>
                        </div>
                        <div className="col-span-3 font-medium text-text-dim uppercase text-[10px] tracking-widest">{event.organizer.organizationName}</div>
                        <div className="col-span-2 text-center text-text-dim text-sm">{new Date(event.startDate).toLocaleDateString()}</div>
                        <div className="col-span-3 flex justify-end gap-3">
                            <button className="w-10 h-10 rounded-lg bg-white/5 text-text-dim flex items-center justify-center hover:text-white transition-all"><Eye size={18} /></button>
                            <button onClick={() => onReview(event.id, 'cancelled')} disabled={!!processingId} className="w-10 h-10 rounded-lg border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-all"><X size={20} /></button>
                            <button onClick={() => onReview(event.id, 'live')} disabled={!!processingId} className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all"><Check size={20} /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : <EmptyQueue message="No events awaiting approval." />}
    </>
);

const UserTable = ({ users, loading, processingId, onToggle }: any) => (
    <>
        <div className="bg-white/5 p-4 border-b border-white/5 grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-text-dim">
            <div className="col-span-4">User Info</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-4 text-right">Actions</div>
        </div>
        {loading ? <LoadingIndicator /> : users.length > 0 ? (
            <div className="divide-y divide-white/5">
                {users.map((u: any) => (
                    <motion.div key={u.id} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-primary">{u.name.charAt(0)}</div>
                            <div>
                                <p className="font-bold">{u.name}</p>
                                <p className="text-xs text-text-dim">{u.email}</p>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded text-text-dim">{u.role}</span>
                        </div>
                        <div className="col-span-2 text-center space-y-1">
                            <div className={`text-[10px] font-bold uppercase ${u.isActive ? 'text-emerald-500' : 'text-text-dim'}`}>{u.isActive ? 'Active' : 'Inactive'}</div>
                            {u.isBanned && <div className="text-[10px] font-bold uppercase text-red-500">Banned</div>}
                        </div>
                        <div className="col-span-4 flex justify-end gap-2">
                            <button
                                onClick={() => onToggle(u.id, 'active', !u.isActive)}
                                disabled={!!processingId}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${u.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                    }`}
                            >
                                {u.isActive ? <><UserX size={14} /> Suspend</> : <><UserCheck size={14} /> Activate</>}
                            </button>
                            <button
                                onClick={() => onToggle(u.id, 'ban', !u.isBanned)}
                                disabled={!!processingId}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${u.isBanned ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                            >
                                {u.isBanned ? <><ShieldCheck size={14} /> Unban</> : <><ShieldOff size={14} /> Ban</>}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : <EmptyQueue message="No users found." />}
    </>
);

const LoadingIndicator = () => <div className="p-20 text-center text-text-dim animate-pulse">Loading queue...</div>;

const EmptyQueue = ({ message }: { message: string }) => (
    <div className="p-20 text-center flex flex-col items-center">
        <ShieldCheck size={64} className="text-white/10 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Queue is clear!</h3>
        <p className="text-text-dim">{message}</p>
    </div>
);

export default AdminDashboard;
