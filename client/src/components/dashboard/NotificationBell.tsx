import { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { Bell, Check, Trash } from 'lucide-react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { theme } = useThemeStore();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const [listRes, countRes] = await Promise.all([
                api.get('/notifications?limit=10'),
                api.get('/notifications/unread-count')
            ]);
            setNotifications(listRes.data.data.notifications);
            setUnreadCount(countRes.data.data.count);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        } else {
            // Just check unread count periodically or once
            api.get('/notifications/unread-count')
                .then(res => setUnreadCount(res.data.data.count))
                .catch(() => { });
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Initial fetch for badge
    useEffect(() => {
        api.get('/notifications/unread-count').then(res => setUnreadCount(res.data.data.count)).catch(() => { });
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) { }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) { }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-colors ${theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={`absolute right-0 top-full mt-2 w-80 backdrop-blur-3xl rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 ${theme === 'dark'
                            ? 'bg-[#0f172a]/95 border border-white/10'
                            : 'bg-white/95 border border-slate-200'}`}
                    >
                        <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark'
                            ? 'border-white/5 bg-white/5'
                            : 'border-slate-100 bg-slate-50/50'}`}>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-indigo-400 font-medium hover:text-indigo-300 hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {loading && notifications.length === 0 ? (
                                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 transition-colors ${theme === 'dark'
                                                ? 'hover:bg-white/5'
                                                : 'hover:bg-slate-50'} ${!notif.isRead
                                                    ? (theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50/50')
                                                    : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium mb-0.5 ${!notif.isRead
                                                        ? (theme === 'dark' ? 'text-white' : 'text-slate-800')
                                                        : (theme === 'dark' ? 'text-gray-400' : 'text-slate-500')}`}>
                                                        {notif.title}
                                                    </p>
                                                    {notif.message && <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>{notif.message}</p>}
                                                    <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-600' : 'text-slate-400'}`}>
                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="text-indigo-400 hover:bg-indigo-500/20 p-1 rounded transition-colors h-fit"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
