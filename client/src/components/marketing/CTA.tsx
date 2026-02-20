import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CTA = () => {
    return (
        <section className="py-32 relative overflow-hidden flex items-center justify-center">
            {/* Gradient Background - More subtle to blend with global */}
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
