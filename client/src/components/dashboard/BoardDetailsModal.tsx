import { useState, useEffect } from 'react';
import { Board } from '@/types/board';
import { api } from '@/lib/api';
import { Loader2, Calendar, Clock, User, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface BoardDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    board: Board;
}

export const BoardDetailsModal = ({ isOpen, onClose, board }: BoardDetailsModalProps) => {
    const [loading, setLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && board.id) {
            const fetchCollaborators = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get(`/boards/${board.id}/share/collaborators`);
                    setCollaborators(data.data);
                } catch (error) {
                    console.error("Failed to fetch collaborators", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCollaborators();
        }
    }, [isOpen, board.id]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-[#1A1F36] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Header Gradient Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-white">Board Details</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Board Title */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">{board.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                                        {board.permission || 'Owner'}
                                    </span>
                                </div>
                            </div>

                            {/* Dates Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                        <Calendar className="w-3.5 h-3.5" /> Created
                                    </div>
                                    <div className="text-gray-200 text-sm font-medium">
                                        {format(new Date(board.createdAt), 'MMM d, yyyy')}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {format(new Date(board.createdAt), 'h:mm a')}
                                    </div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                        <Clock className="w-3.5 h-3.5" /> Updated
                                    </div>
                                    <div className="text-gray-200 text-sm font-medium">
                                        {format(new Date(board.updatedAt), 'MMM d, yyyy')}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {format(new Date(board.updatedAt), 'h:mm a')}
                                    </div>
                                </div>
                            </div>

                            {/* Owner */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Owner
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    {board.createdBy?.avatarUrl ? (
                                        <img src={board.createdBy.avatarUrl} alt={board.createdBy.fullName} className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {board.createdBy?.fullName?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-white">{board.createdBy?.fullName || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">Board Creator</div>
                                    </div>
                                </div>
                            </div>

                            {/* Collaborators */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Collaborators
                                </label>
                                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden min-h-[100px] max-h-[200px] overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full py-8">
                                            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                        </div>
                                    ) : collaborators.length > 0 ? (
                                        <div className="divide-y divide-white/5">
                                            {collaborators.map((c: any) => (
                                                <div key={c.user.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-medium">
                                                            {c.user.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-200">{c.user.fullName}</div>
                                                            <div className="text-xs text-gray-500">{c.user.email}</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded capitalize">
                                                        {c.role}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            No other collaborators yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
