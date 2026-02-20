import { useRef, useEffect } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { Canvas } from 'fabric';

interface GridBackgroundProps {
    canvasRef: React.RefObject<Canvas>;
}

const getBackgroundClass = (color: string) => {
    switch (color.toLowerCase()) {
        case '#0f172a': return 'bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#020617]'; // Navy Rich
        case '#ffffff': return 'bg-white'; // Pure White
        case '#374155': return 'bg-gradient-to-br from-gray-700 via-[#374155] to-gray-800'; // Grey Rich
        case '#1A1F36': return 'bg-gradient-to-br from-[#1A1F36] to-[#15192b]'; // Original Dark Rich
        default: return '';
    }
};

export const GridBackground = ({ canvasRef }: GridBackgroundProps) => {
    const { backgroundColor = '#ffffff', zoom } = useCanvasStore();
    const gridRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const renderGrid = () => {
            const canvas = canvasRef.current;
            const gridCanvas = gridRef.current;
            if (!canvas || !gridCanvas) return;

            const ctx = gridCanvas.getContext('2d');
            if (!ctx) return;

            // Match dimensions
            const { width, height } = canvas.getElement().getBoundingClientRect();
            gridCanvas.width = width;
            gridCanvas.height = height;

            // Clear (Keep transparent for gradient to show through)
            ctx.clearRect(0, 0, width, height);

            // Get viewport transform
            const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
            const offset = { x: vpt[4], y: vpt[5] };
            const zoomLevel = vpt[0];

            const gridSize = 20 * zoomLevel;
            const dotSize = 1 * Math.max(1, zoomLevel);

            // Calc start points
            const startX = offset.x % gridSize;
            const startY = offset.y % gridSize;

            // Map background to grid color
            let dotFill = 'rgba(0, 0, 0, 0.1)';

            switch (backgroundColor) {
                case '#0f172a': dotFill = '#1e293b'; break; // Navy -> Slate-800
                case '#ffffff': dotFill = '#e5e7eb'; break; // White -> Gray-200
                case '#374155': dotFill = '#4b5563'; break; // Grey -> Gray-600
                case '#1A1F36': dotFill = 'rgba(255, 255, 255, 0.05)'; break;
                default:
                    if (['#000000', '#0F0D1A'].includes(backgroundColor)) dotFill = 'rgba(255, 255, 255, 0.1)';
                    break;
            }

            ctx.fillStyle = dotFill;

            for (let x = startX; x < width; x += gridSize) {
                for (let y = startY; y < height; y += gridSize) {
                    ctx.beginPath();
                    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            // Sync grid render with Fabric's render loop for performance
            // This handles zoom, pan, and object modifications in one go
            canvas.on('after:render', renderGrid);
            // Initial render
            renderGrid();
        }

        window.addEventListener('resize', renderGrid);

        return () => {
            window.removeEventListener('resize', renderGrid);
            if (canvas) {
                canvas.off('after:render', renderGrid);
            }
        };
    }, [canvasRef.current, backgroundColor, zoom]);

    // Determine render mode:
    // If it's one of our presets, use the rich gradient class.
    // If it's a custom hex, fall back to inline style.
    const safeColor = backgroundColor || '#ffffff';
    const normalizedColor = safeColor.toLowerCase();
    const bgClass = getBackgroundClass(normalizedColor);
    const isLight = normalizedColor === '#ffffff' || normalizedColor === '#fff';

    return (
        <>
            {/* Base Layer (Gradient or Solid) */}
            <div
                className={`absolute inset-0 pointer-events-none transition-colors duration-500 ease-in-out ${bgClass}`}
                style={!bgClass ? { backgroundColor } : undefined}
            />

            {/* Grid Pattern Layer */}
            <canvas
                ref={gridRef}
                className={`absolute inset-0 pointer-events-none z-0 mix-blend-overlay ${isLight ? 'opacity-40' : 'opacity-80'}`}
            />

            {/* Vignette Overlay for Depth - HIDDEN for White/Light backgrounds */}
            {!isLight && (
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20 bg-[radial-gradient(circle_at_center,transparent_20%,#000_100%)]" />
            )}
        </>
    );
};
