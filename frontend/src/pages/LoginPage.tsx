import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Calendar, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const { data } = await api.post('/auth/login', {
                idToken: credentialResponse.credential,
            });
            console.log('Login Success:', data);
            login(data.data.user, data.data.accessToken);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
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
                    {/* Accent decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/30">
                            <Calendar className="text-white" size={32} />
                        </div>
                        <h1 className="text-4xl font-black font-['Space_Grotesk'] mb-2 tracking-tight">Welcome</h1>
                        <p className="text-text-dim text-center">Manage, Host, and Discover amazing events with Eventify.</p>
                    </div>

                    <div className="space-y-4 mb-10 text-sm">
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
                                onSuccess={handleSuccess}
                                onError={() => console.log('Login Failed')}
                                useOneTap
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                        <p className="text-xs text-text-dim text-center mt-4">
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
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
