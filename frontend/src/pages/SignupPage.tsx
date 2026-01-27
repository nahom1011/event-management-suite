import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';
import './SignupPage.css';

const SignupPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/register', {
                email,
                password,
                name,
            });

            login(data.data.user, data.data.accessToken);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout showNav={false}>
            <div className="signup-container">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="signup-card"
                >
                    <div className="signup-card-accent" />

                    <div className="signup-header">
                        <div className="signup-icon-box">
                            <Calendar className="text-white" size={32} />
                        </div>
                        <h1 className="signup-title">Join Eventify</h1>
                        <p className="signup-subtitle">Create an account to host and join amazing events.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signup-form">
                        {error && (
                            <div className="signup-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group-signup">
                            <label className="signup-label">Full Name</label>
                            <div className="signup-input-wrapper">
                                <User className="signup-input-icon" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="signup-input"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="form-group-signup">
                            <label className="signup-label">Email Address</label>
                            <div className="signup-input-wrapper">
                                <Mail className="signup-input-icon" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="signup-input"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-group-signup">
                            <label className="signup-label">Password</label>
                            <div className="signup-input-wrapper">
                                <Lock className="signup-input-icon" size={18} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="signup-input"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="signup-submit-btn"
                        >
                            {isLoading ? (
                                <div className="loading-spinner-signup" />
                            ) : (
                                <>
                                    <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="signup-footer">
                        Already have an account?{' '}
                        <Link to="/login" className="signup-login-link">
                            Log In
                        </Link>
                    </p>
                </motion.div>
            </div>
        </Layout>
    );
};

export default SignupPage;
