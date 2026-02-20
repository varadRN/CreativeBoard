import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBoardStore } from '@/stores/boardStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BoardCard } from '../../components/dashboard/BoardCard';
import { NewBoardCard } from '../../components/dashboard/NewBoardCard';
import { BoardSkeleton } from '../../components/dashboard/BoardSkeleton';
import { BoardEmptyState } from '../../components/dashboard/BoardEmptyState';
import { LayoutGrid, Star, Users, Trash2, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/stores/themeStore';
import { Board } from '@/types/board';

const DashboardPage = () => {
    const location = useLocation();
    const {
        boards, sharedBoards, starredBoards, trashBoards, isLoading,
        fetchBoards, fetchSharedBoards, fetchStarredBoards, fetchTrashBoards,
        createBoard, searchQuery
    } = useBoardStore();
    const { theme } = useThemeStore();

    const path = location.pathname;
    let activeTab = 'all';
    if (path.includes('/shared')) activeTab = 'shared';
    else if (path.includes('/starred')) activeTab = 'starred';
    else if (path.includes('/trash')) activeTab = 'trash';

    const navigate = useNavigate();

    useEffect(() => {
        const pendingShare = localStorage.getItem('pending_share_url');
        if (pendingShare) {
            localStorage.removeItem('pending_share_url');
            navigate(pendingShare);
        }
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'all') fetchBoards();
        else if (activeTab === 'shared') fetchSharedBoards();
        else if (activeTab === 'starred') fetchStarredBoards();
        else if (activeTab === 'trash') fetchTrashBoards();
    }, [activeTab, fetchBoards, fetchSharedBoards, fetchStarredBoards, fetchTrashBoards]);

    const getTitle = () => {
        if (activeTab === 'shared') return 'Shared with me';
        if (activeTab === 'starred') return 'Starred Boards';
        if (activeTab === 'trash') return 'Trash';
        return 'All Boards';
    };

    // Determine boards to display based on active tab
    const getCurrentBoards = () => {
        switch (activeTab) {
            case 'shared': return sharedBoards;
            case 'starred': return starredBoards;
            case 'trash': return trashBoards;
            default: return boards;
        }
    };

    const currentBoards = getCurrentBoards();
    const filteredBoards = currentBoards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderContent = () => {
        const emptyState = (() => {
            switch (activeTab) {
                case 'shared':
                    return <BoardEmptyState icon={Users} title="No shared boards" description="Boards shared with you will appear here." />;
                case 'starred':
                    return <BoardEmptyState icon={Star} title="No starred boards" description="Star important boards to access them quickly." />;
                case 'trash':
                    return <BoardEmptyState icon={Trash2} title="Trash is empty" description="Boards you delete will appear here for 30 days." />;
                default:
                    return <BoardEmptyState icon={LayoutGrid} title="No boards found" description="Create your first board to start collaborating." actionText="Create New Board" onAction={() => createBoard()} />;
            }
        })();

        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeTab === 'all' && !searchQuery && <BoardSkeleton />}
                    {[...Array(8)].map((_, i) => (
                        <BoardSkeleton key={i} />
                    ))}
                </div>
            );
        }

        if (filteredBoards.length === 0) {
            if (searchQuery) {
                return (
                    <BoardEmptyState
                        icon={Search}
                        title="No results found"
                        description={`No boards matching "${searchQuery}"`}
                    />
                );
            }
            if (activeTab !== 'all') return emptyState;
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <NewBoardCard />
                </div>
            );
        }

        return (
            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                    }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {activeTab === 'all' && !searchQuery && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                        <NewBoardCard />
                    </motion.div>
                )}
                {filteredBoards.map((board) => (
                    <motion.div key={board.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                        <BoardCard board={board} isTrash={activeTab === 'trash'} />
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    return (
        <DashboardLayout>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className={`text-3xl font-bold tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {searchQuery ? 'Search Results' : getTitle()}
                    </h1>
                    <p className={`text-sm mt-1 font-medium transition-colors ${theme === 'dark' ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {isLoading ? 'Loading...' : (
                            `${filteredBoards.length} ${filteredBoards.length === 1 ? 'Board' : 'Boards'} ${searchQuery ? 'found' : ''}`
                        )}
                    </p>
                </div>

                {/* Controls (Sort, View) placeholders */}
                <div className="flex gap-2">
                    {/* Can add Sort dropdown here later */}
                </div>
            </div>

            {renderContent()}
        </DashboardLayout>
    );
};

export default DashboardPage;
