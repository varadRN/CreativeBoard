import { useRef, useState, useEffect } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { GripVertical, Pipette, X, Palette, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = [
    // Standard Palette
    '#ffffff', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d',
    '#fff7ed', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#7c2d12',
    '#fefce8', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#713f12',
    '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d',
    '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857',
    '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985',
    '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
    '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca',
    '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce',
    '#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf',
    '#fff1f2', '#ffe4e6', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d',
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000',
    'transparent'
];

const BACKGROUND_PRESETS = [
    { color: '#ffffff', grid: '#e5e7eb', label: 'White' }, // White / Gray-200
    { color: '#f8fafc', grid: '#e2e8f0', label: 'Light' }, // Slate-50 / Slate-200
    { color: '#374155', grid: '#4b5563', label: 'Grey' },  // Gray-700 / Gray-600
];

export const ColorPickerPill = () => {
    const {
        strokeColor, setStrokeColor,
        backgroundColor, setBackgroundColor,
        strokeWidth, setStrokeWidth
    } = useCanvasStore();

    // activeTab: 'stroke' | 'background'
    const [activeTab, setActiveTab] = useState<'stroke' | 'background'>('stroke');
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleColorSelect = (color: string) => {
        if (activeTab === 'stroke') {
            setStrokeColor(color);
        } else {
            setBackgroundColor(color);
        }
    };

    const activeColor = activeTab === 'stroke' ? strokeColor : backgroundColor;

    // Helper to determine if color is light
    const isLightColor = (color: string) => {
        if (!color) return false;
        if (color === 'transparent') return true; // Treated as white/light
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 155;
    };

    return (
        <motion.div
            ref={containerRef}
            className="fixed top-20 left-6 z-40"
            initial={false}
        >
            {/* Pill Trigger */}
            <div
                className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center gap-3 relative z-50 select-none group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* 6-Dot Grip (Hidden since drag is disabled for stability) */}
                <div
                    className="hidden grid-cols-2 gap-[2px] p-1 opacity-50"
                    title="Fixed position"
                >
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-gray-400" />
                    ))}
                </div>

                <div className="w-px h-6 bg-gray-200" />

                <div className="flex items-center gap-3 pr-1">
                    {/* Stroke Indicator (Squircle Style) */}
                    <button
                        onClick={() => { setActiveTab('stroke'); setIsOpen(true); }}
                        className={cn(
                            "w-8 h-8 rounded-xl transition-all flex items-center justify-center relative shadow-sm border border-gray-100",
                            activeTab === 'stroke' && isOpen ? "ring-2 ring-primary ring-offset-1" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: strokeColor === 'transparent' ? 'white' : strokeColor }}
                        title="Stroke Color"
                    >
                        {/* Palette Icon Overlay (Watermark Effect) */}
                        <AnimatePresence>
                            {isHovered && !isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <Palette
                                        className={cn(
                                            "w-5 h-5 drop-shadow-sm opacity-90",
                                            isLightColor(strokeColor === 'transparent' ? '#ffffff' : strokeColor)
                                                ? "text-gray-800"
                                                : "text-white"
                                        )}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {strokeColor === 'transparent' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-px bg-red-500 rotate-45" />
                            </div>
                        )}
                    </button>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Background/Fill Indicator (Rounded Square) */}
                    <button
                        onClick={() => { setActiveTab('background'); setIsOpen(true); }}
                        className={cn(
                            "w-8 h-8 rounded-xl transition-all flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-100",
                            activeTab === 'background' && isOpen ? "ring-2 ring-primary ring-offset-1" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: backgroundColor }}
                        title="Board Background"
                    >
                        {/* Grid Pattern Overlay */}
                        <div className="absolute inset-0 opacity-100"
                            style={{
                                backgroundImage: `radial-gradient(${backgroundColor === '#0f172a' ? '#1e293b' :
                                    backgroundColor === '#ffffff' ? '#e5e7eb' :
                                        backgroundColor === '#374155' ? '#4b5563' :
                                            'rgba(255,255,255,0.1)'
                                    } 1px, transparent 1px)`,
                                backgroundSize: '6px 6px'
                            }}
                        />

                        {/* Background Icon Overlay (Watermark Effect) */}
                        <AnimatePresence>
                            {isHovered && !isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <Grid
                                        className={cn(
                                            "w-5 h-5 drop-shadow-sm opacity-90",
                                            isLightColor(backgroundColor) ? "text-gray-800" : "text-white"
                                        )}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10, x: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 10, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute top-full left-0 bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4 cursor-default",
                            activeTab === 'background' ? "w-auto flex-row" : "w-64"
                        )}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                        {activeTab === 'stroke' ? (
                            <>
                                {/* Stroke Palette Content (Existing) */}
                                <div className="flex items-center justify-between px-2 pt-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Stroke Color
                                    </span>
                                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-8 gap-2 px-2">
                                    {COLORS.map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleColorSelect(c)}
                                            className={cn(
                                                "w-6 h-6 rounded-md border border-gray-100 hover:scale-110 transition-transform relative overflow-hidden",
                                                activeColor === c && "ring-2 ring-primary ring-offset-1"
                                            )}
                                            style={{ backgroundColor: c === 'transparent' ? 'white' : c }}
                                            title={c}
                                        >
                                            {c === 'transparent' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-px bg-red-500 rotate-45" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="h-px bg-gray-100 mx-2" />

                                {/* Custom Color */}
                                <div className="flex flex-col gap-2 px-2">
                                    <span className="text-xs font-semibold text-gray-500">Custom</span>
                                    <div className="h-8 rounded-lg border border-gray-200 relative overflow-hidden flex items-center">
                                        <input
                                            type="color"
                                            value={activeColor === 'transparent' ? '#ffffff' : activeColor}
                                            onChange={(e) => handleColorSelect(e.target.value)}
                                            className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                        />
                                        <div className="absolute right-2 pointer-events-none text-gray-400">
                                            <Pipette className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Size Slider (Only valid for Stroke, or maybe border of Fill?) */}
                                <div className="h-px bg-gray-100 mx-2" />
                                <div className="flex flex-col gap-2 px-2 pb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500">Size</span>
                                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                                            {strokeWidth}px
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={strokeWidth}
                                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 p-1">
                                {BACKGROUND_PRESETS.map((preset, i) => {
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleColorSelect(preset.color)}
                                            className={cn(
                                                "w-10 h-10 rounded-xl border-2 transition-all relative overflow-hidden hover:scale-105",
                                                backgroundColor === preset.color ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                                            )}
                                            style={{ backgroundColor: preset.color }}
                                            title={preset.label}
                                        >
                                            {/* Grid hint */}
                                            <div className="absolute inset-0 opacity-100"
                                                style={{
                                                    backgroundImage: `radial-gradient(${preset.grid} 1px, transparent 1px)`,
                                                    backgroundSize: '8px 8px'
                                                }}
                                            />

                                            {/* Checkmark for active */}
                                            {backgroundColor === preset.color && (
                                                <div className="absolute inset-0 flex items-center justify-center text-primary-foreground">
                                                    <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
