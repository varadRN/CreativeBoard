import { useCanvasStore } from '@/stores/canvasStore';
import { Minus, Plus, Maximize } from 'lucide-react';

export const ZoomControls = () => {
    const { zoom, setZoom } = useCanvasStore();

    const handleZoomIn = () => setZoom(Math.min(5, zoom + 0.1));
    const handleZoomOut = () => setZoom(Math.max(0.1, zoom - 0.1));
    const handleReset = () => setZoom(1);

    return (
        <div className="fixed bottom-6 right-6 bg-[#1A1F36] rounded-lg shadow-xl border border-white/10 flex items-center overflow-hidden z-30">
            <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/10 text-gray-400 hover:text-white border-r border-white/10 transition-colors"
            >
                <Minus className="w-4 h-4" />
            </button>

            <button
                onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-gray-300 min-w-[3.5rem] hover:bg-white/5 transition-colors"
            >
                {Math.round(zoom * 100)}%
            </button>

            <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/10 text-gray-400 hover:text-white border-l border-white/10 transition-colors"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
};
