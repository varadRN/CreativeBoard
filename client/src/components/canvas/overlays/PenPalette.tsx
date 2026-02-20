import React from 'react';
import { useCanvasStore, Tool } from '@/stores/canvasStore';
import { cn } from '@/lib/utils';
import { Pen, Pencil, PenTool, Highlighter } from 'lucide-react';

export const PenPalette = () => {
    const { activeTool, setTool, strokeWidth, setStrokeWidth } = useCanvasStore();

    const handleSelect = (e: React.MouseEvent, tool: Tool) => {
        e.preventDefault();
        e.stopPropagation();
        setTool(tool);
    };

    const handleStrokeWidth = (e: React.MouseEvent, width: number) => {
        e.preventDefault();
        e.stopPropagation();
        setStrokeWidth(width);
    };

    const pens = [
        {
            tool: Tool.PEN,
            name: 'Pen',
            desc: 'Smooth & precise lines',
            icon: <Pen className="w-5 h-5" />,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-50',
            borderClass: 'border-blue-200'
        },
        {
            tool: Tool.PENCIL,
            name: 'Pencil',
            desc: 'Natural sketchy strokes',
            icon: <Pencil className="w-5 h-5" />,
            colorClass: 'text-slate-600',
            bgClass: 'bg-slate-100',
            borderClass: 'border-slate-200'
        },
        {
            tool: Tool.MARKER,
            name: 'Marker',
            desc: 'Bold & thick strokes',
            icon: <PenTool className="w-5 h-5" />, // Using PenTool as it looks like a marker tip
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-50',
            borderClass: 'border-purple-200'
        },
        {
            tool: Tool.HIGHLIGHTER,
            name: 'Highlighter',
            desc: 'Semi-transparent overlay',
            icon: <Highlighter className="w-5 h-5" />,
            colorClass: 'text-yellow-500',
            bgClass: 'bg-yellow-50',
            borderClass: 'border-yellow-200'
        },
    ];

    const sizes = [
        { size: 2, label: 'Thin' },
        { size: 4, label: 'Medium' },
        { size: 8, label: 'Thick' },
        { size: 16, label: 'Heavy' },
    ];

    return (
        <div
            className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl p-3 w-[260px] z-50 ring-1 ring-slate-900/5 flex flex-col gap-3"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Tools</span>
                {pens.map(({ tool, name, desc, icon, colorClass, bgClass, borderClass }) => {
                    const isActive = activeTool === tool;
                    return (
                        <button
                            key={tool}
                            onPointerDown={(e) => handleSelect(e, tool)}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-left group border border-transparent",
                                isActive
                                    ? cn(bgClass, colorClass, borderClass, "shadow-sm")
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
                            )}
                        >
                            <div className={cn(
                                "flex-shrink-0 p-2 rounded-lg transition-colors",
                                isActive ? "bg-white/50" : "bg-slate-100 group-hover:bg-white"
                            )}>
                                {icon}
                            </div>
                            <div className="min-w-0 flex flex-col">
                                <span className={cn(
                                    "text-[14px] font-semibold leading-tight",
                                    isActive ? "text-current" : "text-slate-700"
                                )}>{name}</span>
                                <span className={cn(
                                    "text-[11px] leading-tight mt-0.5 font-medium",
                                    isActive ? "opacity-90" : "text-slate-400"
                                )}>{desc}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="h-px bg-slate-200/60 w-full" />

            <div className="flex flex-col gap-2 px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Stroke Size</span>
                <div className="flex items-center justify-between gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
                    {sizes.map((s) => (
                        <button
                            key={s.size}
                            onPointerDown={(e) => handleStrokeWidth(e, s.size)}
                            className={cn(
                                "h-8 w-full rounded-lg flex items-center justify-center transition-all duration-200 group relative",
                                strokeWidth === s.size
                                    ? "bg-white shadow-sm ring-1 ring-slate-200"
                                    : "hover:bg-white/50"
                            )}
                            title={s.label}
                        >
                            <div
                                className={cn(
                                    "rounded-full bg-slate-900 transition-all duration-300",
                                    strokeWidth === s.size ? "bg-indigo-600" : "bg-slate-400 group-hover:bg-slate-600"
                                )}
                                style={{ width: Math.max(4, s.size / 1.5), height: Math.max(4, s.size / 1.5) }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
