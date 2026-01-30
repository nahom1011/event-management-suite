import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                const response = await auth.verifyEmail(token, email || undefined);
                setStatus('success');

                // Check if already verified
                if (response.data.alreadyVerified) {
                    setMessage('Your email is already verified! You can log in now.');
                } else {
                    setMessage('Your email has been verified successfully!');
                }

                setTimeout(() => navigate('/login'), 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may be expired.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl text-center">
                <div className="space-y-4">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                            <h2 className="text-2xl font-bold text-white">Verifying your email...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10">
                                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white">Verified!</h2>
                            <p className="text-gray-400">{message}</p>
                            <p className="text-sm text-gray-500">Redirecting to login in 3 seconds...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10">
                                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white">Verification Failed</h2>
                            <p className="text-gray-400">{message}</p>
                            <div className="pt-4">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-black bg-primary hover:bg-primary/90 transition-all"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
