import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import api from '../services/api';

interface Ticket {
    id: string;
    code: string;
    qrCode: string;
    status: string;
}

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                setMessage('No payment session found');
                return;
            }

            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setStatus('error');
                    setMessage('Please log in to verify your payment');
                    return;
                }

                const response = await api.get(
                    `/payments/verify-session/${sessionId}`,
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
                    setTickets(response.data.tickets || []);
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

    const downloadQRCode = (qrCode: string, ticketCode: string) => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `ticket-${ticketCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl w-full text-center backdrop-blur-xl"
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

                            {/* QR Codes Section */}
                            {tickets.length > 0 && (
                                <div className="mt-8 mb-8">
                                    <h2 className="text-xl font-semibold text-white mb-6">Your Ticket{tickets.length > 1 ? 's' : ''}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {tickets.map((ticket, index) => (
                                            <motion.div
                                                key={ticket.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm"
                                            >
                                                <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                                                    <img
                                                        src={ticket.qrCode}
                                                        alt={`QR Code for ticket ${ticket.code}`}
                                                        className="w-48 h-48 mx-auto"
                                                    />
                                                </div>
                                                <p className="text-sm font-mono text-gray-300 mb-3">
                                                    {ticket.code}
                                                </p>
                                                <button
                                                    onClick={() => downloadQRCode(ticket.qrCode, ticket.code)}
                                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all border border-white/20"
                                                >
                                                    <Download size={18} />
                                                    Download QR Code
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
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
