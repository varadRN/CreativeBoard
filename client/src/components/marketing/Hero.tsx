
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

export const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { // Reduced angle for realism
        damping: 40, // More damping = less bouncy, more "heavy"
        stiffness: 250,
        mass: 0.8, // Heavier feel
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
        damping: 40,
        stiffness: 250,
        mass: 0.8,
    });

    // Dynamic shadow opacity based on tilt
    const shadowOpacity = useTransform(mouseY, [-0.5, 0.5], [0.1, 0.3]);
    const shadowY = useTransform(mouseY, [-0.5, 0.5], [20, 40]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseXRelative = e.clientX - rect.left;
        const mouseYRelative = e.clientY - rect.top;

        const xPct = mouseXRelative / width - 0.5;
        const yPct = mouseYRelative / height - 0.5;

        mouseX.set(xPct);
        mouseY.set(yPct);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <section
            className="relative min-h-screen pt-32 pb-20 overflow-hidden flex flex-col items-center justify-center bg-transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={containerRef}
        >
            {/* Optimized Background - Transparent to show global gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-70 pointer-events-none" />

            {/* Subtle Grid Pattern for Technical Feel */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 text-center z-10 perspective-[2000px]">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary mb-8 backdrop-blur-md shadow-lg shadow-purple-500/10"
                >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span className="text-gray-200">Infinite Canvas • Real-time Collaboration • Open Source</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight select-none"
                    style={{ // Subtle parallax for text
                        translateX: useTransform(mouseX, [-0.5, 0.5], [-5, 5]),
                        translateY: useTransform(mouseY, [-0.5, 0.5], [-5, 5]),
                    }}
                >
                    Create Together,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent animate-gradient bg-300%">
                        In Real Time.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Bring your team's ideas to life on an infinite canvas. Design and plan with powerful tools built for modern collaboration.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <motion.div
                        whileHover={{ scale: 1.05, translateY: -4 }}
                        whileTap={{ scale: 0.92, translateY: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Link
                            to="/register"
                            className="relative px-8 py-4 bg-gradient-to-r from-primary to-accent text-white text-lg font-bold rounded-full shadow-2xl shadow-primary/40 flex items-center gap-2 overflow-hidden group border-b-4 border-indigo-900/30 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                                Start Creating Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {/* Glossy Top Highlight */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

                            {/* Dynamic Shine Swipe */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                        </Link>
                    </motion.div>
                    <Link
                        to="/login"
                        className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-lg font-medium rounded-full backdrop-blur-md transition-all flex items-center gap-2"
                    >
                        Sign In
                    </Link>
                </motion.div>

                {/* 3D Mockup with Realistic Float + Tilt */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    style={{
                        rotateX: rotateX,
                        rotateY: rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    className="relative max-w-5xl mx-auto"
                >
                    {/* Realistic Moving Shadow */}
                    <motion.div
                        className="absolute -inset-10 bg-black/60 blur-3xl -z-20 rounded-[4rem]"
                        style={{
                            translateY: shadowY,
                            opacity: shadowOpacity,
                            scale: 0.9,
                        }}
                    />

                    <motion.div
                        className="relative rounded-xl border border-white/10 bg-[#13111C] shadow-2xl overflow-hidden aspect-video group ring-1 ring-white/5"
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {/* Mockup UI - Darker, blending better */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-white/[0.03] border-b border-white/[0.05] flex items-center px-4 gap-2 backdrop-blur-md">
                            <div className="flex gap-1.5 opacity-60">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                            </div>
                        </div>

                        {/* Mockup Content - High Quality Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

                        {/* Mockup Canvas Content */}
                        {/* Animated Flowchart Demo */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 450">
                            {/* Box 1: "Idea" */}
                            <motion.rect
                                x="150" y="100" width="160" height="80" rx="10"
                                fill="#6C5CE7" fillOpacity="0.2" stroke="#6C5CE7" strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                            />
                            <motion.text
                                x="230" y="145" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontFamily="sans-serif" fontWeight="bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 2.0 }}
                            >
                                New Project
                            </motion.text>

                            {/* Connecting Line */}
                            <motion.path
                                d="M310 140 L450 140"
                                stroke="white" strokeWidth="2" strokeDasharray="6 6"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.4 }}
                                transition={{ duration: 1.0, delay: 2.5 }}
                            />

                            {/* Box 2: "Process" */}
                            <motion.rect
                                x="450" y="100" width="160" height="80" rx="10"
                                fill="#F472B6" fillOpacity="0.2" stroke="#F472B6" strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: 3.5 }}
                            />
                            <motion.text
                                x="530" y="145" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontFamily="sans-serif" fontWeight="bold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 5.0 }}
                            >
                                Development
                            </motion.text>

                            {/* Sticky Note appearing */}
                            <motion.g
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 6.0 }}
                            >
                                <rect x="300" y="250" width="140" height="140" fill="#FEF08A" rx="2" transform="rotate(-5 370 320)" />
                                <text x="315" y="280" fill="#854D0E" fontSize="14" fontFamily="cursive" transform="rotate(-5 370 320)">
                                    Launch on Friday! 🚀
                                </text>
                            </motion.g>

                            {/* Auto-playing Cursor Animation */}
                            <motion.g
                                initial={{ x: 100, y: 300, opacity: 0 }}
                                animate={{
                                    x: [100, 230, 310, 450, 530, 370, 800],
                                    y: [300, 140, 140, 140, 140, 320, 450],
                                    opacity: [0, 1, 1, 1, 1, 1, 0]
                                }}
                                transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                            >
                                <path d="M0 0L12 12V6.5L15 13L17 12L14 5.5H19L0 0Z" fill="#22C55E" stroke="white" strokeWidth="1" />
                                <rect x="12" y="12" width="50" height="20" rx="4" fill="#22C55E" />
                                <text x="37" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Sarah</text>
                            </motion.g>
                        </svg>

                        {/* Realistic Glass Glare - Moves opposite to mouse */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none"
                            style={{
                                translateX: useTransform(mouseX, [-0.5, 0.5], [100, -100]),
                                translateY: useTransform(mouseY, [-0.5, 0.5], [100, -100]),
                                scale: 1.5,
                            }}
                        />
                    </motion.div>

                    {/* Deep Glow behind mockup */}
                    <div className="absolute -inset-10 bg-primary/30 blur-[100px] -z-10 opacity-40 mix-blend-screen pointer-events-none" />
                </motion.div>
            </div>
        </section>
    );
};
