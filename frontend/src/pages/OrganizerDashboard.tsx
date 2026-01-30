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
import './OrganizerDashboard.css';

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
            <div className="organizer-container">
                {/* Header */}
                <header className="organizer-header">
                    <div className="organizer-header-content">
                        <div className="organizer-hub-badge">
                            <TrendingUp size={14} />
                            Strategic Operations
                        </div>
                        <h1 className="organizer-page-title">Organizer Hub</h1>
                        <p className="organizer-page-subtitle">Centralized command for your event ecosystem.</p>
                    </div>
                    <button
                        onClick={() => navigate('/events/create')}
                        className="create-event-action-btn"
                    >
                        <PlusCircle size={20} className="plus-icon-animated" />
                        <span className="btn-text-small">Deploy New Event</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid-organizer">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="stats-skeleton-organizer" />)
                    ) : (
                        statCards.map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="stat-card-organizer"
                            >
                                <div className="stat-header">
                                    <div className={`stat-icon-box ${card.bg} ${card.color}`}>
                                        {card.icon}
                                    </div>
                                    <span className="stat-trend-badge">
                                        {card.trend}
                                    </span>
                                </div>
                                <div className="stat-content">
                                    <p className="stat-title">{card.title}</p>
                                    <p className="stat-value">{card.value}</p>
                                </div>
                                <div className="stat-bg-icon">
                                    {card.icon}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Events Table */}
                <div className="events-table-card">
                    <div className="table-card-header">
                        <h2 className="table-card-title">
                            <BarChart3 className="text-primary" /> Active Clusters
                        </h2>
                        <div className="flex gap-2">
                            <div className="table-header-icon-box">
                                <Sparkles size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="events-table">
                            <thead className="table-thead">
                                <tr>
                                    <th className="table-th">Entity Identifier</th>
                                    <th className="table-th">Time Window</th>
                                    <th className="table-th">Activation Status</th>
                                    <th className="table-th">Adoption Node</th>
                                    <th className="table-th text-right">Access Controls</th>
                                </tr>
                            </thead>
                            <tbody className="table-tbody">
                                {loading ? (
                                    <tr><td colSpan={5} className="table-loading-row">Scanning Grid...</td></tr>
                                ) : stats?.events.length > 0 ? (
                                    stats.events.map((event: any, i: number) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="table-tr"
                                        >
                                            <td className="table-td">
                                                <div className="event-title-cell">
                                                    <span className="event-title-text">{event.title}</span>
                                                    <span className="event-id-text">{event.id.split('-')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="table-td">
                                                <div className="date-cell">
                                                    <div className="date-icon-box">
                                                        <Clock size={14} />
                                                    </div>
                                                    {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="table-td">
                                                <span className={`status-badge ${event.status === 'live' ? 'status-live' :
                                                    event.status === 'draft' ? 'status-draft' : 'status-pending'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="table-td">
                                                <div className="tickets-sold-cell">
                                                    <Users size={18} className="text-primary opacity-50" /> {event.ticketsSold}
                                                </div>
                                            </td>
                                            <td className="table-td text-right">
                                                <div className="table-actions-group">
                                                    {event.status === 'draft' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); submitForReview(event.id); }}
                                                            className="sync-btn"
                                                        >
                                                            <Send size={12} /> Sync
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/organizer/events/${event.id}/attendees`)}
                                                        className="action-icon-btn"
                                                        title="View Attendees"
                                                    >
                                                        <Users size={16} />
                                                    </button>
                                                    <button className="action-icon-btn">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/events/${event.id}`)}
                                                        className="action-external-btn"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="empty-state-container">
                                            <div className="empty-state-content">
                                                <div className="empty-state-icon-box">
                                                    <PlusCircle size={32} className="text-text-dim/20" />
                                                </div>
                                                <h3 className="empty-state-title">Grid Inactive</h3>
                                                <p className="empty-state-text">No clusters detected for this organizer. Initialize your first event to start data aggregation.</p>
                                                <button
                                                    onClick={() => navigate('/events/create')}
                                                    className="deploy-primary-cluster-btn"
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
