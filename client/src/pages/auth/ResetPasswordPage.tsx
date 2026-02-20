import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .refine((val) => /[A-Z]/.test(val), 'Must contain uppercase letter')
        .refine((val) => /[a-z]/.test(val), 'Must contain lowercase letter')
        .refine((val) => /[0-9]/.test(val), 'Must contain number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // If no token, maybe redirect or show error (handled implicitly by API failing if token missing)
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow text-center">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h1>
                    <p className="text-gray-500">Missing reset token.</p>
                </div>
            </div>
        );
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch('password');

    const onSubmit = async (data: ResetPasswordForm) => {
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword: data.password,
            });
            toast.success('Password reset successfully! Please sign in.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-[#1A1730] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-500">create a new strong password.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">New Password</label>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="********"
                                className={cn(
                                    "w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none",
                                    errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                )}
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <PasswordStrength password={password} />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Confirm Password</label>
                        <div className="relative">
                            <input
                                {...register('confirmPassword')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="********"
                                className={cn(
                                    "w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none",
                                    errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                )}
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
