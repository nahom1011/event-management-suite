import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    Ticket, DollarSign, Activity,
    PlusCircle, ExternalLink, Edit3,
    BarChart3, Layers, Clock, Send, Users, TrendingUp, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const OrganizerDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchStats();
    }, []);

    const submitForReview = async (id: string) => {
        try {
            await api.patch(`/events/${id}`, { status: 'pending' });
            fetchStats();
        } catch (error) {
            console.error('Failed to submit for review:', error);
            alert('Failed to submit event for review.');
        }
    };

    const statCards = [
        { title: 'Cluster Volume', value: stats?.totalEvents || 0, icon: <Layers size={20} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: '+12%' },
        { title: 'Node Adoption', value: stats?.totalTicketsSold || 0, icon: <Ticket size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+24%' },
        { title: 'Credit Inflow', value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: <DollarSign size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '+8%' },
        { title: 'Active Streams', value: stats?.eventStatusBreakdown?.live || 0, icon: <Activity size={20} />, color: 'text-rose-400', bg: 'bg-rose-500/10', trend: 'Stable' },
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                            <TrendingUp size={14} />
                            Strategic Operations
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter">Organizer Hub</h1>
                        <p className="text-text-dim font-medium text-lg">Centralized command for your event ecosystem.</p>
                    </div>
                    <button
                        onClick={() => navigate('/events/create')}
                        className="btn-primary group flex items-center justify-center gap-3 py-5 px-8 shadow-2xl shadow-primary/20"
                    >
                        <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em]">Deploy New Event</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-40 glass-morphism rounded-radius-xl animate-pulse" />)
                    ) : (
                        statCards.map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="glass-morphism p-8 rounded-radius-xl group hover:border-primary/30 transition-all relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                                        {card.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                        {card.trend}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">{card.title}</p>
                                    <p className="text-3xl font-black tracking-tighter">{card.value}</p>
                                </div>
                                <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    {card.icon}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Events Table */}
                <div className="glass-morphism rounded-radius-xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="p-8 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
                        <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                            <BarChart3 className="text-primary" /> Active Clusters
                        </h2>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-dim">
                                <Sparkles size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                                <tr>
                                    <th className="px-8 py-6">Entity Identifier</th>
                                    <th className="px-8 py-6">Time Window</th>
                                    <th className="px-8 py-6">Activation Status</th>
                                    <th className="px-8 py-6">Adoption Node</th>
                                    <th className="px-8 py-6 text-right">Access Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-20 text-center text-text-dim font-bold uppercase tracking-widest animate-pulse">Scanning Grid...</td></tr>
                                ) : stats?.events.length > 0 ? (
                                    stats.events.map((event: any, i: number) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-all group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-lg group-hover:text-primary transition-colors">{event.title}</span>
                                                    <span className="text-[10px] font-mono text-text-dim opacity-50 font-bold">{event.id.split('-')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 text-text-dim font-bold text-sm">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                        <Clock size={14} />
                                                    </div>
                                                    {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${event.status === 'live' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    event.status === 'draft' ? 'bg-white/5 text-text-dim border-white/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 font-black text-lg tracking-tighter">
                                                    <Users size={18} className="text-primary opacity-50" /> {event.ticketsSold}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                    {event.status === 'draft' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); submitForReview(event.id); }}
                                                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 shadow-lg shadow-emerald-500/5"
                                                        >
                                                            <Send size={12} /> Sync
                                                        </button>
                                                    )}
                                                    <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-text-dim hover:text-white transition-all flex items-center justify-center border border-white/5">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/events/${event.id}`)}
                                                        className="w-10 h-10 bg-white/5 hover:bg-primary/20 rounded-xl text-text-dim hover:text-primary transition-all flex items-center justify-center border border-white/5"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-32 text-center">
                                            <div className="flex flex-col items-center max-w-sm mx-auto">
                                                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
                                                    <PlusCircle size={32} className="text-text-dim/20" />
                                                </div>
                                                <h3 className="text-3xl font-black tracking-tighter mb-4">Grid Inactive</h3>
                                                <p className="text-text-dim font-medium mb-12">No clusters detected for this organizer. Initialize your first event to start data aggregation.</p>
                                                <button
                                                    onClick={() => navigate('/events/create')}
                                                    className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
                                                >
                                                    Deploy Primary Cluster
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

export default OrganizerDashboard;
