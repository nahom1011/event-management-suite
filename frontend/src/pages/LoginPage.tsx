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
            <div className="min-h-screen flex flex-col items-center justify-center -mt-12">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md p-8 glass-morphism rounded-radius-xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/30">
                            <Calendar className="text-white" size={32} />
                        </div>
                        <h1 className="text-4xl font-black font-['Space_Grotesk'] mb-2 tracking-tight">Welcome</h1>
                        <p className="text-text-dim text-center text-sm">Manage, Host, and Discover amazing events with Eventify.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-lg mb-8">
                        <button
                            onClick={() => setLoginType('google')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${loginType === 'google' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-text'}`}
                        >
                            Google
                        </button>
                        <button
                            onClick={() => setLoginType('email')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${loginType === 'email' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-text'}`}
                        >
                            Email
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {loginType === 'google' ? (
                            <motion.div
                                key="google"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3 text-text/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                        <ShieldCheck className="text-indigo-400" size={18} />
                                        <span>Secure authentication with Google</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-text/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                        <Zap className="text-amber-400" size={18} />
                                        <span>Instant access to your dashboard</span>
                                    </div>
                                </div>

                                <div className="flex justify-center flex-col gap-4">
                                    <div className="w-full flex justify-center">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => setError('Google Login Failed')}
                                            useOneTap
                                            theme="filled_black"
                                            shape="pill"
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
                                className="space-y-4"
                            >
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-dim uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 transition-colors"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-dim uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                                            <span>Sign In</span>
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p className="text-xs text-text-dim text-center mt-8">
                        {loginType === 'email' ? (
                            <>
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-primary hover:underline font-semibold">
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            "By signing in, you agree to our Terms of Service and Privacy Policy."
                        )}
                    </p>
                </motion.div>

                {/* Feature Highlights */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl px-4">
                    {[
                        { icon: <Globe />, title: "Global Reach", desc: "Connect with attendees from all over the world." },
                        { icon: <Zap />, title: "Seamless UI", desc: "Crafted for speed and intuitive navigation." },
                        { icon: <ShieldCheck />, title: "Verified Tickets", desc: "Fraud-free ticketing system with QR validation." }
                    ].map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-primary mb-3 flex justify-center">{feat.icon}</div>
                            <h3 className="font-bold mb-1">{feat.title}</h3>
                            <p className="text-sm text-text-dim">{feat.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default LoginPage;
