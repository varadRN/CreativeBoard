import { create } from 'zustand';
import { api } from '../lib/api';
import { Board } from '../types/board';
import { toast } from 'sonner';

interface BoardState {
    boards: Board[];
    sharedBoards: Board[];
    starredBoards: Board[];
    trashBoards: Board[];
    searchResults: Board[];
    isLoading: boolean;
    searchQuery: string;
    sortBy: 'updatedAt' | 'createdAt' | 'title';
    viewMode: 'grid' | 'list';

    fetchBoards: () => Promise<void>;
    fetchSharedBoards: () => Promise<void>;
    fetchStarredBoards: () => Promise<void>;
    fetchTrashBoards: () => Promise<void>;
    searchBoards: (query: string) => Promise<void>;

    createBoard: (title?: string) => Promise<Board>;
    deleteBoard: (id: string, permanent?: boolean) => Promise<void>;
    restoreBoard: (id: string) => Promise<void>;
    duplicateBoard: (id: string) => Promise<void>;
    renameBoard: (id: string, title: string) => Promise<void>;
    starBoard: (id: string, isStarred: boolean) => Promise<void>;

    setSearchQuery: (query: string) => void;
    setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => void;
    setViewMode: (mode: 'grid' | 'list') => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    boards: [],
    sharedBoards: [],
    starredBoards: [],
    trashBoards: [],
    searchResults: [],
    isLoading: false,
    searchQuery: '',
    sortBy: 'updatedAt',
    viewMode: 'grid',

    fetchBoards: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/boards');
            set({ boards: data.data.boards });
        } catch (error) {
            toast.error('Failed to fetch boards');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSharedBoards: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/boards/shared');
            set({ sharedBoards: data.data.boards });
        } catch (error) {
            toast.error('Failed to fetch shared boards');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStarredBoards: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/boards/starred');
            set({ starredBoards: data.data });
        } catch (error) {
            toast.error('Failed to fetch starred boards');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTrashBoards: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/boards/trash');
            set({ trashBoards: data.data });
        } catch (error) {
            toast.error('Failed to fetch trash');
        } finally {
            set({ isLoading: false });
        }
    },

    searchBoards: async (query: string) => {
        if (!query) {
            set({ searchResults: [] });
            return;
        }
        set({ isLoading: true });
        try {
            const { data } = await api.get(`/boards/search?q=${query}`);
            // API returns { owned: [], shared: [] }
            // We'll flatten for simple search display or handle appropriately
            // For now, let's just combine them for the dropdown
            const combined = [...data.data.owned, ...data.data.shared];
            set({ searchResults: combined });
        } catch (error) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    createBoard: async (title?: string) => {
        try {
            const { data } = await api.post('/boards', { title });
            const newBoard = data.data;
            set((state: BoardState) => ({ boards: [newBoard, ...state.boards] }));
            return newBoard;
        } catch (error) {
            toast.error('Failed to create board');
            throw error;
        }
    },

    renameBoard: async (id: string, title: string) => {
        try {
            const { data } = await api.put(`/boards/${id}`, { title });
            const updatedBoard = data.data;

            set((state: BoardState) => ({
                boards: state.boards.map((b) => (b.id === id ? updatedBoard : b)),
                sharedBoards: state.sharedBoards.map((b) => (b.id === id ? updatedBoard : b)),
                starredBoards: state.starredBoards.map((b) => (b.id === id ? updatedBoard : b)),
            }));
            toast.success('Board renamed');
        } catch (error) {
            toast.error('Failed to rename board');
        }
    },

    deleteBoard: async (id: string, permanent: boolean = false) => {
        try {
            if (permanent) {
                await api.delete(`/boards/${id}/permanent`);
                set((state: BoardState) => ({
                    trashBoards: state.trashBoards.filter((b) => b.id !== id),
                }));
                toast.success('Board permanently deleted');
            } else {
                await api.delete(`/boards/${id}`);
                set((state: BoardState) => ({
                    boards: state.boards.filter((b) => b.id !== id),
                    starredBoards: state.starredBoards.filter((b) => b.id !== id),
                }));
                toast.success('Board moved to trash');
            }
        } catch (error) {
            toast.error('Failed to delete board');
        }
    },

    restoreBoard: async (id: string) => {
        try {
            const { data } = await api.put(`/boards/${id}/restore`);
            const restoredBoard = data.data;

            set((state: BoardState) => ({
                trashBoards: state.trashBoards.filter((b) => b.id !== id),
                boards: [restoredBoard, ...state.boards],
            }));
            toast.success('Board restored');
        } catch (error) {
            toast.error('Failed to restore board');
        }
    },

    duplicateBoard: async (id: string) => {
        try {
            const { data } = await api.post(`/boards/${id}/duplicate`);
            const newBoard = data.data;
            set((state: BoardState) => ({ boards: [newBoard, ...state.boards] }));
            toast.success('Board duplicated');
        } catch (error) {
            toast.error('Failed to duplicate board');
        }
    },

    starBoard: async (id: string, isStarred: boolean) => {
        try {
            const { data } = await api.put(`/boards/${id}/star`, { isStarred });
            const updatedBoard = data.data;

            set((state: BoardState) => {
                const boards = state.boards.map((b) => (b.id === id ? { ...b, isStarred } : b));
                const sharedBoards = state.sharedBoards.map((b) => (b.id === id ? { ...b, isStarred } : b));

                let starredBoards = state.starredBoards;
                if (isStarred) {
                    // Add if not exists
                    if (!starredBoards.find(b => b.id === id)) {
                        // We might need to fetch full board or use what we have. 
                        // Using updatedBoard from response is safest.
                        starredBoards = [updatedBoard, ...starredBoards];
                    }
                } else {
                    starredBoards = starredBoards.filter(b => b.id !== id);
                }

                return { boards, sharedBoards, starredBoards };
            });
        } catch (error) {
            toast.error('Failed to update star status');
        }
    },

    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => set({ sortBy }),
    setViewMode: (mode: 'grid' | 'list') => set({ viewMode: mode }),
}));
