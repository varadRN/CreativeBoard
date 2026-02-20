import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutGrid, Clock, Star, Users, Trash2, Settings,
    Menu, Search, Plus, X
} from 'lucide-react';
import { NotificationBell } from '../dashboard/NotificationBell';
import { UserDropdown } from '../dashboard/UserDropdown';
import { cn } from '@/lib/utils';
import { useBoardStore } from '@/stores/boardStore';
import { useThemeStore } from '@/stores/themeStore';
import { Logo } from '../shared/Logo';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { createBoard, searchQuery, setSearchQuery, sharedBoards, fetchSharedBoards } = useBoardStore();

    useEffect(() => {
        // Fetch shared boards on mount to show notification dots if needed
        fetchSharedBoards();
    }, [fetchSharedBoards]);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const navItems = [
        { icon: LayoutGrid, label: 'All Boards', path: '/dashboard' },
        { icon: Star, label: 'Starred', path: '/dashboard/starred' },
        { icon: Users, label: 'Shared with me', path: '/dashboard/shared' },
        { icon: Trash2, label: 'Trash', path: '/dashboard/trash' },
    ];

    // Theme declaration here was causing issues, removing the duplicate.
    const { theme: currentTheme } = useThemeStore();

    return (
        <div className={`min-h-screen flex flex-col relative overflow-hidden font-sans transition-colors duration-500 ${currentTheme === 'dark'
            ? 'bg-[#020617] selection:bg-primary/30 text-slate-200'
            : 'bg-slate-50 selection:bg-indigo-500/20 text-slate-800'
            }`}>

            {/* Ambient Background Glow - Deep Mesh Gradient (Dark Mode) */}
            <div className={`fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 ${currentTheme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-slate-900/40 blur-[100px]" />
            </div>

            {/* Light Mode Background - Subtle Warmth */}
            <div className={`fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 ${currentTheme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/50 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Navbar */}
            <header className={`h-16 backdrop-blur-xl border-b px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 ${currentTheme === 'dark'
                ? "bg-[#0f172a]/60 border-white/5 supports-[backdrop-filter]:bg-[#0f172a]/40"
                : "bg-white/70 border-indigo-100 supports-[backdrop-filter]:bg-white/50"
                }`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-white/5 rounded-lg lg:hidden"
                    >
                        <Menu className="w-5 h-5 text-gray-400" />
                    </button>

                    <Link to="/dashboard" className={cn(
                        "flex items-center gap-2 text-xl font-bold tracking-tight transition-colors",
                        currentTheme === 'dark' ? "text-white" : "text-slate-900"
                    )}>
                        <Logo size="sm" />
                        CreativeBoard
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <input
                        type="text"
                        placeholder="Search boards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`relative w-full h-10 pl-10 pr-4 border rounded-xl focus:ring-0 transition-all outline-none text-sm ${currentTheme === 'dark'
                            ? "bg-[#0f172a]/80 border-white/10 focus:bg-[#0f172a] focus:border-indigo-500/50 text-gray-200 placeholder:text-gray-500"
                            : "bg-white/50 border-indigo-100 focus:bg-white focus:border-indigo-300 text-gray-700 placeholder:text-gray-400 shadow-sm"
                            }`}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-200" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            const newBoard = await createBoard();
                            navigate(`/board/${newBoard.id}`);
                        }}
                        className="hidden sm:flex h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 items-center gap-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New Board
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-1" />

                    <NotificationBell />
                    <UserDropdown />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative z-10">
                {/* Sidebar - Glassmorphism */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-20 w-64 backdrop-blur-xl border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 pt-20 lg:pt-6 pb-6 flex flex-col",
                        currentTheme === 'dark'
                            ? "bg-[#0f172a]/60 border-white/5 supports-[backdrop-filter]:bg-[#0f172a]/40"
                            : "bg-white/70 border-indigo-100 supports-[backdrop-filter]:bg-white/50",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="px-4 space-y-1 flex-1">
                        {navItems.map((item) => {
                            // Exact match for root dashboard, startsWith for others
                            const isActive = item.path === '/dashboard'
                                ? location.pathname === '/dashboard'
                                : location.pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? (currentTheme === 'dark' ? "text-white" : "text-indigo-600 bg-indigo-50")
                                            : (currentTheme === 'dark' ? "text-gray-400 hover:text-gray-100 hover:bg-white/5" : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50")
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    {isActive && (
                                        <div className={`absolute inset-0 border-l-2 ${currentTheme === 'dark' ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500' : 'bg-indigo-50 border-indigo-500'}`} />
                                    )}
                                    <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300")} />
                                    <span className="relative z-10">{item.label}</span>
                                    {/* Notification Dot for Shared Boards */}
                                    {item.path === '/dashboard/shared' && sharedBoards.length > 0 && (
                                        <span className="ml-auto relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="px-4 mt-6 pt-6 border-t border-white/5">
                        <Link
                            to="/settings/profile"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${currentTheme === 'dark'
                                ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                                : 'text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600'}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Settings className={`w-5 h-5 transition-colors ${currentTheme === 'dark' ? 'text-gray-500 group-hover:text-gray-300' : 'text-slate-400 group-hover:text-indigo-500'}`} /> Settings
                        </Link>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 overflow-y-auto bg-transparent p-4 lg:p-8 w-full relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-10 lg:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};
