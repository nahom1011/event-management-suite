import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, QrCode, Download, ExternalLink, ChevronRight, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/me');
                setOrders(data.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <Layout>
            <div className="orders-container">
                <header>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="orders-header-content"
                    >
                        <div>
                            <div className="orders-page-badge">
                                <Ticket size={14} />
                                Vaulted Access
                            </div>
                            <h1 className="orders-page-title">My Tickets</h1>
                            <p className="orders-page-subtitle">Verified digital portal to your upcoming experiences.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="stats-card">
                                <span className="stats-label">Active</span>
                                <span className="stats-value">{orders.length}</span>
                            </div>
                        </div>
                    </motion.div>
                </header>

                {loading ? (
                    <div className="space-y-8">
                        {[1, 2].map(i => (
                            <div key={i} className="loading-skeleton-orders" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="orders-list">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="order-card"
                            >
                                <div className="order-card-main">
                                    <div className="bg-decoration-ticket">
                                        <Ticket size={120} className="rotate-12" />
                                    </div>

                                    <div className="transaction-info">
                                        <div className="transaction-icon-box">
                                            <Hash size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="transaction-label">Transaction Record</span>
                                            <span className="transaction-id">{order.id.split('-')[0]}</span>
                                        </div>
                                    </div>

                                    <h2 className="order-event-title">
                                        {order.event.title}
                                    </h2>

                                    <div className="order-info-grid">
                                        <div className="order-info-item">
                                            <p className="order-info-label">
                                                <Calendar size={12} className="text-primary" /> Timeline
                                            </p>
                                            <p className="order-info-value">
                                                {new Date(order.event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="order-info-item">
                                            <p className="order-info-label">
                                                <MapPin size={12} className="text-emerald-500" /> Sector
                                            </p>
                                            <p className="order-info-value truncate">
                                                {order.event.location || 'Seamless'}
                                            </p>
                                        </div>
                                        <div className="order-info-item">
                                            <p className="order-info-label">Grade</p>
                                            <p className="order-info-value text-white/90">
                                                {order.ticket.type}
                                            </p>
                                        </div>
                                        <div className="order-info-item">
                                            <p className="order-info-label">Credit</p>
                                            <p className="font-black text-xl tracking-tighter text-primary">
                                                ${order.totalAmount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="ticket-column">
                                    <div className="ticket-gradient" />

                                    <div className="qr-container">
                                        <QrCode size={120} className="text-bg" />
                                    </div>
                                    <p className="qr-code-text">
                                        {order.qrCode}
                                    </p>

                                    <div className="ticket-actions">
                                        <button className="download-pass-btn">
                                            <Download size={16} /> Save Pass
                                        </button>
                                        <button className="explore-event-btn">
                                            Explore Event <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-vault-container">
                        <div className="empty-vault-icon-box">
                            <Ticket className="text-text-dim/20" size={48} />
                        </div>
                        <h3 className="empty-vault-title">Empty Vault</h3>
                        <p className="empty-vault-description">
                            No tickets detected in your localized storage. Start your journey by exploring active events.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="deploy-discovery-btn"
                        >
                            <ExternalLink size={16} />
                            Deploy Discovery
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default OrdersPage;
