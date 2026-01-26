import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
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

    if (loading) return <Layout><div>Loading...</div></Layout>;
    if (!event) return <Layout><div>Event not found</div></Layout>;

    return (
        <Layout>
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-text-dim hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-[400px] bg-surface-alt rounded-radius-xl relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20" />
                        <div className="absolute bottom-8 left-8">
                            <h1 className="text-5xl font-black tracking-tight mb-4">{event.title}</h1>
                            <div className="flex flex-wrap gap-4">
                                <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {event.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="glass-morphism p-8 rounded-radius-xl">
                        <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                        <p className="text-text-dim leading-relaxed whitespace-pre-wrap">
                            {event.description || 'No description provided.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-morphism p-8 rounded-radius-xl sticky top-24">
                        <h3 className="text-xl font-bold mb-6">Event Details</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-text-dim uppercase font-bold tracking-wider">Date</p>
                                    <p className="font-semibold">{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-text-dim uppercase font-bold tracking-wider">Time</p>
                                    <p className="font-semibold">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-text-dim uppercase font-bold tracking-wider">Location</p>
                                    <p className="font-semibold">{event.location || 'Online'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5">
                            <h4 className="font-bold mb-4">Select Tickets</h4>
                            {event.tickets?.length > 0 ? (
                                <div className="space-y-4">
                                    {event.tickets.map((t: any) => (
                                        <div key={t.id} className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">{t.type}</p>
                                                <p className="text-primary font-black">${t.price}</p>
                                            </div>
                                            <button
                                                disabled={purchasing || purchaseSuccess || t.quantity <= 0}
                                                onClick={() => handlePurchase(t.id)}
                                                className={`px-4 py-2 rounded-lg font-bold transition-all ${purchaseSuccess
                                                    ? 'bg-emerald-500 text-white'
                                                    : t.quantity <= 0
                                                        ? 'bg-red-500/20 text-red-500 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-indigo-600 text-white active:scale-95'
                                                    }`}
                                            >
                                                {purchaseSuccess ? (
                                                    <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Confirmed</span>
                                                ) : purchasing ? (
                                                    "Processing..."
                                                ) : t.quantity <= 0 ? (
                                                    "Sold Out"
                                                ) : (
                                                    "Book Now"
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-amber-500/10 text-amber-500 rounded-lg text-sm font-medium">
                                    No tickets available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EventDetailPage;
