import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Users, ArrowLeft, Hash, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import './AttendeeListPage.css';

const AttendeeListPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAttendees = async () => {
            try {
                const { data } = await api.get(`/organizer/events/${id}/attendees`);
                setAttendees(data.data.attendees);
            } catch (error) {
                console.error('Failed to fetch attendees:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendees();
    }, [id]);

    const filteredAttendees = attendees.filter(a =>
        a.user.name.toLowerCase().includes(search.toLowerCase()) ||
        a.user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="attendee-list-container">
                <header className="attendee-header">
                    <div>
                        <div className="attendee-header-badge">
                            <Users size={14} />
                            Attendee Manifest
                        </div>
                        <h1 className="attendee-title">Event Node Access</h1>
                        <p className="attendee-subtitle">Detailed registry of all authorized participants.</p>
                    </div>

                    <button onClick={() => navigate('/organizer')} className="back-link-btn">
                        <ArrowLeft size={18} />
                        Back to Hub
                    </button>
                </header>

                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={20} />
                    <input
                        type="text"
                        placeholder="Search by identity or mail..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-text focus:outline-none focus:border-primary transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="attendee-content-card">
                    <div className="attendee-table-wrapper">
                        <table className="attendee-table">
                            <thead>
                                <tr>
                                    <th className="attendee-th">Subject Identity</th>
                                    <th className="attendee-th">Access Grade</th>
                                    <th className="attendee-th">Transaction Hash</th>
                                    <th className="attendee-th">Registry Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-text-dim">
                                            Synchronizing registry...
                                        </td>
                                    </tr>
                                ) : filteredAttendees.length > 0 ? (
                                    filteredAttendees.map((a, i) => (
                                        <motion.tr
                                            key={a.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="attendee-tr"
                                        >
                                            <td className="attendee-td">
                                                <div className="attendee-identity">
                                                    <div className="attendee-avatar">
                                                        {a.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="attendee-name">{a.user.name}</span>
                                                        <span className="attendee-email">{a.user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="attendee-td">
                                                <span className="ticket-type-badge">
                                                    {a.ticket.type}
                                                </span>
                                            </td>
                                            <td className="attendee-td">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={12} className="text-text-dim" />
                                                    <span className="order-id-text">{a.id.split('-')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="attendee-td">
                                                <div className="flex items-center gap-2 text-sm text-text-dim">
                                                    <Calendar size={14} />
                                                    {new Date(a.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="empty-attendees">
                                                <Users size={48} className="empty-attendees-icon mx-auto" />
                                                <h3>No Nodes Detected</h3>
                                                <p>No ticket sales matching your search parameters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AttendeeListPage;
