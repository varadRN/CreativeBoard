import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
            {/* Background Glow */}
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
