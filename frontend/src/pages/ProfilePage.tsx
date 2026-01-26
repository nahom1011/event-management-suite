import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { Mail, Shield, Building, CheckCircle, Clock, AlertCircle, User, Fingerprint, Phone, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

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
            <div className="max-w-6xl mx-auto space-y-12">
                <header>
                    <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                        <Settings size={14} />
                        Identity Management
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter">Profile Settings</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* User Info */}
                    <div className="md:col-span-4 space-y-8">
                        <div className="glass-morphism p-10 rounded-radius-xl flex flex-col items-center relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary to-secondary mb-8 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-primary/40 relative group"
                            >
                                {user?.name.charAt(0)}
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-bg border-4 border-surface rounded-full flex items-center justify-center text-primary">
                                    <Fingerprint size={20} />
                                </div>
                            </motion.div>

                            <h2 className="text-3xl font-black tracking-tighter mb-2">{user?.name}</h2>
                            <span className="px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-text-dim">
                                {user?.role.replace('_', ' ')}
                            </span>

                            <div className="w-full mt-12 space-y-4 pt-8 border-t border-white/[0.03]">
                                <div className="flex items-center gap-4 text-text-dim bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text">
                                        <Mail size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Communication</p>
                                        <p className="text-sm font-bold text-text truncate max-w-[180px]">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-text-dim bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Shield size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Integrity Status</p>
                                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Active Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organizer Status / Application */}
                    <div className="md:col-span-8">
                        {loading ? (
                            <div className="h-96 glass-morphism rounded-radius-xl animate-pulse" />
                        ) : profile ? (
                            <div className="glass-morphism p-10 rounded-radius-xl relative overflow-hidden">
                                <div className={`absolute top-0 right-0 px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${profile.verificationStatus === 'approved' ? 'bg-emerald-500 text-white' :
                                    profile.verificationStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                    }`}>
                                    {profile.verificationStatus}
                                </div>

                                <div className="flex items-center gap-4 mb-12">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Building size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter">Organizer Hub</h3>
                                        <p className="text-text-dim font-medium">Your enterprise-grade management portal.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-text-dim uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                            <User size={12} className="text-primary" /> Entity Name
                                        </p>
                                        <p className="font-black text-xl tracking-tight">{profile.organizationName}</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-text-dim uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                            <Phone size={12} className="text-indigo-400" /> Secure Link
                                        </p>
                                        <p className="font-black text-xl tracking-tight">{profile.phone || 'Classified'}</p>
                                    </div>
                                </div>

                                {profile.verificationStatus === 'pending' && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl flex gap-5 text-amber-500 items-start">
                                        <Clock className="shrink-0 mt-1" size={24} />
                                        <div>
                                            <p className="font-black text-lg tracking-tight mb-1 uppercase">Synchronizing Credentials...</p>
                                            <p className="text-sm font-medium opacity-80 leading-relaxed">Your application is currently being verified by the core node. This sequence usually completes within 24-48 solar hours.</p>
                                        </div>
                                    </div>
                                )}

                                {profile.verificationStatus === 'approved' && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex gap-5 text-emerald-500 items-start">
                                        <CheckCircle className="shrink-0 mt-1" size={24} />
                                        <div>
                                            <p className="font-black text-lg tracking-tight mb-1 uppercase">Clearance Granted</p>
                                            <p className="text-sm font-medium opacity-80 leading-relaxed">Full organizer privileges detected. You are authorized to deploy new event clusters from your dashboard.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-morphism p-10 rounded-radius-xl border-dashed border-2 border-primary/20"
                            >
                                <div className="max-w-xl">
                                    <h3 className="text-4xl font-black tracking-tighter mb-4">Expand Authority</h3>
                                    <p className="text-text-dim font-medium mb-10 leading-relaxed">
                                        Ready to host your own events on the global grid?
                                        Apply for Organizer Status to unlock full deployment tools.
                                    </p>

                                    <form onSubmit={handleApply} className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Entity Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={orgName}
                                                onChange={(e) => setOrgName(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold"
                                                placeholder="e.g. Apex Productions"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Secure Contact</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <div className="p-6 bg-indigo-500/10 rounded-2xl flex gap-4 text-indigo-400 text-sm border border-indigo-500/20">
                                            <AlertCircle className="shrink-0" size={20} />
                                            <p className="font-medium">Verification requires manual audit from the administrator node. Access logs will be updated upon clearance.</p>
                                        </div>

                                        <button
                                            disabled={applying}
                                            type="submit"
                                            className="w-full btn-primary py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
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
