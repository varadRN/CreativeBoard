import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '@/stores/boardStore';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export const NewBoardCard = () => {
    const { createBoard } = useBoardStore();
    const { theme } = useThemeStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const newBoard = await createBoard();
            navigate(`/board/${newBoard.id}`);
        } catch (e) {
            // Error handled in store
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`group relative w-full h-full min-h-[280px] rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed border ${theme === 'dark'
                ? 'bg-[#1A1F36] border-white/5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10'
                : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10'}`}
        >
            {/* Optional: Subtle dashed border overlay for "New" feel without looking cheap */}
            <div className={`absolute inset-4 border-2 border-dashed rounded-lg pointer-events-none transition-colors duration-300 ${theme === 'dark' ? 'border-white/5 group-hover:border-primary/20' : 'border-indigo-100 group-hover:border-indigo-200'}`} />

            <div className={`w-16 h-16 rounded-2xl transition-all duration-300 flex items-center justify-center z-10 ${theme === 'dark'
                ? 'bg-white/5 text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-90'
                : 'bg-indigo-50 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-90'}`}>
                {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                    <Plus className="w-8 h-8" />
                )}
            </div>

            <div className="z-10 flex flex-col items-center gap-1">
                <span className={`font-semibold text-lg transition-colors ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-slate-600 group-hover:text-indigo-600'}`}>
                    Create New Board
                </span>
                <span className={`text-xs transition-colors ${theme === 'dark' ? 'text-gray-600 group-hover:text-gray-400' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                    Start from scratch
                </span>
            </div>
        </button>
    );
};
