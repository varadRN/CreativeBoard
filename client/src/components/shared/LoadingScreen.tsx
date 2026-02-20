import { motion } from 'framer-motion';
import { Logo } from './Logo';

export const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Logo size="xl" />
                </motion.div>

                <div className="flex gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-3 h-3 rounded-full bg-primary"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-3 h-3 rounded-full bg-purple-500"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-3 h-3 rounded-full bg-accent"
                    />
                </div>

                <p className="mt-4 text-gray-500 text-sm font-medium tracking-wide">INITIALIZING...</p>
            </div>
        </div>
    );
};
