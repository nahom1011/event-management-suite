import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    Calendar, Ticket, DollarSign, Activity,
    PlusCircle, ExternalLink, Edit3, Trash2,
    BarChart3, Layers, Clock, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OrganizerDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/organizer/stats');
                setStats(data.data.stats);
            } catch (error) {
                console.error('Failed to fetch organizer stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Events', value: stats?.totalEvents || 0, icon: <Layers />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { title: 'Tickets Sold', value: stats?.totalTicketsSold || 0, icon: <Ticket />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: <DollarSign />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Active Events', value: stats?.eventStatusBreakdown?.live || 0, icon: <Activity />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    return (
        <Layout>
            <div className="py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black mb-2 tracking-tight">Organizer Dashboard</h1>
                        <p className="text-text-dim text-lg">Manage your business and track event performance.</p>
                    </div>
                    <button
                        onClick={() => navigate('/events/create')}
                        className="bg-primary hover:bg-indigo-600 text-white px-6 py-4 rounded-radius-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-primary/25"
                    >
                        <PlusCircle size={20} />
                        Create New Event
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-32 glass-morphism rounded-radius-lg animate-pulse" />)
                    ) : (
                        statCards.map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-morphism p-6 rounded-radius-lg flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-text-dim uppercase tracking-wider">{card.title}</span>
                                    <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <p className="text-3xl font-black">{card.value}</p>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Events Table / List */}
                <div className="glass-morphism rounded-radius-xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="text-primary" /> Your Events
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs font-bold uppercase tracking-widest text-text-dim">
                                <tr>
                                    <th className="px-6 py-4">Event Title</th>
                                    <th className="px-6 py-4">Start Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Tickets Sold</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-text-dim animate-pulse">Loading events...</td></tr>
                                ) : stats?.events.length > 0 ? (
                                    stats.events.map((event: any, i: number) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-bold text-lg group-hover:text-primary transition-colors">{event.title}</td>
                                            <td className="px-6 py-4 text-sm text-text-dim">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(event.startDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === 'live' ? 'bg-emerald-500 text-white' :
                                                        event.status === 'draft' ? 'bg-white/10 text-white' : 'bg-amber-500 text-white'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <UsersIcon /> {event.ticketsSold}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-dim hover:text-white transition-all">
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-dim hover:text-primary transition-all">
                                                        <ExternalLink size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <PlusCircle size={48} className="text-white/10 mb-4" />
                                                <h3 className="text-xl font-bold mb-1">No events yet</h3>
                                                <p className="text-text-dim mb-6">Start growing your audience by creating your first event.</p>
                                                <button
                                                    onClick={() => navigate('/events/create')}
                                                    className="bg-primary px-6 py-2 rounded-lg font-bold"
                                                >
                                                    Create Event
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const UsersIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export default OrganizerDashboard;
