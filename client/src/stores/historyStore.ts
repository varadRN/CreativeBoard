import { create } from 'zustand';

interface HistoryState {
    undoStack: string[];
    redoStack: string[];
    canUndo: boolean;
    canRedo: boolean;

    // The state that should be restored to the canvas
    snapshot: string | null;

    pushState: (json: string) => void;
    undo: () => void;
    redo: () => void;
    clearSnapshot: () => void;
    clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
    snapshot: null,

    pushState: (json) => {
        const { undoStack } = get();
        // Limit stack size (e.g., 50) and prevent duplicates if needed
        // Simple distinct check:
        if (undoStack.length > 0 && undoStack[undoStack.length - 1] === json) return;

        const newStack = [...undoStack, json].slice(-50);
        set({
            undoStack: newStack,
            redoStack: [], // Clear redo on new action
            canUndo: true,
            canRedo: false,
            snapshot: null, // Clear any pending snapshot
        });
    },

    undo: () => {
        const { undoStack, redoStack } = get();
        if (undoStack.length <= 1) return; // Need at least initial state + 1 to undo

        const currentState = undoStack[undoStack.length - 1]; // Current (to be popped)
        const previousState = undoStack[undoStack.length - 2]; // Target (to be loaded)

        if (!previousState) return;

        const newUndoStack = undoStack.slice(0, -1);
        const newRedoStack = [currentState, ...redoStack];

        set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            canUndo: newUndoStack.length > 1, // Keep initial state
            canRedo: true,
            snapshot: previousState, // Trigger restore
        });
    },

    redo: () => {
        const { undoStack, redoStack } = get();
        if (redoStack.length === 0) return;

        const stateToRestore = redoStack[0];
        const newRedoStack = redoStack.slice(1);
        const newUndoStack = [...undoStack, stateToRestore];

        set({
            undoStack: newUndoStack,
            redoStack: newRedoStack,
            canUndo: true,
            canRedo: newRedoStack.length > 0,
            snapshot: stateToRestore, // Trigger restore
        });
    },

    clearSnapshot: () => set({ snapshot: null }),

    clear: () => set({
        undoStack: [],
        redoStack: [],
        canUndo: false,
        canRedo: false,
        snapshot: null
    }),
}));
