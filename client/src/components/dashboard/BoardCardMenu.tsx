import { useRef, useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { MoreVertical, Pencil, Copy, Share2, Star, Trash2, RotateCcw, XOctagon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardCardMenuProps {
    boardId: string;
    isStarred: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onRename: () => void;
    onDuplicate: () => void;
    onShare: () => void;
    onStar: () => void;
    onDelete: () => void;
    onDetails: () => void;
    // For trash items
    isTrash?: boolean;
    onRestore?: () => void;
    onPermanentDelete?: () => void;
}

export const BoardCardMenu = ({
    boardId,
    isStarred,
    isOpen,
    setIsOpen,
    onRename,
    onDuplicate,
    onShare,
    onStar,
    onDelete,
    onDetails,
    isTrash = false,
    onRestore,
    onPermanentDelete,
}: BoardCardMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const { theme } = useThemeStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/20 text-white/90' : 'hover:bg-slate-100 text-slate-500'}`}
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-xl shadow-black/50 border border-white/10 z-50 overflow-hidden ring-1 ring-white/5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="py-1.5">
                            {!isTrash ? (
                                <>
                                    <MenuItem icon={Pencil} label="Rename" onClick={onRename} />
                                    <MenuItem icon={Info} label="Details" onClick={onDetails} />
                                    <MenuItem icon={Copy} label="Duplicate" onClick={onDuplicate} />
                                    <MenuItem icon={Share2} label="Share" onClick={onShare} />
                                    <MenuItem
                                        icon={Star}
                                        label={isStarred ? "Unstar" : "Star"}
                                        onClick={onStar}
                                        className={isStarred ? "text-yellow-400" : ""}
                                    />
                                    <div className="h-px bg-white/10 my-1.5 mx-2" />
                                    <MenuItem
                                        icon={Trash2}
                                        label="Delete"
                                        onClick={onDelete}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    />
                                </>
                            ) : (
                                <>
                                    <MenuItem icon={RotateCcw} label="Restore" onClick={() => onRestore?.()} />
                                    <MenuItem
                                        icon={XOctagon}
                                        label="Delete Forever"
                                        onClick={() => onPermanentDelete?.()}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    />
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface MenuItemProps {
    icon: any;
    label: string;
    onClick: () => void;
    className?: string;
}

const MenuItem = ({ icon: Icon, label, onClick, className = '' }: MenuItemProps) => (
    <button
        onClick={() => {
            onClick();
        }}
        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left ${className}`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);
