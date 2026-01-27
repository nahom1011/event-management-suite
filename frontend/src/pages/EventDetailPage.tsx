import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2, Share2, Heart, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import './EventDetailPage.css';

const EventDetailPage = () => {
    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data.data.event);
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handlePurchase = async (ticketId: string) => {
        setPurchasing(true);
        try {
            await api.post('/orders', { eventId: id, ticketId });
            setPurchaseSuccess(true);
            setTimeout(() => navigate('/orders'), 2000);
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Something went wrong with the purchase.');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="loading-container">
                <div className="loading-spinner-event" />
            </div>
        </Layout>
    );

    if (!event) return (
        <Layout>
            <div className="error-container">
                <h1 className="error-title">Event Materialized Out of Bound</h1>
                <p className="error-text">The event you are looking for does not exist in this sector.</p>
                <button onClick={() => navigate('/')} className="btn-primary">Return to Discovery</button>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="event-detail-container">
                <div className="event-header">
                    <button
                        onClick={() => navigate(-1)}
                        className="back-to-deck-btn"
                    >
                        <div className="back-btn-icon-box">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Back to Deck
                    </button>

                    <div className="event-action-group">
                        <button className="event-action-btn">
                            <Heart size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary/10 transition-all">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="event-detail-grid">
                    <div className="event-main-column">
                        {/* Immersive Event Hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hero-image-container"
                        >
                            <div className="hero-bg-overlay" />
                            <div className="hero-bg-image" />
                            <div className="hero-gradient-overlay" />

                            <div className="hero-content">
                                <div className="premium-badge">
                                    <Award size={12} />
                                    Premium Experience
                                </div>
                                <h1 className="hero-title">
                                    {event.title}
                                </h1>
                            </div>
                        </motion.div>

                        <div className="details-section">
                            <section>
                                <h2 className="section-h2">
                                    <div className="w-2 h-8 bg-primary rounded-full" />
                                    Expedition Details
                                </h2>
                                <div className="description-card">
                                    <p className="description-text">
                                        {event.description || 'No specialized description provided for this event.'}
                                    </p>
                                </div>
                            </section>

                            <section className="info-grid">
                                <div className="info-card">
                                    <h4 className="info-card-title">Vibe Check</h4>
                                    <div className="info-card-content">
                                        <div className="info-icon-box">
                                            <Sparkles size={24} />
                                        </div>
                                        <p className="info-value">High Energy Atmosphere</p>
                                    </div>
                                </div>
                                <div className="p-6 glass-morphism rounded-radius-lg border-l-4 border-emerald-500">
                                    <h4 className="info-card-title">Status</h4>
                                    <div className="info-card-content">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <p className="font-bold text-text-dim capitalize">{event.status} Priority</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="event-sidebar-column">
                        {/* Event Meta Card */}
                        <div className="sidebar-card">
                            <div className="space-y-8">
                                <div className="meta-item">
                                    <div className="meta-icon-box">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="meta-content">
                                        <p className="meta-label">Launch Date</p>
                                        <p className="meta-value">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="meta-subtext">{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                    </div>
                                </div>

                                <div className="meta-item">
                                    <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 hover:scale-110 transition-transform">
                                        <Clock size={24} />
                                    </div>
                                    <div className="meta-content">
                                        <p className="meta-label">Duration Window</p>
                                        <p className="meta-value">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="meta-subtext">Local Sector Time</p>
                                    </div>
                                </div>

                                <div className="meta-item">
                                    <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-emerald-500 hover:scale-110 transition-transform">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="meta-content">
                                        <p className="meta-label">Coordinates</p>
                                        <p className="font-black text-lg truncate w-48">{event.location || 'Seamless Portal'}</p>
                                        <p className="meta-subtext">Verified Location</p>
                                    </div>
                                </div>
                            </div>

                            <div className="tickets-container">
                                <h4 className="tickets-h4">Access Passes</h4>
                                {event.tickets?.length > 0 ? (
                                    <div className="space-y-4">
                                        {event.tickets.map((t: any) => (
                                            <div
                                                key={t.id}
                                                className="ticket-item"
                                            >
                                                <div className="ticket-header">
                                                    <div>
                                                        <p className="ticket-name">{t.type}</p>
                                                        <p className="ticket-quantity">{t.quantity} Units Available</p>
                                                    </div>
                                                    <div className="ticket-price">${t.price}</div>
                                                </div>
                                                <button
                                                    disabled={purchasing || purchaseSuccess || t.quantity <= 0}
                                                    onClick={() => handlePurchase(t.id)}
                                                    className={`buy-btn ${purchaseSuccess
                                                        ? 'buy-btn-success'
                                                        : t.quantity <= 0
                                                            ? 'buy-btn-disabled'
                                                            : 'buy-btn-default'
                                                        }`}
                                                >
                                                    {purchaseSuccess ? (
                                                        <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Sync Complete</span>
                                                    ) : purchasing ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                                    ) : t.quantity <= 0 ? (
                                                        "Supply Exhausted"
                                                    ) : (
                                                        "Aquire Pass"
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="tickets-closed">
                                        TICKETING PORTAL CLOSED
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EventDetailPage;
