import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, QrCode, Download, ExternalLink, ChevronRight, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

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
            <div className="max-w-5xl mx-auto space-y-12">
                <header>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                                <Ticket size={14} />
                                Vaulted Access
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter">My Tickets</h1>
                            <p className="text-text-dim font-medium mt-2">Verified digital portal to your upcoming experiences.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-6 py-3 glass-morphism rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Active</span>
                                <span className="text-2xl font-black tracking-tighter">{orders.length}</span>
                            </div>
                        </div>
                    </motion.div>
                </header>

                {loading ? (
                    <div className="space-y-8">
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 glass-morphism rounded-radius-xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-8 pb-20">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="group glass-morphism rounded-radius-xl overflow-hidden flex flex-col md:flex-row shadow-2xl hover:shadow-primary/10 transition-all border-l-4 border-primary"
                            >
                                <div className="p-10 flex-grow relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Ticket size={120} className="rotate-12" />
                                    </div>

                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Hash size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Transaction Record</span>
                                            <span className="text-xs font-mono font-bold uppercase">{order.id.split('-')[0]}</span>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-black tracking-tighter mb-10 group-hover:text-primary transition-colors">
                                        {order.event.title}
                                    </h2>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em] flex items-center gap-1.5">
                                                <Calendar size={12} className="text-primary" /> Timeline
                                            </p>
                                            <p className="font-black text-sm uppercase tracking-tight">
                                                {new Date(order.event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em] flex items-center gap-1.5">
                                                <MapPin size={12} className="text-emerald-500" /> Sector
                                            </p>
                                            <p className="font-black text-sm uppercase tracking-tight truncate">
                                                {order.event.location || 'Seamless'}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em]">Grade</p>
                                            <p className="font-black text-sm uppercase tracking-tight text-white/90">
                                                {order.ticket.type}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.15em]">Credit</p>
                                            <p className="font-black text-xl tracking-tighter text-primary">
                                                ${order.totalAmount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/[0.03] md:w-80 flex flex-col items-center justify-center p-10 border-t md:border-t-0 md:border-l border-white/[0.05] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 md:w-1 md:h-full bg-gradient-to-b from-primary to-transparent" />

                                    <div className="p-4 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-6 group-hover:scale-105 transition-transform duration-500">
                                        <QrCode size={120} className="text-bg" />
                                    </div>
                                    <p className="text-[10px] font-mono font-black text-text-dim uppercase tracking-widest text-center mb-10 bg-white/5 py-1.5 px-3 rounded-full">
                                        {order.qrCode}
                                    </p>

                                    <div className="flex flex-col gap-3 w-full">
                                        <button className="btn-primary w-full flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
                                            <Download size={16} /> Save Pass
                                        </button>
                                        <button className="w-full py-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-[10px] font-black text-text-dim uppercase tracking-widest">
                                            Explore Event <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 glass-morphism rounded-radius-xl border-dashed">
                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <Ticket className="text-text-dim/20" size={48} />
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter mb-4">Empty Vault</h3>
                        <p className="text-text-dim font-medium max-w-sm mx-auto mb-12">
                            No tickets detected in your localized storage. Start your journey by exploring active events.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary flex items-center gap-3 mx-auto px-10 py-5 text-[10px] uppercase tracking-[0.2em]"
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
