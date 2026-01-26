import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { ShieldCheck, User, Users, Check, X, Building, Mail, Phone, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const { data } = await api.get('/admin/pending-organizers');
                setApplications(data.data.applications);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const handleReview = async (id: string, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            await api.patch(`/admin/review-organizer/${id}`, { status });
            setApplications(prev => prev.filter(app => app.id !== id));
        } catch (error) {
            console.error('Review failed:', error);
            alert('Failed to process application review.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Layout>
            <div className="py-8">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-black mb-2 tracking-tight">Admin Moderation</h1>
                        <p className="text-text-dim text-lg">Manage organizer applications and platform integrity.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-morphism px-6 py-4 rounded-radius-lg text-center">
                            <p className="text-text-dim text-xs font-bold uppercase tracking-widest mb-1">Queue</p>
                            <p className="text-3xl font-black text-primary">{applications.length}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-morphism rounded-radius-xl overflow-hidden border border-white/5">
                    <div className="bg-white/5 p-4 border-b border-white/5 grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-text-dim">
                        <div className="col-span-4">Organizer / Company</div>
                        <div className="col-span-4">Contact Details</div>
                        <div className="col-span-2 text-center">Applied Date</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-text-dim animate-pulse">Loading moderation queue...</div>
                    ) : applications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            <AnimatePresence>
                                {applications.map((app) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-500/20 text-primary rounded-lg flex items-center justify-center font-bold">
                                                    {app.organizationName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{app.organizationName}</p>
                                                    <p className="text-text-dim text-sm flex items-center gap-1">
                                                        <User size={12} /> {app.user.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-4 space-y-1">
                                            <p className="text-sm flex items-center gap-2">
                                                <Mail size={14} className="text-text-dim" /> {app.user.email}
                                            </p>
                                            <p className="text-sm flex items-center gap-2">
                                                <Phone size={14} className="text-text-dim" /> {app.phone || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="col-span-2 text-center text-sm font-medium">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </div>

                                        <div className="col-span-2 flex justify-end gap-3">
                                            <button
                                                disabled={!!processingId}
                                                onClick={() => handleReview(app.id, 'rejected')}
                                                className="w-10 h-10 rounded-lg border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-all disabled:opacity-50"
                                            >
                                                {processingId === app.id ? <div className="animate-spin h-4 w-4 border-2 border-red-500" /> : <X size={20} />}
                                            </button>
                                            <button
                                                disabled={!!processingId}
                                                onClick={() => handleReview(app.id, 'approved')}
                                                className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {processingId === app.id ? <div className="animate-spin h-4 w-4 border-2 border-white" /> : <Check size={20} />}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="p-20 text-center flex flex-col items-center">
                            <ShieldCheck size={64} className="text-white/10 mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Queue is clear!</h3>
                            <p className="text-text-dim">All organizer applications have been reviewed.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
