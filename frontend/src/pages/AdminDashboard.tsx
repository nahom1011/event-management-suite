import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    ShieldCheck, User, Check, X,
    Mail, Phone, MapPin, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'organizers' | 'events'>('organizers');
    const [organizers, setOrganizers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'organizers') {
                const { data } = await api.get('/admin/pending-organizers');
                setOrganizers(data.data.applications);
            } else if (activeTab === 'events') {
                const { data } = await api.get('/admin/pending-events');
                setEvents(data.data.events);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleOrganizerReview = async (id: string, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            await api.patch(`/admin/review-organizer/${id}`, { status });
            setOrganizers(prev => prev.filter(app => app.id !== id));
        } catch (error) {
            console.error('Review failed:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleEventReview = async (id: string, status: 'approved' | 'live' | 'cancelled') => {
        setProcessingId(id);
        try {
            await api.patch(`/admin/review-event/${id}`, { status });
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Review failed:', error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Admin Moderation</h1>
                        <p className="admin-subtitle">Maintain platform integrity and review submissions.</p>
                    </div>

                    <div className="admin-tabs-container">
                        {['organizers', 'events'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`admin-tab-btn ${activeTab === tab ? 'admin-tab-btn-active' : 'admin-tab-btn-inactive'}`}
                            >
                                {tab}
                                {tab === 'organizers' && organizers.length > 0 && <span className="ml-1 opacity-50">({organizers.length})</span>}
                                {tab === 'events' && events.length > 0 && <span className="ml-1 opacity-50">({events.length})</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="admin-content-card">
                    {activeTab === 'organizers' ? (
                        <OrganizerTable organizers={organizers} loading={loading} processingId={processingId} onReview={handleOrganizerReview} />
                    ) : (
                        <EventTable events={events} loading={loading} processingId={processingId} onReview={handleEventReview} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

const OrganizerTable = ({ organizers, loading, processingId, onReview }: any) => (
    <>
        <div className="table-header">
            <div className="col-span-4">Organizer / Company</div>
            <div className="col-span-4">Contact Details</div>
            <div className="col-span-2 text-center">Applied Date</div>
            <div className="col-span-2 text-right">Actions</div>
        </div>
        {loading ? <LoadingIndicator /> : organizers.length > 0 ? (
            <div className="table-body">
                {organizers.map((app: any) => (
                    <motion.div key={app.id} className="table-row">
                        <div className="col-span-4 flex items-center gap-4">
                            <div className="org-avatar">{app.organizationName.charAt(0)}</div>
                            <div>
                                <p className="font-bold text-lg">{app.organizationName}</p>
                                <p className="text-text-dim text-sm flex items-center gap-1"><User size={12} /> {app.user.name}</p>
                            </div>
                        </div>
                        <div className="col-span-4 space-y-1">
                            <p className="text-sm flex items-center gap-2"><Mail size={14} className="text-text-dim" /> {app.user.email}</p>
                            <p className="text-sm flex items-center gap-2"><Phone size={14} className="text-text-dim" /> {app.phone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2 text-center text-text-dim">{new Date(app.createdAt).toLocaleDateString()}</div>
                        <div className="col-span-2 flex justify-end gap-3">
                            <button onClick={() => onReview(app.id, 'rejected')} disabled={!!processingId} className="action-btn-icon action-btn-reject"><X size={20} /></button>
                            <button onClick={() => onReview(app.id, 'approved')} disabled={!!processingId} className="action-btn-icon action-btn-approve"><Check size={20} /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : <EmptyQueue message="No pending organizer applications." />}
    </>
);

const EventTable = ({ events, loading, processingId, onReview }: any) => (
    <>
        <div className="table-header">
            <div className="col-span-4">Event Details</div>
            <div className="col-span-3">Organizer</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-3 text-right">Actions</div>
        </div>
        {loading ? <LoadingIndicator /> : events.length > 0 ? (
            <div className="table-body">
                {events.map((event: any) => (
                    <motion.div key={event.id} className="table-row">
                        <div className="col-span-4">
                            <p className="font-bold text-lg">{event.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-text-dim flex items-center gap-1"><MapPin size={12} /> {event.location || 'Online'}</span>
                            </div>
                        </div>
                        <div className="col-span-3 font-medium text-text-dim uppercase text-[10px] tracking-widest">{event.organizer.organizationName}</div>
                        <div className="col-span-2 text-center text-text-dim text-sm">{new Date(event.startDate).toLocaleDateString()}</div>
                        <div className="col-span-3 flex justify-end gap-3">
                            <button className="action-btn-icon action-btn-view"><Eye size={18} /></button>
                            <button onClick={() => onReview(event.id, 'cancelled')} disabled={!!processingId} className="action-btn-icon action-btn-reject"><X size={20} /></button>
                            <button onClick={() => onReview(event.id, 'live')} disabled={!!processingId} className="action-btn-icon action-btn-approve"><Check size={20} /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : <EmptyQueue message="No events awaiting approval." />}
    </>
);


const LoadingIndicator = () => <div className="loading-state">Loading queue...</div>;

const EmptyQueue = ({ message }: { message: string }) => (
    <div className="empty-queue">
        <ShieldCheck size={64} className="text-white/10 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Queue is clear!</h3>
        <p className="text-text-dim">{message}</p>
    </div>
);

export default AdminDashboard;
