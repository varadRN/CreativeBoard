import {
    MousePointer2, Hand, Pen, Shapes, Minus, MoveRight,
    Type, StickyNote, Eraser, Undo2, Redo2, Download, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCanvasStore, Tool } from '@/stores/canvasStore';
import { useHistoryStore } from '@/stores/historyStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { StickyNotePalette } from '../overlays/StickyNotePalette';
import { ShapesPalette } from '../overlays/ShapesPalette';
import { EraserPalette } from '../overlays/EraserPalette';
import { PenPalette } from '../overlays/PenPalette';

interface ToolbarProps {
    onDownload: () => void;
    onDelete: () => void;
    canDelete: boolean;
}

export const Toolbar = ({ onDownload, onDelete, canDelete }: ToolbarProps) => {
    const { activeTool, setTool, isPaletteOpen, isReadOnly } = useCanvasStore();
    const { undo, redo, canUndo, canRedo } = useHistoryStore();
    const [showShapes, setShowShapes] = useState(false);

    // All shape sub-tools so the Shapes button stays highlighted
    const shapeTools = [Tool.RECTANGLE, Tool.CIRCLE, Tool.TRIANGLE, Tool.DIAMOND, Tool.STAR, Tool.LINE, Tool.ARROW];
    // Both eraser tools so the Eraser button stays highlighted
    const eraserTools = [Tool.ERASER, Tool.OBJECT_ERASER];
    const penTools = [Tool.PEN, Tool.PENCIL, Tool.MARKER, Tool.HIGHLIGHTER];

    const tools = [
        { id: Tool.SELECT, icon: MousePointer2, label: 'Select (V)' },
        { id: Tool.HAND, icon: Hand, label: 'Hand (H)' },
        { sep: true },
        { id: Tool.PEN, icon: Pen, label: 'Pen (P)', hidden: isReadOnly },
        { id: Tool.RECTANGLE, icon: Shapes, label: 'Shapes (R)', hidden: isReadOnly },
        { id: Tool.TEXT, icon: Type, label: 'Text (T)', hidden: isReadOnly },
        { id: Tool.STICKY_NOTE, icon: StickyNote, label: 'Note (N)', hidden: isReadOnly },
        { sep: true, hidden: isReadOnly },
        { id: Tool.ERASER, icon: Eraser, label: 'Eraser (E)', hidden: isReadOnly },
    ].filter(tool => !tool.hidden);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/60 p-1.5 z-30 ring-1 ring-slate-900/5"
        >
            {/* Main Creation Tools */}
            <div className="flex flex-col gap-1 w-full items-center">
                {tools.map((item, i) => {
                    // @ts-ignore
                    if (item.sep) return <div key={`sep-${i}`} className="h-px w-full bg-slate-200/50" />;
                    const isActive = item.id === Tool.RECTANGLE
                        ? shapeTools.includes(activeTool)
                        : item.id === Tool.ERASER
                            ? eraserTools.includes(activeTool)
                            : item.id === Tool.PEN
                                ? penTools.includes(activeTool)
                                : activeTool === item.id;
                    // @ts-ignore
                    const Icon = item.icon;

                    return (
                        <motion.button
                            // @ts-ignore
                            key={item.id}
                            // @ts-ignore
                            onClick={() => setTool(item.id as Tool)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "p-2.5 rounded-xl transition-colors relative group w-full flex justify-center",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                            // @ts-ignore
                            title={item.label}
                        >
                            {/* @ts-ignore */}
                            <Icon className="w-5 h-5 relative z-10" />

                            {/* Active Indicator (Left Bar) - Animated Layout */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeToolIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-indigo-500 rounded-r-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Sticky Note Palette (Specific to Sticky Tool) */}
                            {isActive && isPaletteOpen && item.id === Tool.STICKY_NOTE && (
                                <div className="absolute left-full top-0 pl-1">
                                    <StickyNotePalette />
                                </div>
                            )}

                            {/* Pen Palette (Opens for Pen button) */}
                            {isActive && isPaletteOpen && item.id === Tool.PEN && (
                                <div className="absolute left-full top-0 pl-1">
                                    <PenPalette />
                                </div>
                            )}

                            {/* Shapes Palette (Opens for Shapes button) */}
                            {isActive && isPaletteOpen && item.id === Tool.RECTANGLE && (
                                <div className="absolute left-full top-0 pl-1">
                                    <ShapesPalette />
                                </div>
                            )}

                            {/* Eraser Palette (Opens for Eraser button) */}
                            {isActive && isPaletteOpen && item.id === Tool.ERASER && (
                                <div className="absolute left-full top-0 pl-1">
                                    <EraserPalette />
                                </div>
                            )}

                            {/* Tooltip on right */}
                            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                                {/* @ts-ignore */}
                                {item.label}
                                {/* Little triangle */}
                                <div className="absolute top-1/2 right-full -translate-y-1/2 -mr-1 border-4 border-transparent border-r-slate-900" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Bottom Separator */}
            <div className="h-px w-full bg-slate-200/50" />

            {/* Actions Group (Delete / Download) */}
            <div className="flex flex-col gap-1 items-center w-full">
                {!isReadOnly && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onDelete}
                        className="p-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full flex justify-center group relative"
                        title="Delete (Del)"
                    >
                        <Trash2 className="w-5 h-5" />
                        <div className="absolute left-full ml-3 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl font-medium">
                            Delete
                        </div>
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDownload}
                    className="p-2.5 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors w-full flex justify-center group relative"
                    title="Download Board"
                >
                    <Download className="w-5 h-5" />
                    <div className="absolute left-full ml-3 px-2 py-1 bg-emerald-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl font-medium">
                        Download JPG
                    </div>
                </motion.button>
            </div>

            {/* Bottom Separator */}
            <div className="h-px w-full bg-slate-200/50" />

            {/* Undo/Redo Group (Stacked at bottom) */}
            {!isReadOnly && (
                <div className="flex flex-col gap-1 items-center w-full">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors w-full flex justify-center group relative"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-5 h-5" />
                        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                            Undo (Ctrl+Z)
                        </div>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors w-full flex justify-center group relative"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 className="w-5 h-5" />
                        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                            Redo (Ctrl+Y)
                        </div>
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};
