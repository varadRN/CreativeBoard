import { useCanvasStore, Tool } from '@/stores/canvasStore';
import { cn } from '@/lib/utils';

export const EraserPalette = () => {
    const { activeTool, setTool } = useCanvasStore();

    const handleSelect = (e: React.MouseEvent, tool: Tool) => {
        e.preventDefault();
        e.stopPropagation();
        setTool(tool);
    };

    const erasers = [
        {
            tool: Tool.ERASER,
            name: 'Freehand Eraser',
            desc: 'Erase by dragging',
            icon: (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.6 1.6c.8-.8 2-.8 2.8 0L21.4 5.6c.8.8.8 2 0 2.8L10 20" />
                    <path d="M6.5 13.5 11 18" />
                </svg>
            ),
        },
        {
            tool: Tool.OBJECT_ERASER,
            name: 'Object Eraser',
            desc: 'Click to remove object',
            icon: (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.6 1.6c.8-.8 2-.8 2.8 0L21.4 5.6c.8.8.8 2 0 2.8L10 20" />
                    <path d="M6.5 13.5 11 18" />
                    <circle cx="19" cy="19" r="4" fill="currentColor" strokeWidth="0" />
                    <path d="M17.5 19h3" stroke="white" strokeWidth="1.5" />
                </svg>
            ),
        },
    ];

    return (
        <div
            className="absolute left-2 top-0 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-2 w-[200px] z-50"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-1">
                {erasers.map(({ tool, name, desc, icon }) => {
                    const isActive = activeTool === tool;
                    return (
                        <button
                            key={tool}
                            onPointerDown={(e) => handleSelect(e, tool)}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-100 cursor-pointer text-left",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
                                    : "text-slate-800 hover:bg-slate-50 active:scale-[0.98]"
                            )}
                        >
                            <div className={cn(
                                "flex-shrink-0",
                                isActive ? "text-indigo-600" : "text-slate-900"
                            )}>
                                {icon}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[13px] font-semibold leading-tight">{name}</div>
                                <div className={cn(
                                    "text-[10px] leading-tight mt-0.5",
                                    isActive ? "text-indigo-400" : "text-slate-400"
                                )}>{desc}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
