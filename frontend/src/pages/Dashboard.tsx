import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, MapPin, Tag, Search, Filter } from 'lucide-react';
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
            <div className="py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black mb-2 tracking-tight">Discover Events</h1>
                        <p className="text-text-dim">Find and join the most exciting events happening near you.</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-surface-alt border border-white/5 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-primary/50 transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="bg-surface-alt border border-white/5 p-3 rounded-lg hover:border-primary/50 transition-all">
                            <Filter size={20} className="text-text-dim" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 glass-morphism rounded-radius-lg animate-pulse" />
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => navigate(`/events/${event.id}`)}
                                className="glass-morphism rounded-radius-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/10 relative"
                            >
                                <div className="h-48 bg-surface-alt relative overflow-hidden">
                                    {/* Placeholder image style */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent opacity-60" />
                                    <div className="absolute bottom-4 left-4 flex gap-2">
                                        <span className="bg-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white">Live</span>
                                        <span className="bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white">
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-text-dim text-sm">
                                            <Calendar size={14} />
                                            <span>{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-text-dim text-sm">
                                            <MapPin size={14} />
                                            <span className="line-clamp-1">{event.location || 'Online'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1 text-primary">
                                            <Tag size={14} />
                                            <span className="font-bold">
                                                {event.tickets?.[0]?.price ? `$${event.tickets[0].price}` : 'Free'}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-text-dim bg-white/5 px-2 py-1 rounded">
                                            View Details
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 glass-morphism rounded-radius-xl">
                        <Search className="mx-auto text-text-dim mb-4" size={48} />
                        <h3 className="text-2xl font-bold mb-2">No events found</h3>
                        <p className="text-text-dim">Try adjusting your search filters or check back later.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
