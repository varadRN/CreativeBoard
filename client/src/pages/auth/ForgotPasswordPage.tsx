import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', data);
            setSuccess(true);
        } catch (error: any) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-[#1A1730] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                    <p className="text-gray-500">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 mb-6 flex flex-col items-center">
                            <Mail className="w-8 h-8 mb-2" />
                            <p className="font-medium">Check your email</p>
                            <p className="text-sm mt-1">We sent a password reset link to your email address.</p>
                        </div>

                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Email</label>
                            <div className="relative">
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="Enter your email"
                                    className={cn(
                                        "w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none",
                                        errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                    )}
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
