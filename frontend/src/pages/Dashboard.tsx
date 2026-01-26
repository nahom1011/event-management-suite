import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, MapPin, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
                <header className="relative py-12 md:py-20 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <Sparkles size={14} />
                        Next-Gen Event Platform
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[0.9]">
                        Discover. <span className="primary-gradient-text">Experience.</span> <br />
                        Connec<span className="relative">t<div className="absolute -right-4 top-0 w-3 h-3 bg-accent rounded-full animate-ping" /></span>.
                    </h1>

                    <p className="max-w-xl text-text-dim text-lg md:text-xl font-medium mb-12">
                        Your gateway to the world's most exclusive gatherings,
                        festivals, and professional summits.
                    </p>

                    <div className="w-full max-w-2xl flex flex-col md:flex-row gap-4 p-2 glass-morphism rounded-radius-xl">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={20} />
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none pl-12 pr-4 py-4 outline-none text-text placeholder:text-text-dim/50 font-medium"
                            />
                        </div>
                        <button className="btn-primary flex items-center justify-center gap-2 min-w-[140px]">
                            <Filter size={18} />
                            Filter
                        </button>
                    </div>
                </header>

                {/* Trending Section Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-2xl font-black">Featured Events</h2>
                    </div>
                    <div className="text-primary font-bold text-sm cursor-pointer hover:underline">View All</div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 glass-morphism rounded-radius-lg animate-pulse" />
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {filteredEvents.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                onClick={() => navigate(`/events/${event.id}`)}
                                className="glass-morphism rounded-radius-lg overflow-hidden card-hover group cursor-pointer relative"
                            >
                                <div className="h-56 bg-surface-alt relative overflow-hidden">
                                    {/* Mock Image Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-600/10 to-transparent" />
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80')] bg-cover bg-center" />

                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                            {event.status}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg to-transparent">
                                        <div className="flex items-center gap-2 text-white/90 font-bold mb-1">
                                            <Calendar size={16} className="text-primary" />
                                            <span className="text-xs uppercase tracking-tighter">
                                                {new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                                            {event.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-text-dim text-sm mb-6">
                                        <MapPin size={16} className="text-indigo-400" />
                                        <span className="font-medium group-hover:text-text transition-colors capitalize">
                                            {event.location || 'Seamless Experience'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl font-black tracking-tighter">
                                            {event.tickets?.[0]?.price ? `$${event.tickets[0].price}` : <span className="text-accent uppercase text-sm font-black">Free</span>}
                                        </div>
                                        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                                            <TrendingUp size={18} className="translate-y-[1px]" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 glass-morphism rounded-radius-xl border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-text-dim" size={32} />
                        </div>
                        <h3 className="text-3xl font-black mb-2">Null Sector</h3>
                        <p className="text-text-dim font-medium">We couldn't find any events matching your request.</p>
                        <button onClick={() => setSearch('')} className="mt-8 text-primary font-bold uppercase tracking-widest text-xs hover:underline">Reset Exploration</button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
