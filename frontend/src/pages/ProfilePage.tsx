import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { Mail, Shield, Building, CheckCircle, Clock, AlertCircle, User, Fingerprint, Phone, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/organizer/profile');
                setProfile(data.data.profile);
            } catch (error) {
                console.log('No organizer profile yet');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplying(true);
        try {
            const { data } = await api.post('/organizer/apply', { organizationName: orgName, phone });
            setProfile(data.data.profile);
        } catch (error) {
            console.error('Application failed:', error);
            alert('Failed to submit application.');
        } finally {
            setApplying(false);
        }
    };

    return (
        <Layout>
            <div className="profile-container">
                <header>
                    <div className="profile-header-badge">
                        <Settings size={14} />
                        Identity Management
                    </div>
                    <h1 className="profile-title">Profile Settings</h1>
                </header>

                <div className="profile-grid">
                    {/* User Info */}
                    <div className="user-info-column">
                        <div className="user-card">
                            <div className="card-top-accent" />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="avatar-container"
                            >
                                {user?.name.charAt(0)}
                                <div className="fingerprint-icon">
                                    <Fingerprint size={20} />
                                </div>
                            </motion.div>

                            <h2 className="user-name">{user?.name}</h2>
                            <span className="role-badge">
                                {user?.role.replace('_', ' ')}
                            </span>

                            <div className="info-list">
                                <div className="info-item">
                                    <div className="info-icon-box bg-white/5 text-text">
                                        <Mail size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="info-label">Communication</p>
                                        <p className="info-value">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon-box bg-emerald-500/10 text-emerald-500">
                                        <Shield size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="info-label">Integrity Status</p>
                                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Active Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organizer Status / Application */}
                    <div className="organizer-column">
                        {loading ? (
                            <div className="loading-skeleton" />
                        ) : profile ? (
                            <div className="organizer-card">
                                <div className={`status-badge ${profile.verificationStatus === 'approved' ? 'bg-emerald-500 text-white' :
                                    profile.verificationStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                    }`}>
                                    {profile.verificationStatus}
                                </div>

                                <div className="hub-header">
                                    <div className="hub-icon-box">
                                        <Building size={28} />
                                    </div>
                                    <div>
                                        <h3 className="hub-title">Organizer Hub</h3>
                                        <p className="hub-subtitle">Your enterprise-grade management portal.</p>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <p className="stat-label">
                                            <User size={12} className="text-primary" /> Entity Name
                                        </p>
                                        <p className="stat-value">{profile.organizationName}</p>
                                    </div>
                                    <div className="stat-card">
                                        <p className="stat-label">
                                            <Phone size={12} className="text-indigo-400" /> Secure Link
                                        </p>
                                        <p className="stat-value">{profile.phone || 'Classified'}</p>
                                    </div>
                                </div>

                                {profile.verificationStatus === 'pending' && (
                                    <div className="alert-box bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                        <Clock className="shrink-0 mt-1" size={24} />
                                        <div>
                                            <p className="alert-title">Synchronizing Credentials...</p>
                                            <p className="alert-description">Your application is currently being verified by the core node. This sequence usually completes within 24-48 solar hours.</p>
                                        </div>
                                    </div>
                                )}

                                {profile.verificationStatus === 'approved' && (
                                    <div className="alert-box bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                        <CheckCircle className="shrink-0 mt-1" size={24} />
                                        <div>
                                            <p className="alert-title">Clearance Granted</p>
                                            <p className="alert-description">Full organizer privileges detected. You are authorized to deploy new event clusters from your dashboard.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="apply-card"
                            >
                                <div className="max-w-xl">
                                    <h3 className="apply-title">Expand Authority</h3>
                                    <p className="apply-subtitle">
                                        Ready to host your own events on the global grid?
                                        Apply for Organizer Status to unlock full deployment tools.
                                    </p>

                                    <form onSubmit={handleApply} className="space-y-8">
                                        <div className="form-group">
                                            <label className="form-label">Entity Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={orgName}
                                                onChange={(e) => setOrgName(e.target.value)}
                                                className="form-input"
                                                placeholder="e.g. Apex Productions"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Secure Contact</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="form-input"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <div className="verification-notice">
                                            <AlertCircle className="shrink-0" size={20} />
                                            <p className="font-medium">Verification requires manual audit from the administrator node. Access logs will be updated upon clearance.</p>
                                        </div>

                                        <button
                                            disabled={applying}
                                            type="submit"
                                            className="submit-application-btn"
                                        >
                                            {applying ? "Initializing Protocol..." : "Transmit Application"}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
