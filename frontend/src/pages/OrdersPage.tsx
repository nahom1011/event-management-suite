import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Ticket, Calendar, MapPin, QrCode, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const OrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            <div className="py-8 max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl font-black mb-2 tracking-tight">My Tickets</h1>
                    <p className="text-text-dim">Your bookings and digital entry passes.</p>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-40 glass-morphism rounded-radius-lg animate-pulse" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-morphism rounded-radius-lg overflow-hidden flex flex-col md:flex-row border-l-4 border-primary shadow-xl"
                            >
                                <div className="p-8 flex-grow">
                                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                                        <Ticket size={14} />
                                        <span>Confirmed Booking</span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-4">{order.event.title}</h2>

                                    <div className="grid grid-cols-2 gap-6 text-sm">
                                        <div>
                                            <p className="text-text-dim font-medium mb-1 flex items-center gap-2">
                                                <Calendar size={14} /> Date
                                            </p>
                                            <p className="font-semibold">{new Date(order.event.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-text-dim font-medium mb-1 flex items-center gap-2">
                                                <MapPin size={14} /> Location
                                            </p>
                                            <p className="font-semibold line-clamp-1">{order.event.location || 'Online'}</p>
                                        </div>
                                        <div>
                                            <p className="text-text-dim font-medium mb-1">Ticket Type</p>
                                            <p className="font-semibold">{order.ticket.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-text-dim font-medium mb-1">Price Paid</p>
                                            <p className="font-semibold">${order.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 md:w-64 flex flex-col items-center justify-center p-8 border-t md:border-t-0 md:border-l border-white/5 space-y-4">
                                    <div className="p-4 bg-white rounded-xl shadow-lg shadow-white/5">
                                        {/* In a real app, use a QR generator lib here */}
                                        <QrCode size={96} className="text-bg" />
                                    </div>
                                    <p className="text-[10px] font-mono text-text-dim uppercase tracking-tighter">{order.qrCode}</p>
                                    <div className="flex gap-2 w-full mt-2">
                                        <button className="flex-grow bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                                            <Download size={14} /> Download
                                        </button>
                                        <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center">
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 glass-morphism rounded-radius-xl">
                        <Ticket className="mx-auto text-text-dim mb-4 opacity-20" size={64} />
                        <h3 className="text-2xl font-bold mb-2">No tickets yet</h3>
                        <p className="text-text-dim mb-8">Ready for your next adventure? Explore amazing events.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-primary text-white px-8 py-3 rounded-radius-md font-bold hover:shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            Browse Events
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default OrdersPage;
