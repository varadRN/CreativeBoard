import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
    const location = useLocation();
    const email = location.state?.email || 'your email';
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        if (!email || email === 'your email') {
            toast.error('Email not found. Please sign in again.');
            return;
        }

        setLoading(true);
        try {
            // In a real app we'd need an endpoint to resend verification without being logged in, 
            // or we assume user is logged in but unverified.
            // For now, let's assume we have an endpoint or simulate it.
            await new Promise(r => setTimeout(r, 1000)); // Simulating

            toast.success('Verification email resent!');
            setTimer(60);
            setCanResend(false);
        } catch (error) {
            toast.error('Failed to resend email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center"
            >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
                <p className="text-gray-500 mb-8">
                    We sent a verification link to <br />
                    <span className="font-semibold text-gray-900">{email}</span>
                </p>

                <p className="text-sm text-gray-500 mb-8">
                    Click the link in the email to activate your account and start creating boards.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleResend}
                        disabled={!canResend || loading}
                        className="text-primary font-bold hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : canResend ? 'Resend Verification Email' : `Resend email in ${timer}s`}
                    </button>

                    <div>
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;
