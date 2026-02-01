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
            <div className="dashboard-content">
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
                        Connect<span className="dot-container">.</span>
                    </h1>

                    <p className="dashboard-tagline">
                        Your gateway to the world's most exclusive gatherings,
                        festivals, and professional summits.
                    </p>

                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
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
                <div className="section-header">
                    <div className="section-title-group">
                        <div className="section-icon-box">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="section-title">Featured Events</h2>
                    </div>
                    <div className="view-all-link">View All</div>
                </div>

                {loading ? (
                    <div className="events-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card-skeleton" />
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="events-grid">
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
                                    <div className="event-card-bg" />
                                    <div
                                        className="event-card-image"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80')" }}
                                    />

                                    <div className="event-status-container">
                                        <span className="event-status-badge">
                                            {event.status}
                                        </span>
                                    </div>

                                    <div className="event-overlay">
                                        <div className="event-date-row">
                                            <Calendar size={16} className="text-primary" />
                                            <span className="event-date-text">
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
                                        <MapPin size={16} className="location-icon" />
                                        <span className="location-text">
                                            {event.location || 'Seamless Experience'}
                                        </span>
                                    </div>

                                    <div className="event-price-actions">
                                        <div className="event-price">
                                            {event.ticketTypes?.[0]?.price ? `$${event.ticketTypes[0].price}` : <span className="free-badge">Free</span>}
                                        </div>
                                        <div className="action-icon-box">
                                            <TrendingUp size={18} />
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
                        <h3 className="empty-title">Null Sector</h3>
                        <p className="empty-description">We couldn't find any events matching your request.</p>
                        <button onClick={() => setSearch('')} className="reset-btn">Reset Exploration</button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
