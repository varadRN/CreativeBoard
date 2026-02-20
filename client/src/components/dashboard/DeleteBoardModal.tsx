import { useState } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    isPermanent?: boolean;
}

export const DeleteBoardModal = ({ isOpen, onClose, boardId, isPermanent = false }: DeleteBoardModalProps) => {
    const [loading, setLoading] = useState(false);
    const deleteBoard = useBoardStore((state) => state.deleteBoard);

    const handleDelete = async () => {
        setLoading(true);
        await deleteBoard(boardId, isPermanent);
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
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

                    <div className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 ring-1 ring-red-500/20">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">Delete Board?</h2>

                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                {isPermanent
                                    ? "This action cannot be undone. This board will be permanently removed from your workspace."
                                    : "This board will be moved to trash. You can restore it anytime from the 'Trash' tab."}
                            </p>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
