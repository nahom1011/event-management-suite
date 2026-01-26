import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ShieldCheck, Zap, Globe, Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState<'google' | 'email'>('google');

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const { data } = await api.post('/auth/login', {
                idToken: credentialResponse.credential,
            });
            login(data.data.user, data.data.accessToken);
            navigate('/');
        } catch (err: any) {
            setError('Google sign-in failed. Please try again.');
            console.error('Login failed:', err);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/login', {
                email,
                password,
            });
            login(data.data.user, data.data.accessToken);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error('Email login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout showNav={false}>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-bg via-bg to-indigo-900/10">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md p-10 glass-morphism rounded-radius-xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/40"
                        >
                            <Calendar className="text-white" size={40} />
                        </motion.div>
                        <h1 className="text-5xl font-black tracking-tighter mb-2">Welcome</h1>
                        <p className="text-text-dim text-center font-medium">Gatekeeper to Extraordinary Experiences.</p>
                    </div>

                    <div className="flex bg-white/5 p-1.5 rounded-2xl mb-10 border border-white/5">
                        <button
                            onClick={() => setLoginType('google')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-500 ${loginType === 'google' ? 'bg-primary text-white shadow-xl' : 'text-text-dim hover:text-text'}`}
                        >
                            Express Access
                        </button>
                        <button
                            onClick={() => setLoginType('email')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-500 ${loginType === 'email' ? 'bg-primary text-white shadow-xl' : 'text-text-dim hover:text-text'}`}
                        >
                            Credentials
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {loginType === 'google' ? (
                            <motion.div
                                key="google"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-text/90 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Secure Auth</span>
                                            <span className="text-xs text-text-dim">End-to-end encrypted sessions</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-text/90 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                            <Zap size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Instant Sync</span>
                                            <span className="text-xs text-text-dim">Access your global event cloud</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center flex-col gap-4">
                                    <div className="w-full flex justify-center bg-white rounded-xl p-0.5 overflow-hidden">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => setError('Google Login Failed')}
                                            useOneTap
                                            theme="filled_blue"
                                            shape="pill"
                                            width="100%"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="email"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleEmailLogin}
                                className="space-y-6"
                            >
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center uppercase tracking-widest"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Identity</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-medium"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Passkey</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-xs uppercase tracking-[0.2em]"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <LogIn size={16} />
                                            <span>Enter Portal</span>
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-12 pt-8 border-t border-white/[0.03] text-center">
                        <p className="text-xs text-text-dim font-medium">
                            {loginType === 'email' ? (
                                <>
                                    New to the ecosystem?{' '}
                                    <Link to="/signup" className="text-primary hover:text-white font-black transition-colors ml-1 uppercase tracking-widest">
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <span className="uppercase tracking-[0.1em] opacity-40">Verified Infrastructure</span>
                            )}
                        </p>
                    </div>
                </motion.div>

                {/* Aesthetic Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 flex items-center gap-8 opacity-20"
                >
                    <Globe size={24} />
                    <Zap size={24} />
                    <ShieldCheck size={24} />
                </motion.div>
            </div>
        </Layout>
    );
};

export default LoginPage;
