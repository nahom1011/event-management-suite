import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { auth } from '../services/api';
import './SignupConfirmationPage.css';

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
        <div className="confirmation-container">
            <div className="confirmation-card">
                <div className="confirmation-icon-box">
                    <Mail size={32} />
                </div>

                <h2 className="confirmation-title">Check your email</h2>
                <p className="confirmation-text">
                    We've sent a verification link to <br />
                    <span className="email-highlight">{email}</span>. <br />
                    Please click the link to activate your account.
                </p>

                {message && <div className="status-message status-success">{message}</div>}
                {error && <div className="status-message status-error">{error}</div>}

                <div className="confirmation-actions">
                    <button
                        onClick={handleResend}
                        disabled={resending || !email}
                        className="resend-btn"
                    >
                        {resending ? 'Sending...' : 'Resend verification email'}
                    </button>

                    <Link to="/login" className="back-to-login">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupConfirmationPage;
