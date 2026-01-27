import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, MapPin, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data.data.events);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="space-y-12">
                {/* Immersive Hero */}
                <header className="dashboard-hero">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="dashboard-badge"
                    >
                        <Sparkles size={14} />
                        Next-Gen Event Platform
                    </motion.div>

                    <h1 className="dashboard-heading">
                        Discover. <span className="primary-gradient-text">Experience.</span> <br />
                        Connec<span className="relative">t<div className="absolute -right-4 top-0 w-3 h-3 bg-accent rounded-full animate-ping" /></span>.
                    </h1>

                    <p className="dashboard-tagline">
                        Your gateway to the world's most exclusive gatherings,
                        festivals, and professional summits.
                    </p>

                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={20} />
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button className="filter-btn">
                            <Filter size={18} />
                            Filter
                        </button>
                    </div>
                </header>

                {/* Trending Section Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="section-icon-box">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-2xl font-black">Featured Events</h2>
                    </div>
                    <div className="text-primary font-bold text-sm cursor-pointer hover:underline">View All</div>
                </div>

                {loading ? (
                    <div className="events-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card-skeleton" />
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="events-grid pb-12">
                        {filteredEvents.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                onClick={() => navigate(`/events/${event.id}`)}
                                className="event-card"
                            >
                                <div className="event-image-container">
                                    {/* Mock Image Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-600/10 to-transparent" />
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80')] bg-cover bg-center" />

                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="event-status-badge">
                                            {event.status}
                                        </span>
                                    </div>

                                    <div className="event-overlay">
                                        <div className="flex items-center gap-2 text-white/90 font-bold mb-1">
                                            <Calendar size={16} className="text-primary" />
                                            <span className="text-xs uppercase tracking-tighter">
                                                {new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="event-title">
                                            {event.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="event-card-content">
                                    <div className="event-location">
                                        <MapPin size={16} className="text-indigo-400" />
                                        <span className="font-medium group-hover:text-text transition-colors capitalize">
                                            {event.location || 'Seamless Experience'}
                                        </span>
                                    </div>

                                    <div className="event-price-actions">
                                        <div className="text-2xl font-black tracking-tighter">
                                            {event.tickets?.[0]?.price ? `$${event.tickets[0].price}` : <span className="text-accent uppercase text-sm font-black">Free</span>}
                                        </div>
                                        <div className="action-icon-box">
                                            <TrendingUp size={18} className="translate-y-[1px]" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon-box">
                            <Search className="text-text-dim" size={32} />
                        </div>
                        <h3 className="text-3xl font-black mb-2">Null Sector</h3>
                        <p className="text-text-dim font-medium">We couldn't find any events matching your request.</p>
                        <button onClick={() => setSearch('')} className="reset-btn">Reset Exploration</button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
