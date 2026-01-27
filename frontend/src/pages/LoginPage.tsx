import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ShieldCheck, Zap, Globe, Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import './LoginPage.css';

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
            <div className="login-container">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="login-card"
                >
                    <div className="login-card-accent" />

                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            className="login-icon-box"
                        >
                            <Calendar className="text-white" size={40} />
                        </motion.div>
                        <h1 className="login-title">Welcome</h1>
                        <p className="login-subtitle">Gatekeeper to Extraordinary Experiences.</p>
                    </div>

                    <div className="login-toggle-container">
                        <button
                            onClick={() => setLoginType('google')}
                            className={`login-toggle-btn ${loginType === 'google' ? 'login-toggle-btn-active' : 'login-toggle-btn-inactive'}`}
                        >
                            Express Access
                        </button>
                        <button
                            onClick={() => setLoginType('email')}
                            className={`login-toggle-btn ${loginType === 'email' ? 'login-toggle-btn-active' : 'login-toggle-btn-inactive'}`}
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
                                    <div className="feature-item">
                                        <div className="feature-icon-box bg-indigo-500/10 text-indigo-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Secure Auth</span>
                                            <span className="text-xs text-text-dim">End-to-end encrypted sessions</span>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon-box bg-amber-500/10 text-amber-400">
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
                                        className="error-message"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <label className="input-label">Identity</label>
                                    <div className="relative group">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="form-input"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="input-label">Passkey</label>
                                    <div className="relative group">
                                        <Lock className="input-icon" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="form-input"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="submit-btn"
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
                                    <Link to="/signup" className="footer-link">
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
                    className="aesthetic-footer"
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
