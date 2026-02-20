import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const EmailVerifiedPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await api.post('/auth/verify-email', { token });
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h1>
                        <p className="text-gray-500">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                        <p className="text-gray-500 mb-8">
                            Your account has been successfully verified. You can now access your dashboard.
                        </p>
                        <Link
                            to={localStorage.getItem('pending_share_url') || "/dashboard"}
                            onClick={() => {
                                // If we're going to a specific board, we can clear it now or let the protected route handle it?
                                // Actually, if we link directly there, we might want to keep it until they actually land?
                                // But if they click this, they go there.
                                // Let's NOT clear it here, because they might not be logged in yet?
                                // Wait, if they just verified email, they are usually NOT logged in automatically in this flow?
                                // If they click "Go to Board", they will hit ProtectedRoute -> Login.
                                // ProtectedRoute will see the board URL and save it AGAIN to pending_share_url.
                                // So it's safe.
                            }}
                            className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                            {localStorage.getItem('pending_share_url') ? "Go to Board" : "Go to Dashboard"} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                        <p className="text-gray-500 mb-8">
                            This link is invalid or has expired. Please request a new verification link.
                        </p>
                        <Link
                            to="/login"
                            className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EmailVerifiedPage;
