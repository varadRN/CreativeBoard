import { motion } from 'framer-motion';
import {
    Infinity, Zap, Users, Share2, Download, MousePointer2
} from 'lucide-react';

const FeatureCard = ({ title, desc, icon: Icon, className, delay = 0 }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true, margin: "-50px" }}
            className={`group relative ${className}`}
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-3xl opacity-20 group-hover:opacity-100 blur transition duration-500" />
            <div className="relative h-full bg-gray-900 border border-white/10 rounded-3xl p-8 hover:bg-gray-800/50 transition-colors flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow group-hover:text-gray-300 transition-colors">{desc}</p>
            </div>
        </motion.div>
    );
};

export const Features = () => {
    return (
        <section id="features" className="py-24 bg-transparent relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Why Teams Love CreativeBoard</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to collaborate effectively, without the clutter.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                    {/* Infinite Canvas - Tall */}
                    <FeatureCard
                        className="md:col-span-1 md:row-span-2"
                        title="Infinite Canvas"
                        desc="Never run out of space. Our canvas expands indefinitely as you create, perfect for sprawling mind maps and complex diagrams."
                        icon={Infinity}
                        delay={0.1}
                    />

                    {/* Lightning Fast */}
                    <FeatureCard
                        title="Lightning Fast"
                        desc="Built for speed. Zero lag, even with thousands of elements."
                        icon={Zap}
                        delay={0.2}
                    />

                    {/* Real-time */}
                    <FeatureCard
                        className="border-primary/50 shadow-lg shadow-primary/10 bg-primary/5"
                        title="Real-time Sync"
                        desc="See changes instantly. Collaborate with your team as if you're in the same room."
                        icon={Users}
                        delay={0.3}
                    />

                    {/* Easy Sharing - Wide */}
                    <FeatureCard
                        className="md:col-span-2"
                        title="One-Click Sharing"
                        desc="Invite teammates via email or just copy a link. Control permissions with granular access settings."
                        icon={Share2}
                        delay={0.4}
                    />

                    {/* Export */}
                    <FeatureCard
                        title="Export Anywhere"
                        desc="Download your work as JPG to share or continue elsewhere."
                        icon={Download}
                        delay={0.5}
                    />

                    {/* Smart Tools */}
                    <FeatureCard
                        title="Smart Tools"
                        desc="Intelligent snapping and shape recognition."
                        icon={MousePointer2}
                        delay={0.6}
                    />

                    {/* 100% Free Banner */}
                    {/* 100% Free Banner - Smooth Unfold Animation + Elegant Professional Styling */}
                    <motion.div
                        initial={{ opacity: 0, rotateX: 65, y: 50, scale: 0.9 }}
                        whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="md:col-span-3 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden border border-white/10 bg-[#0F0D1A]"
                    >
                        {/* Elegant Professional Background - Deep Indigo/Slate Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-black/40 backdrop-blur-xl" />

                        {/* Dynamic Subtle Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                100% Free Forever
                            </h3>
                            <p className="text-gray-400 text-lg max-w-xl mx-auto font-light leading-relaxed">
                                No hidden fees, no credit card required. Just sign up and start creating your masterpiece.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
