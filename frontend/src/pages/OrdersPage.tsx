import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Download, ExternalLink, Hash, FileText, QrCode as QrIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { downloadQRCode, generatePDFTicket } from '../utils/ticketUtils';
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

    const handleDownloadPDF = (order: any, ticket: any) => {
        // Construct the expected TicketData structure
        const ticketData = {
            id: ticket.id,
            code: ticket.code,
            qrCode: ticket.qrCode,
            status: ticket.status,
            event: {
                title: order.event.title,
                description: order.event.description,
                location: order.event.location,
                startDate: order.event.startDate,
                endDate: order.event.endDate,
            },
            ticketType: {
                name: order.ticketType.name,
                price: order.amount / order.quantity, // Estimate price per ticket
                currency: order.ticketType.currency || 'USD',
            },
            user: {
                name: ticket.user.name,
                email: ticket.user.email,
            }
        };
        generatePDFTicket(ticketData);
    };

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
                                <QrIcon size={14} />
                                Vaulted Access
                            </div>
                            <h1 className="orders-page-title">My Tickets</h1>
                            <p className="orders-page-subtitle">Verified digital portal to your upcoming experiences.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="stats-card">
                                <span className="stats-label">Active</span>
                                <span className="stats-value">{orders.reduce((acc, obj) => acc + (obj.tickets?.length || 0), 0)}</span>
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
                                                {order.ticketType?.name || 'Standard'}
                                            </p>
                                        </div>
                                        <div className="order-info-item">
                                            <p className="order-info-label">Credit</p>
                                            <p className="font-black text-xl tracking-tighter text-primary">
                                                ${order.amount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="tickets-column">
                                    {order.tickets?.map((ticket: any) => (
                                        <div key={ticket.id} className="ticket-item">
                                            <div className="qr-preview">
                                                <img src={ticket.qrCode} alt="QR Code" className="qr-img" />
                                                <div className="ticket-badge">
                                                    <Hash size={10} /> {ticket.code}
                                                </div>
                                            </div>

                                            <div className="ticket-actions">
                                                <button
                                                    onClick={() => handleDownloadPDF(order, ticket)}
                                                    className="action-btn pdf"
                                                >
                                                    <FileText size={16} /> PDF
                                                </button>
                                                <button
                                                    onClick={() => downloadQRCode(ticket.qrCode, ticket.code)}
                                                    className="action-btn qr"
                                                >
                                                    <Download size={16} /> QR
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-vault-container">
                        <div className="empty-vault-icon-box">
                            <QrIcon className="text-text-dim/20" size={48} />
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
