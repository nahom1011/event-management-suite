import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2, Share2, Heart, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        </Layout>
    );

    if (!event) return (
        <Layout>
            <div className="text-center py-20">
                <h1 className="text-4xl font-black mb-4">Event Materialized Out of Bound</h1>
                <p className="text-text-dim mb-8">The event you are looking for does not exist in this sector.</p>
                <button onClick={() => navigate('/')} className="btn-primary">Return to Discovery</button>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-3 text-text-dim hover:text-text transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                        <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Back to Deck
                    </button>

                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-text-dim hover:text-accent hover:bg-accent/10 transition-all">
                            <Heart size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary/10 transition-all">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Immersive Event Hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-video md:aspect-[21/9] rounded-radius-xl overflow-hidden shadow-2xl group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-600/10 to-transparent" />
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />

                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
                                    <Award size={12} />
                                    Premium Experience
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 leading-tight">
                                    {event.title}
                                </h1>
                            </div>
                        </motion.div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-primary rounded-full" />
                                    Expedition Details
                                </h2>
                                <div className="p-8 glass-morphism rounded-radius-xl">
                                    <p className="text-text-dim leading-relaxed text-lg font-medium whitespace-pre-wrap">
                                        {event.description || 'No specialized description provided for this event.'}
                                    </p>
                                </div>
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 glass-morphism rounded-radius-lg border-l-4 border-indigo-500">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-4">Vibe Check</h4>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <Sparkles size={24} />
                                        </div>
                                        <p className="font-bold text-text-dim">High Energy Atmosphere</p>
                                    </div>
                                </div>
                                <div className="p-6 glass-morphism rounded-radius-lg border-l-4 border-emerald-500">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-4">Status</h4>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <p className="font-bold text-text-dim capitalize">{event.status} Priority</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Event Meta Card */}
                        <div className="glass-morphism p-8 rounded-radius-xl sticky top-28 space-y-10 border-t-2 border-primary/30">
                            <div className="space-y-8">
                                <div className="flex gap-5">
                                    <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-primary group hover:scale-110 transition-transform">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] text-text-dim uppercase font-black tracking-[0.2em] mb-1">Launch Date</p>
                                        <p className="font-black text-lg">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-xs text-text-dim font-bold">{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                    </div>
                                </div>

                                <div className="flex gap-5">
                                    <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-amber-500 hover:scale-110 transition-transform">
                                        <Clock size={24} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] text-text-dim uppercase font-black tracking-[0.2em] mb-1">Duration Window</p>
                                        <p className="font-black text-lg">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-xs text-text-dim font-bold">Local Sector Time</p>
                                    </div>
                                </div>

                                <div className="flex gap-5">
                                    <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-emerald-500 hover:scale-110 transition-transform">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] text-text-dim uppercase font-black tracking-[0.2em] mb-1">Coordinates</p>
                                        <p className="font-black text-lg truncate w-48">{event.location || 'Seamless Portal'}</p>
                                        <p className="text-xs text-text-dim font-bold">Verified Location</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-10 border-t border-white/[0.05]">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6">Access Passes</h4>
                                {event.tickets?.length > 0 ? (
                                    <div className="space-y-4">
                                        {event.tickets.map((t: any) => (
                                            <div
                                                key={t.id}
                                                className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 hover:border-primary/30 transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <p className="font-black text-lg leading-tight uppercase tracking-tight">{t.type}</p>
                                                        <p className="text-xs text-text-dim font-bold">{t.quantity} Units Available</p>
                                                    </div>
                                                    <div className="text-2xl font-black text-primary tracking-tighter">${t.price}</div>
                                                </div>
                                                <button
                                                    disabled={purchasing || purchaseSuccess || t.quantity <= 0}
                                                    onClick={() => handlePurchase(t.id)}
                                                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${purchaseSuccess
                                                        ? 'bg-emerald-500 text-white'
                                                        : t.quantity <= 0
                                                            ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed border border-red-500/20'
                                                            : 'bg-primary hover:bg-indigo-600 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]'
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
                                    <div className="text-center p-8 bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
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
