import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { auth } from '../services/api';

const SignupConfirmationPage: React.FC = () => {
    const location = useLocation();
    const email = location.state?.email || '';
    const [resending, setResending] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        setMessage('');
        setError('');
        try {
            await auth.resendVerification(email);
            setMessage('Verification email resent successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl text-center">
                <div className="space-y-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                        <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Check your email</h2>
                    <p className="text-gray-400">
                        We've sent a verification link to <span className="text-primary font-semibold">{email}</span>.
                        Please click the link to activate your account.
                    </p>
                </div>

                {message && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{message}</div>}
                {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

                <div className="space-y-4 pt-4">
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-black bg-primary hover:bg-primary/90 focus:outline-none transition-all disabled:opacity-50"
                    >
                        {resending ? 'Sending...' : 'Resend verification email'}
                    </button>
                    <Link
                        to="/login"
                        className="block text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupConfirmationPage;
