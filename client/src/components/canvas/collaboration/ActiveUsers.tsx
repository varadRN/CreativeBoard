import { useState, useRef, useEffect } from 'react';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User as UserIcon } from 'lucide-react';

export const ActiveUsers = () => {
    const { activeUsers, currentUserColor } = useCollaborationStore();
    const { user: currentUser } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge current user if not in list
    const allUsers = [...activeUsers];
    if (currentUser && !allUsers.some(u => u.userId === currentUser.id)) {
        allUsers.unshift({
            userId: currentUser.id,
            socketId: 'local-user',
            fullName: currentUser.fullName,
            avatarUrl: currentUser.avatarUrl,
            color: currentUser.color || currentUserColor || '#3b82f6' // Prioritize persisted color
        });
    }

    const MAX_VISIBLE = 3;
    const displayedUsers = allUsers.slice(0, MAX_VISIBLE);
    const remaining = Math.max(0, allUsers.length - MAX_VISIBLE);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative z-50" ref={containerRef}>
            {/* Avatar Stack Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex -space-x-2 items-center hover:opacity-80 transition-opacity p-1 rounded-full hover:bg-white/5"
                title="View active users"
            >
                {displayedUsers.map((user) => (
                    <div
                        key={user.socketId}
                        className="relative group cursor-pointer"
                    >
                        <div
                            className="w-8 h-8 rounded-full border-2 border-[#1A1F36] bg-gray-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm"
                            style={{ backgroundColor: user.color || '#ccc' }}
                        >
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                                user.fullName.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                ))}

                {remaining > 0 && (
                    <div className="w-8 h-8 rounded-full border-2 border-[#1A1F36] bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shadow-sm z-10">
                        +{remaining}
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-[#1A1F36] border border-gray-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md bg-opacity-95"
                    >
                        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">Active Users</span>
                            <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                                {allUsers.length}
                            </span>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {allUsers.map((user) => {
                                const isMe = currentUser?.id === user.userId;

                                return (
                                    <div
                                        key={user.socketId}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                            isMe ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm"
                                            style={{ backgroundColor: user.color || '#ccc' }}
                                        >
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                user.fullName.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-200 truncate">
                                                    {user.fullName}
                                                </span>
                                                {isMe && (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                                                        YOU
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-500 truncate">
                                                {isMe ? 'Online' : 'Viewing board'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {activeUsers.length === 0 && (
                                <div className="p-4 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                                    <UserIcon className="w-8 h-8 opacity-20" />
                                    <span>No active users</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
