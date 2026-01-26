import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { Mail, Shield, Building, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
            <div className="py-8 max-w-4xl mx-auto">
                <h1 className="text-5xl font-black mb-8 tracking-tight">Profile Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* User Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="glass-morphism p-6 rounded-radius-lg flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary mb-4 flex items-center justify-center text-4xl font-bold">
                                {user?.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                            <p className="text-text-dim text-sm">{user?.role.toUpperCase()}</p>
                        </div>

                        <div className="glass-morphism p-6 rounded-radius-lg space-y-4">
                            <div className="flex items-center gap-3 text-text-dim">
                                <Mail size={18} />
                                <span className="text-sm">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-dim">
                                <Shield size={18} />
                                <span className="text-sm">Account Status: Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Organizer Status / Application */}
                    <div className="md:col-span-2">
                        {loading ? (
                            <div className="h-64 glass-morphism rounded-radius-lg animate-pulse" />
                        ) : profile ? (
                            <div className="glass-morphism p-8 rounded-radius-lg relative overflow-hidden">
                                <div className={`absolute top-0 right-0 px-4 py-2 text-xs font-bold uppercase tracking-widest ${profile.verificationStatus === 'approved' ? 'bg-emerald-500 text-white' :
                                    profile.verificationStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {profile.verificationStatus}
                                </div>

                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Building className="text-primary" /> Organizer Profile
                                </h3>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-text-dim text-xs uppercase font-bold tracking-wider mb-1">Organization Name</p>
                                            <p className="font-semibold text-lg">{profile.organizationName}</p>
                                        </div>
                                        <div>
                                            <p className="text-text-dim text-xs uppercase font-bold tracking-wider mb-1">Phone</p>
                                            <p className="font-semibold text-lg">{profile.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {profile.verificationStatus === 'pending' && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 text-amber-500">
                                            <Clock className="shrink-0" />
                                            <div>
                                                <p className="font-bold text-sm">Application Pending</p>
                                                <p className="text-xs">Your application is currently being reviewed by our administrators. This usually takes 24-48 hours.</p>
                                            </div>
                                        </div>
                                    )}

                                    {profile.verificationStatus === 'approved' && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg flex gap-3 text-emerald-500">
                                            <CheckCircle className="shrink-0" />
                                            <div>
                                                <p className="font-bold text-sm">Verified Organizer</p>
                                                <p className="text-xs">Congratulations! You are now a verified organizer. You can start creating events from your dashboard.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism p-8 rounded-radius-lg"
                            >
                                <h3 className="text-2xl font-bold mb-2">Become an Organizer</h3>
                                <p className="text-text-dim mb-8">Ready to host your own events? Apply now to get access to organizer tools.</p>

                                <form onSubmit={handleApply} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-text-dim">Organization Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-all font-medium"
                                            placeholder="e.g. Dream Events Co."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-text-dim">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-all font-medium"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div className="p-4 bg-indigo-500/10 rounded-lg flex gap-3 text-indigo-400 text-sm">
                                        <AlertCircle className="shrink-0" size={18} />
                                        <p>Your application will be manually reviewed by our admins. You'll be notified once approved.</p>
                                    </div>

                                    <button
                                        disabled={applying}
                                        type="submit"
                                        className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-4 rounded-lg transition-all active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        {applying ? "Submitting Application..." : "Submit Application"}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
