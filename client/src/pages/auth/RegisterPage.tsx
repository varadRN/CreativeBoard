import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Logo } from '@/components/shared/Logo';


const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine((val: string) => /[A-Z]/.test(val), 'Must contain uppercase letter')
        .refine((val: string) => /[a-z]/.test(val), 'Must contain lowercase letter')
        .refine((val: string) => /[0-9]/.test(val), 'Must contain number')
        .refine((val: string) => /[^A-Za-z0-9]/.test(val), 'Must contain special character'),
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms' }),
    }),
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register: registerUser, login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch('password');
    const email = watch('email');

    // Real-time email validation effect
    useEffect(() => {
        if (!email) {
            setEmailValid(false);
            return;
        }
        const emailSchema = z.string().email();
        const result = emailSchema.safeParse(email);
        setEmailValid(result.success);
    }, [email]);

    const onSubmit = async (data: RegisterForm) => {
        setLoading(true);
        try {
            await registerUser(data);
            toast.success('Account created successfully!');

            // Auto-login
            try {
                await login({ email: data.email, password: data.password });
                toast.success('Logging you in...');
                navigate('/dashboard');
            } catch (loginError) {
                // Fallback if auto-login fails
                navigate('/login', { state: { email: data.email } });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#1E1B2E] to-[#0F0D1A] relative overflow-hidden flex-col justify-center px-12 xl:px-20 text-white">
                {/* Background Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />

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
                            Start your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-primary">creative journey</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 max-w-md">
                            Empowering creators to bring their ideas to life, together.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: 'Infinite Canvas', icon: '✨', desc: 'Draw without boundaries' },
                                { label: 'Real-time Sync', icon: '⚡', desc: 'Collaborate instantly' },
                                { label: 'Rich Tools', icon: '🎨', desc: 'Express your creativity' },
                                { label: 'Smart Export', icon: '🚀', desc: 'High-quality JPG Export' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group cursor-default"
                                >
                                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform duration-300 origin-left">{item.icon}</span>
                                    <div className="space-y-1">
                                        <span className="font-semibold block">{item.label}</span>
                                        <span className="text-xs text-gray-400 block">{item.desc}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-[480px]">
                    <div className="text-center lg:text-left mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                        <p className="text-gray-500">Start your creative journey today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Full Name</label>
                            <div className="relative">
                                <input
                                    {...register('fullName')}
                                    type="text"
                                    placeholder="Varad Nakhate"
                                    className={cn(
                                        "w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none autofill:bg-white",
                                        errors.fullName && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                    )}
                                />
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Email</label>
                            <div className="relative">
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    className={cn(
                                        "w-full h-12 pl-11 pr-10 rounded-xl border border-gray-200 bg-white text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none",
                                        errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                                        emailValid && !errors.email && "border-success focus:border-success focus:ring-success/10"
                                    )}
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {emailValid && !errors.email && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-success animate-in fade-in zoom-in duration-300">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Password</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
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

                            <PasswordStrength password={password} />

                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-start gap-2 pt-2">
                            <input
                                {...register('acceptTerms')}
                                type="checkbox"
                                id="terms"
                                style={{ colorScheme: 'light' }}
                                className="mt-1 w-4 h-4 rounded border-gray-300 bg-white accent-[#6C5CE7] focus:ring-primary shrink-0 cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 select-none cursor-pointer">
                                I agree to the <span className="text-primary font-bold">Terms of Service</span> and <span className="text-primary font-bold">Privacy Policy</span>.
                            </label>
                        </div>
                        {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>}

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
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary hover:text-primary-hover hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
