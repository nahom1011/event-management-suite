import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, Download, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import api from '../services/api';
import { jsPDF } from 'jspdf';

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

    const downloadQRCode = (qrCode: string, ticketCode: string) => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `ticket-qr-${ticketCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generatePDFTicket = (ticket: Ticket) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Set colors
        const primaryColor = [79, 70, 229]; // Indigo
        const secondaryColor = [107, 114, 128]; // Gray

        // Header Background
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('EVENT TICKET', 105, 25, { align: 'center' });

        // Event Details Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(ticket.event.title, 20, 60);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

        const startDate = new Date(ticket.event.startDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        doc.text(`Date: ${startDate}`, 20, 70);
        doc.text(`Location: ${ticket.event.location || 'Online'}`, 20, 78);

        // Divider
        doc.setDrawColor(229, 231, 235);
        doc.line(20, 85, 190, 85);

        // Ticket Info Section
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Ticket Information', 20, 100);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Ticket Type: ${ticket.ticketType.name}`, 20, 110);
        doc.text(`Price: ${ticket.ticketType.price} ${ticket.ticketType.currency}`, 20, 118);
        doc.text(`Ticket Code: ${ticket.code}`, 20, 126);

        // Attendee Info Section
        doc.setFont('helvetica', 'bold');
        doc.text('Attendee Information', 110, 100);

        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${ticket.user.name}`, 110, 110);
        doc.text(`Email: ${ticket.user.email}`, 110, 118);

        // QR Code Section
        doc.setFillColor(249, 250, 251);
        doc.rect(55, 140, 100, 100, 'F');

        // Embed QR Code
        // qrCode is a dataURL (base64)
        doc.addImage(ticket.qrCode, 'PNG', 65, 150, 80, 80);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Please present this ticket at the entrance.', 105, 260, { align: 'center' });
        doc.text('Powered by Event Management Suite', 105, 268, { align: 'center' });

        // Border
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(1);
        doc.rect(5, 5, 200, 287);

        doc.save(`ticket-${ticket.code}.pdf`);
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
                                                            onClick={() => generatePDFTicket(ticket)}
                                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                                                        >
                                                            <FileText size={18} />
                                                            Download PDF Ticket
                                                        </button>

                                                        <button
                                                            onClick={() => downloadQRCode(ticket.qrCode, ticket.code)}
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
