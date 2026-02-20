import { StickyNoteColors } from '@/lib/fabricUtils';
import { useCanvasStore } from '@/stores/canvasStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const StickyNotePalette = () => {
    const { stickyNoteColorIndex, setStickyNoteColorIndex } = useCanvasStore();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute left-16 top-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 w-48 z-50 flex flex-col gap-2"
        >
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
                Sticky Color
            </div>

            <div className="grid grid-cols-4 gap-2">
                {StickyNoteColors.map((color, index) => (
                    <button
                        key={color.name}
                        onClick={() => setStickyNoteColorIndex(index)}
                        className={cn(
                            "w-8 h-8 rounded-full border border-black/10 dark:border-white/10 transition-transform hover:scale-110 relative",
                            stickyNoteColorIndex === index && "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900"
                        )}
                        style={{ backgroundColor: color.bg }}
                        title={color.name}
                    >
                        {/* Optional checkmark for selected? Ring is cleaner. */}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
