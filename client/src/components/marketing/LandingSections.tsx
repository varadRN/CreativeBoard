import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, Layout, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Stats Section ---
const StatItem = ({ value, label, delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl transition-all duration-300 group cursor-default flex flex-col items-center justify-center min-h-[160px]"
    >
        <div className={cn(
            "font-black bg-clip-text text-transparent bg-gradient-to-tr from-primary via-white to-accent mb-3 group-hover:scale-105 transition-transform duration-500 leading-none",
            value === '∞' ? "text-6xl md:text-8xl" : "text-4xl md:text-5xl"
        )}>
            {value}
        </div>
        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.3em] font-bold opacity-80">{label}</div>
    </motion.div>
);

export const Stats = () => {
    return (
        <section id="community" className="py-24 bg-black relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    <StatItem value="∞" label="Infinite Canvas" delay={0} />
                    <StatItem value="Real-time" label="Collaboration" delay={0.1} />
                    <StatItem value="100%" label="Open Source" delay={0.2} />
                    <StatItem value="Free" label="Accessible" delay={0.3} />
                </div>
            </div>
        </section>
    );
};

// --- How It Works ---
const steps = [
    { num: 1, title: 'Sign Up Free', desc: 'Create an account in seconds. No credit card needed.', icon: UserPlus },
    { num: 2, title: 'Create Board', desc: 'Start a fresh infinite canvas for your next big idea.', icon: Layout },
    { num: 3, title: 'Collaborate', desc: 'Share the link and work together in real-time.', icon: Users },
];

export const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 bg-black/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-800 via-primary/50 to-gray-800" />
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="relative flex flex-col items-center text-center z-10"
                        >
                            <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl backdrop-blur-sm relative group">
                                <step.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center border-4 border-black">
                                    {step.num}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 max-w-xs">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- CTA Section ---
export const CTA = () => {
    return (
        <section className="py-32 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-white/5 border-t border-white/5 backdrop-blur-sm z-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-20 z-0 pointer-events-none" />
            <div className="max-w-4xl mx-auto px-4 text-center z-10">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                >
                    Ready to Create Something Amazing?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
                >
                    The ultimate workspace for teams to plan and design together on CreativeBoard.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex justify-center"
                >
                    <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Link
                            to="/register"
                            className="relative px-12 py-5 bg-white text-primary text-2xl font-black rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-2 group transition-colors hover:bg-gray-50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Get Started
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};