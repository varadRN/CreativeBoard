import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { useAuthStore } from '@/stores/authStore';
import { ShareModal } from '../dashboard/ShareModal';
import { ActiveUsers } from '../canvas/collaboration/ActiveUsers';
import { ConnectionBadge } from '../canvas/collaboration/ConnectionBadge';
import { SyncStatus } from '../canvas/collaboration/SyncStatus';

interface CanvasNavbarProps {
    boardId: string;
    title: string;
    status: 'saved' | 'saving' | 'offline';
    isConnected: boolean;
}

export const CanvasNavbar = ({ boardId, title: initialTitle, status, isConnected }: CanvasNavbarProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [isEditing, setIsEditing] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const { renameBoard } = useBoardStore();
    const { user } = useAuthStore();

    useEffect(() => { setTitle(initialTitle); }, [initialTitle]);

    const handleRename = async () => {
        if (!title.trim() || title === initialTitle) {
            setTitle(initialTitle);
            setIsEditing(false);
            return;
        }
        await renameBoard(boardId, title);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRename();
        if (e.key === 'Escape') {
            setTitle(initialTitle);
            setIsEditing(false);
        }
    };

    return (
        <div className="h-14 bg-[#1A1F36] border-b border-white/10 flex items-center justify-between px-4 z-20 relative shadow-md">
            {/* Left */}
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="h-6 w-px bg-white/10" />

                <div className="flex flex-col">
                    {isEditing ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={handleKeyDown}
                            className="font-bold text-sm px-2 py-1 bg-[#0F0D1A] border border-primary/50 text-white rounded focus:outline-none focus:ring-1 focus:ring-primary w-48"
                            autoFocus
                        />
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="font-bold text-sm text-white hover:bg-white/10 px-3 py-1.5 rounded truncate max-w-[200px] text-left transition-colors"
                        >
                            {title}
                        </button>
                    )}
                </div>

                {/* Status Indicators */}
                <div className="hidden md:flex items-center gap-4 ml-4">
                    <SyncStatus status={status} />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <ActiveUsers />

                {user?.isGuest ? (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-medium bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Sign up
                        </Link>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowShare(true)}
                        className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        Share
                    </button>
                )}

                <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />

                <ConnectionBadge />
            </div>

            <ShareModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                boardId={boardId}
                boardTitle={title}
            />
        </div>
    );
};
