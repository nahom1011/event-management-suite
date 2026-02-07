import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, Download, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import api from '../services/api';
import { downloadQRCode, generatePDFTicket } from '../utils/ticketUtils'; // Static import for utility functions

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

    // Simplified local logic by using imported functions
    const handleDownloadQRCode = (qrCode: string, ticketCode: string) => {
        downloadQRCode(qrCode, ticketCode);
    };

    const handleGeneratePDFTicket = (ticket: Ticket) => {
        generatePDFTicket(ticket);
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-4xl w-full text-center backdrop-blur-xl"
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
                                Your ticket has been secured. You can download your tickets below.
                            </p>
                            {orderId && (
                                <p className="text-sm text-gray-400 mb-6">Order ID: {orderId}</p>
                            )}

                            {/* QR Codes Section */}
                            {tickets.length > 0 && (
                                <div className="mt-8 mb-12">
                                    <h2 className="text-2xl font-bold text-white mb-8 text-left border-b border-white/10 pb-4">Your Tickets</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {tickets.map((ticket, index) => (
                                            <motion.div
                                                key={ticket.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row gap-6 items-center text-left"
                                            >
                                                <div className="bg-white p-3 rounded-xl flex-shrink-0 shadow-lg">
                                                    <img
                                                        src={ticket.qrCode}
                                                        alt={`QR Code for ticket ${ticket.code}`}
                                                        className="w-32 h-32"
                                                    />
                                                </div>

                                                <div className="flex-1 w-full">
                                                    <h3 className="text-lg font-bold text-white mb-1 truncate">{ticket.event.title}</h3>
                                                    <p className="text-sm text-gray-400 mb-4">{new Date(ticket.event.startDate).toLocaleDateString()}</p>

                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => handleGeneratePDFTicket(ticket)}
                                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                                                        >
                                                            <FileText size={18} />
                                                            Download PDF Ticket
                                                        </button>

                                                        <button
                                                            onClick={() => handleDownloadQRCode(ticket.qrCode, ticket.code)}
                                                            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10"
                                                        >
                                                            <Download size={18} />
                                                            Download QR Only
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-4 px-12 rounded-2xl flex items-center justify-center gap-2 transition-all mx-auto text-lg shadow-xl shadow-primary/20"
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
