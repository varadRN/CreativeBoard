import { motion } from 'framer-motion';
import { UserPlus, Layout, Users } from 'lucide-react';

export const HowItWorks = () => {
    const steps = [
        { num: 1, title: 'Sign Up Free', desc: 'Create an account in seconds. No credit card needed.', icon: UserPlus },
        { num: 2, title: 'Create Board', desc: 'Start a fresh infinite canvas for your next big idea.', icon: Layout },
        { num: 3, title: 'Collaborate', desc: 'Share the link and work together in real-time.', icon: Users },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-black/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Connecting Line */}
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
