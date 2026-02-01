import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const PaymentCancelPage = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-xl"
                >
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <XCircle size={40} />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
                    <p className="text-gray-300 mb-8">
                        Your payment was cancelled. No charges were made.
                    </p>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <ArrowLeft size={20} /> Return to Event
                    </button>
                </motion.div>
            </div>
        </Layout>
    );
};

export default PaymentCancelPage;
