import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, Download, FileText, QrCode as QrIcon } from 'lucide-react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { downloadQRCode, generatePDFTicket } from '../utils/ticketUtils';

interface Ticket {
    id: string;
    code: string;
    qrCode: string;
    status: string;
    event: {
        title: string;
        description: string;
        location: string;
        startDate: string;
        endDate: string;
    };
    ticketType: {
        name: string;
        price: string;
        currency: string;
    };
    user: {
        name: string;
        email: string;
    };
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

    const handleDownloadQRCode = (qrCode: string, ticketCode: string) => {
        downloadQRCode(qrCode, ticketCode);
    };

    const handleGeneratePDFTicket = (ticket: Ticket) => {
        generatePDFTicket(ticket);
    };

    return (
        <Layout>
            <div className="relative min-h-screen pt-24 pb-20 px-4 overflow-hidden bg-[#030303]">
                {/* Aurora Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 45, 0],
                            opacity: [0.15, 0.25, 0.15]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/30 blur-[120px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -60, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[100px] rounded-full"
                    />
                    <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-blue-500/10 blur-[80px] rounded-full" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        {status === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-2xl shadow-2xl"
                            >
                                <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                                    <Loader2 size={64} className="text-blue-500 animate-spin relative z-10" />
                                </div>
                                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Securing Your Access</h1>
                                <p className="text-gray-400 text-lg max-w-md mx-auto">{message}</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full"
                            >
                                {/* Header Card */}
                                <div className="bg-white/5 border border-white/10 rounded-[32px] p-10 mb-12 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t-white/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] -mr-32 -mt-32 rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />

                                    <div className="relative z-10 text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                            className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/30"
                                        >
                                            <CheckCircle2 size={48} strokeWidth={2.5} />
                                        </motion.div>

                                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                            Experience Confirmed
                                        </h1>
                                        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                                            Your digital tickets are now active. Prepare for an unforgettable journey.
                                        </p>

                                        {orderId && (
                                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-mono tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                ORDER REF: {orderId.split('-')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tickets Section */}
                                {tickets.length > 0 && (
                                    <div className="space-y-10 mb-16">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                                            <div>
                                                <h2 className="text-3xl font-black text-white tracking-tight">Your Vault</h2>
                                                <p className="text-gray-400 mt-1">High-fidelity digital credentials for your events.</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                                                <QrIcon size={20} />
                                                <span>{tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {tickets.map((ticket, index) => (
                                                <motion.div
                                                    key={ticket.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.15 }}
                                                    whileHover={{ y: -5 }}
                                                    className="group relative"
                                                >
                                                    {/* Ticket Shape with Custom Masking/Styling */}
                                                    <div className="relative bg-[#1a1a1a] border border-white/10 rounded-[24px] p-6 lg:p-8 flex items-center gap-6 shadow-2xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-primary/10 group-hover:shadow-2xl overflow-hidden">
                                                        {/* Notched Decor */}
                                                        <div className="absolute top-1/2 -left-2 w-4 h-8 bg-[#030303] rounded-r-full -translate-y-1/2 border-r border-white/10 group-hover:border-primary/40 transition-colors" />
                                                        <div className="absolute top-1/2 -right-2 w-4 h-8 bg-[#030303] rounded-l-full -translate-y-1/2 border-l border-white/10 group-hover:border-primary/40 transition-colors" />

                                                        {/* Ticket Content */}
                                                        <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center w-full">
                                                            <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                                <div className="absolute inset-0 bg-white/80 blur-lg scale-0 group-hover:scale-110 transition-transform duration-500 rounded-xl" />
                                                                <div className="bg-white p-2.5 rounded-xl relative z-10 shadow-lg">
                                                                    <img
                                                                        src={ticket.qrCode}
                                                                        alt="Ticket QR"
                                                                        className="w-28 h-28 mix-blend-multiply"
                                                                    />
                                                                </div>
                                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded border border-white/20 whitespace-nowrap shadow-xl">
                                                                    {ticket.code}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 text-center sm:text-left min-w-0">
                                                                <h3 className="text-xl font-black text-white mb-1 truncate leading-tight group-hover:text-primary transition-colors">
                                                                    {ticket.event.title}
                                                                </h3>
                                                                <div className="flex items-center justify-center sm:justify-start gap-4 mb-5">
                                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                                        {new Date(ticket.event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                                    <span className="text-xs font-bold text-primary uppercase tracking-widest leading-none">
                                                                        {ticket.ticketType.name}
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-col gap-2.5">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleGeneratePDFTicket(ticket)}
                                                                        className="relative w-full bg-white text-black font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/5 active:shadow-none overflow-hidden group/btn"
                                                                    >
                                                                        {/* Glossy Reflection Effect */}
                                                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                                                        <FileText size={14} className="relative z-10" />
                                                                        <span className="relative z-10">DOWNLOAD PASS</span>
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleDownloadQRCode(ticket.qrCode, ticket.code)}
                                                                        className="w-full bg-white/5 border border-white/10 text-white/70 font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                                                    >
                                                                        <Download size={12} /> GET QR ONLY
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/orders')}
                                        className="relative w-full sm:w-auto px-12 py-5 bg-primary text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(var(--theme-primary-rgb),0.4)] hover:shadow-[0_25px_50px_-12px_rgba(var(--theme-primary-rgb),0.6)] transition-all group overflow-hidden"
                                    >
                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                                        <span className="relative z-10">Enter The Vault</span>
                                        <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>

                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        End Session
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#1a1a1a] border border-red-500/20 rounded-[32px] p-12 text-center backdrop-blur-3xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30" />
                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                    <AlertCircle size={40} />
                                </div>
                                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Access Restricted</h1>
                                <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">{message}</p>
                                <button
                                    onClick={() => navigate('/events')}
                                    className="w-full md:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    Return to Discovery <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <style>{`
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    .animate-shimmer {
                        animation: shimmer 1.5s infinite;
                    }
                `}</style>
            </div>
        </Layout>
    );
};

export default PaymentSuccessPage;
