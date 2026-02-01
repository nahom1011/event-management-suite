import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            // navigate('/'); // Optional: redirect if no session id
        }
    }, [sessionId, navigate]);

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-xl"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <CheckCircle2 size={40} />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
                    <p className="text-gray-300 mb-8">
                        Your ticket has been secured. You will receive an email confirmation shortly.
                    </p>

                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        View Your Tickets <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        </Layout>
    );
};

export default PaymentSuccessPage;
