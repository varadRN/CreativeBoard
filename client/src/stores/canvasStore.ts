import { create } from 'zustand';

export enum Tool {
    SELECT = 'SELECT',
    HAND = 'HAND',
    PEN = 'PEN',
    PENCIL = 'PENCIL',
    MARKER = 'MARKER',
    HIGHLIGHTER = 'HIGHLIGHTER',
    RECTANGLE = 'RECTANGLE',
    CIRCLE = 'CIRCLE',
    TRIANGLE = 'TRIANGLE',
    DIAMOND = 'DIAMOND',
    STAR = 'STAR',
    LINE = 'LINE',
    ARROW = 'ARROW',
    TEXT = 'TEXT',
    STICKY_NOTE = 'STICKY_NOTE',
    ERASER = 'ERASER',
    OBJECT_ERASER = 'OBJECT_ERASER',
}

export interface CanvasState {
    activeTool: Tool;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    opacity: number;
    backgroundColor: string;
    gridType: 'dots' | 'lines' | 'none';
    canvasReady: boolean;
    zoom: number;
    stickyNoteColorIndex: number;
    isPaletteOpen: boolean;
    isReadOnly: boolean;

    setTool: (tool: Tool) => void;
    setStrokeColor: (color: string) => void;
    setFillColor: (color: string) => void;
    setStrokeWidth: (width: number) => void;
    setOpacity: (opacity: number) => void;
    setBackgroundColor: (color: string) => void;
    setGridType: (type: 'dots' | 'lines' | 'none') => void;
    setCanvasReady: (ready: boolean) => void;
    setZoom: (zoom: number) => void;
    setStickyNoteColorIndex: (index: number) => void;
    setPaletteOpen: (isOpen: boolean) => void;
    setIsReadOnly: (readOnly: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
    activeTool: Tool.SELECT,
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    backgroundColor: '#ffffff', // Light mode default
    gridType: 'dots',
    canvasReady: false,
    zoom: 1,
    stickyNoteColorIndex: 0,
    isPaletteOpen: false,
    isReadOnly: false, // New state for RBAC

    setTool: (tool) => set({ activeTool: tool, isPaletteOpen: true }),
    setStrokeColor: (color) => set({ strokeColor: color }),
    setFillColor: (color) => set({ fillColor: color }),
    setStrokeWidth: (width) => set({ strokeWidth: width }),
    setOpacity: (opacity) => set({ opacity }),
    setBackgroundColor: (color) => set({ backgroundColor: color }),
    setGridType: (type) => set({ gridType: type }),
    setCanvasReady: (ready) => set({ canvasReady: ready }),
    setZoom: (zoom) => set({ zoom }),
    setStickyNoteColorIndex: (index) => set({ stickyNoteColorIndex: index }),
    setPaletteOpen: (isOpen) => set({ isPaletteOpen: isOpen }),
    setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }), // New action
}));
