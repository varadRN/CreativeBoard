import { formatDistanceToNow } from 'date-fns';
import { Star, Users, Lock, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Board } from '@/types/board';
import { BoardCardMenu } from './BoardCardMenu';
import { useState } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { useThemeStore } from '@/stores/themeStore';
import { RenameBoardModal } from './RenameBoardModal';
import { DeleteBoardModal } from './DeleteBoardModal';
import { ShareModal } from './ShareModal';
import { BoardDetailsModal } from './BoardDetailsModal';

interface BoardCardProps {
    board: Board;
    isTrash?: boolean;
}

export const BoardCard = ({ board, isTrash = false }: BoardCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showRename, setShowRename] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const { starBoard, duplicateBoard, restoreBoard, deleteBoard } = useBoardStore();
    const { theme } = useThemeStore();

    const handleStar = () => {
        starBoard(board.id, !board.isStarred);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Outer Wrapper for positioning context - NO overflow-hidden */}
            <div className={`group relative transition-all duration-300 ${isMenuOpen ? 'z-50' : 'z-0'}`}>

                {/* Visual Card Content (Link) - Contains the clipped rounded look */}
                <Link
                    to={isTrash ? '#' : `/board/${board.id}`}
                    className={`block rounded-xl overflow-hidden border transition-all duration-300 ${theme === 'dark' ? 'bg-[#1A1F36] border-white/5 hover:border-primary/50' : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10'}`}
                >
                    {/* Thumbnail / Preview Area */}
                    <div className={`h-40 relative overflow-hidden ${theme === 'dark' ? 'bg-[#0F0D1A]' : 'bg-slate-50'}`}>
                        {/* Placeholder for canvas preview */}
                        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                            <div className="grid grid-cols-6 gap-4 w-[150%] h-[150%] rotate-12">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="bg-white/5 rounded-lg w-full h-24" />
                                ))}
                            </div>
                        </div>

                        {/* Badge Overlays */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            {board.isStarred && (
                                <div className="bg-yellow-400/20 backdrop-blur-md p-1.5 rounded-lg text-yellow-400">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                </div>
                            )}
                            {board.permission && board.permission !== 'owner' && (
                                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg text-white text-[10px] font-medium px-2 py-1 flex items-center gap-1">
                                    {board.permission === 'editor' ? 'Editor' : 'Viewer'}
                                </div>
                            )}
                            {/* Unread Indicator for Shared Boards */}
                            {board.permission && (
                                <div className="absolute top-0 right-0 -mt-1 -mr-1">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Meta */}
                    <div className="p-4">
                        <h3 className={`font-semibold truncate mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`} title={board.title}>
                            {board.title}
                        </h3>
                        <div className={`flex items-center justify-between mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                            <span>
                                Edited {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                            </span>

                            {/* Creator info for shared boards */}
                            {board.createdBy && board.createdById !== 'current-user-id-placeholder' && (
                                <div className="flex items-center gap-1.5" title={`Created by ${board.createdBy.fullName}`}>
                                    {board.createdBy.avatarUrl ? (
                                        <img src={board.createdBy.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px]">
                                            {board.createdBy.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Menu Trigger Area - Outside overflow-hidden, positioned relative to wrapper */}
                <div className="absolute top-3 right-3 z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        <BoardCardMenu
                            boardId={board.id}
                            isStarred={board.isStarred}
                            isOpen={isMenuOpen}
                            setIsOpen={setIsMenuOpen}
                            onRename={() => { setIsMenuOpen(false); setShowRename(true); }}
                            onDuplicate={() => { setIsMenuOpen(false); duplicateBoard(board.id); }}
                            onShare={() => { setIsMenuOpen(false); setShowShare(true); }}
                            onDetails={() => { setIsMenuOpen(false); setShowDetails(true); }}
                            onStar={handleStar}
                            onDelete={() => { setIsMenuOpen(false); setShowDelete(true); }}
                            isTrash={isTrash}
                            onRestore={() => { setIsMenuOpen(false); restoreBoard(board.id); }}
                            onPermanentDelete={() => { setIsMenuOpen(false); setShowDelete(true); }}
                        />
                    </div>
                </div>
            </div>

            <RenameBoardModal
                isOpen={showRename}
                onClose={() => setShowRename(false)}
                boardId={board.id}
                currentTitle={board.title}
            />

            <DeleteBoardModal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                boardId={board.id}
                isPermanent={isTrash}
            />

            <ShareModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                boardId={board.id}
                boardTitle={board.title}
            />

            <BoardDetailsModal
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
                board={board}
            />
        </>
    );
};
