import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                setMessage('No payment session found');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setStatus('error');
                    setMessage('Please log in to verify your payment');
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/payment/verify-session/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message);
                    setOrderId(response.data.orderId);
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Payment verification failed');
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to verify payment');
            }
        };

        verifyPayment();
    }, [sessionId]);

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-xl"
                >
                    {status === 'loading' && (
                        <>
                            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                                <Loader2 size={40} className="animate-spin" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Processing Payment</h1>
                            <p className="text-gray-300 mb-8">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                <CheckCircle2 size={40} />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
                            <p className="text-gray-300 mb-8">
                                Your ticket has been secured. You will receive an email confirmation shortly.
                            </p>
                            {orderId && (
                                <p className="text-sm text-gray-400 mb-6">Order ID: {orderId}</p>
                            )}
                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                View Your Tickets <ArrowRight size={20} />
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertCircle size={40} />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Verification Failed</h1>
                            <p className="text-gray-300 mb-8">{message}</p>
                            <button
                                onClick={() => navigate('/events')}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                Back to Events <ArrowRight size={20} />
                            </button>
                        </>
                    )}
                </motion.div>
            </div>
        </Layout>
    );
};

export default PaymentSuccessPage;
