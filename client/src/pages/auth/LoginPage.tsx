import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/dashboard';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        try {
            await login(data);
            toast.success('Welcome back!');

            // Check for pending share URL
            const pendingShareUrl = localStorage.getItem('pending_share_url');
            if (pendingShareUrl) {
                localStorage.removeItem('pending_share_url');
                navigate(pendingShareUrl, { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            toast.error(message === 'Network Error' ? 'Server unavailable. Please try again.' : message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-dark-bg to-[#1A1730] relative overflow-hidden flex-col justify-center px-12 xl:px-20 text-white">
                {/* Background Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" />

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold mb-12">
                        <Logo size="md" />
                        CreativeBoard
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Welcome back to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-light">workspace</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 max-w-md">
                            Your boards are waiting. Continue creating and collaborating with your team in real-time.
                        </p>

                        <ul className="space-y-4">
                            {[
                                'Your boards are encrypted & secure',
                                'Real-time collaboration ready',
                                'Pick up exactly where you left off',
                                'Export to JPG'
                            ].map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                                    className="flex items-center gap-3 text-gray-300"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-[440px]">
                    <div className="text-center lg:text-left mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back 👋</h2>
                        <p className="text-gray-500">Sign in to continue to your boards</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Email</label>
                            <div className="relative">
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    className={cn(
                                        "w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none",
                                        errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                    )}
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-900">Password</label>
                                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={cn(
                                        "w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none",
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
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                style={{ colorScheme: 'light' }}
                                className="w-4 h-4 rounded border-gray-300 bg-white accent-[#6C5CE7] focus:ring-primary shrink-0 cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600 select-none cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <motion.div
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 overflow-hidden group border-b-2 border-indigo-900/20 active:border-b-0 active:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                {/* Subtle Glossy Top Highlight */}
                                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent opacity-30" />
                                {/* Dynamic Shine Swipe */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                            </button>
                        </motion.div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" state={{ from }} className="font-bold text-primary hover:text-primary-hover hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
