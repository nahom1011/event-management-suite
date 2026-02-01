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
    const [error, setError] = useState<string | React.ReactNode>('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState<'google' | 'email'>('google');

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            console.log('🔵 Google Sign-In Response:', credentialResponse);
            console.log('🔵 Credential Token:', credentialResponse.credential?.substring(0, 50) + '...');

            const { data } = await api.post('/auth/login', {
                idToken: credentialResponse.credential,
            });

            console.log('✅ Login successful:', data);
            login(data.data.user, data.data.accessToken);
            navigate('/');
        } catch (err: any) {
            console.error('❌ Google Sign-In Error:', err);
            console.error('❌ Error Response:', err.response?.data);
            console.error('❌ Error Status:', err.response?.status);

            const errorMessage = err.response?.data?.message || 'Google sign-in failed. Please try again.';
            setError(errorMessage);
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
            if (err.response?.status === 403 && err.response?.data?.message?.includes('verify')) {
                setError(
                    <span>
                        {err.response.data.message}{' '}
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    await api.post('/auth/resend-verification', { email });
                                    setError('Verification email resent! Please check your inbox.');
                                } catch (resendErr: any) {
                                    setError(resendErr.response?.data?.message || 'Failed to resend email.');
                                }
                            }}
                            className="underline font-bold hover:text-white"
                        >
                            Resend?
                        </button>
                    </span>
                );
            } else {
                setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            }
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

                    <div className="login-header">
                        <motion.div
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            className="login-icon-box"
                        >
                            <Calendar size={40} />
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
                                className="login-step"
                            >
                                <div className="features-list">
                                    <div className="feature-item">
                                        <div className="feature-icon-box feature-icon-secure">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div className="feature-text">
                                            <span className="feature-label">Secure Auth</span>
                                            <span className="feature-desc">End-to-end encrypted sessions</span>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon-box feature-icon-sync">
                                            <Zap size={20} />
                                        </div>
                                        <div className="feature-text">
                                            <span className="feature-label">Instant Sync</span>
                                            <span className="feature-desc">Access your global event cloud</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="google-login-wrapper">
                                    <div className="google-btn-container">
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
                                className="login-form"
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

                                <div className="input-field-group">
                                    <label className="input-label">Identity</label>
                                    <div className="input-wrapper">
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

                                <div className="input-field-group">
                                    <label className="input-label">Passkey</label>
                                    <div className="input-wrapper">
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
                                        <div className="spinner" />
                                    ) : (
                                        <div className="btn-content">
                                            <LogIn size={16} />
                                            <span>Enter Portal</span>
                                        </div>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="login-footer">
                        <p className="footer-text">
                            {loginType === 'email' ? (
                                <>
                                    New to the ecosystem?{' '}
                                    <Link to="/signup" className="register-link">
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <span className="infrastructure-text">Verified Infrastructure</span>
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
