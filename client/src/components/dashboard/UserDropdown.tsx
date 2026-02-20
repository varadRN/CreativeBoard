import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { LogOut, Settings, User, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            >
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner"
                        style={{ backgroundColor: user.color || '#6366f1' }}
                    >
                        {user.fullName.charAt(0)}
                    </div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={`absolute right-0 top-full mt-2 w-64 backdrop-blur-3xl rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 ${theme === 'dark'
                            ? 'bg-[#0f172a]/95 border border-white/10'
                            : 'bg-white/95 border border-slate-200'}`}
                    >
                        <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
                            <p className={`font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{user.fullName}</p>
                            <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{user.email}</p>
                        </div>

                        <div className="p-2 space-y-1">
                            <Link
                                to="/settings/profile"
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'dark'
                                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-400'}`} /> Profile
                            </Link>
                            <Link
                                to="/settings"
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'dark'
                                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <Settings className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-400'}`} /> Settings
                            </Link>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleTheme();
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group ${theme === 'dark'
                                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {theme === 'dark' ? <Moon className="w-4 h-4 text-gray-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </div>
                                <div className={`w-8 h-4 rounded-full relative border transition-colors ${theme === 'dark' ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-gray-200 border-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full shadow-sm transition-all ${theme === 'dark' ? 'right-1 bg-indigo-400' : 'left-1 bg-white'}`} />
                                </div>
                            </button>
                        </div>

                        <div className={`p-2 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                            <button
                                onClick={() => { setIsOpen(false); logout(); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
