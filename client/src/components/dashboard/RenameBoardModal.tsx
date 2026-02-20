import { useState } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RenameBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    currentTitle: string;
}

export const RenameBoardModal = ({ isOpen, onClose, boardId, currentTitle }: RenameBoardModalProps) => {
    const [title, setTitle] = useState(currentTitle);
    const [loading, setLoading] = useState(false);
    const renameBoard = useBoardStore((state) => state.renameBoard);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || title === currentTitle) {
            onClose();
            return;
        }

        setLoading(true);
        await renameBoard(boardId, title);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-[#1A1F36] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative"
                >
                    {/* Header Gradient Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Rename Board</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-gray-500 transition-all"
                                    placeholder="Enter board title..."
                                    autoFocus
                                />

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
