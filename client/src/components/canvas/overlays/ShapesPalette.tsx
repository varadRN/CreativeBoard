import { useCanvasStore, Tool } from '@/stores/canvasStore';
import { cn } from '@/lib/utils';
import {
    Square, Circle, Triangle, Diamond, Star,
    Minus, ArrowRight
} from 'lucide-react';

const shapeGroups = [
    {
        label: 'Lines',
        shapes: [
            { tool: Tool.LINE, icon: Minus, name: 'Line' },
            { tool: Tool.ARROW, icon: ArrowRight, name: 'Arrow' },
        ],
    },
    {
        label: 'Shapes',
        shapes: [
            { tool: Tool.RECTANGLE, icon: Square, name: 'Rectangle' },
            { tool: Tool.CIRCLE, icon: Circle, name: 'Circle' },
            { tool: Tool.TRIANGLE, icon: Triangle, name: 'Triangle' },
            { tool: Tool.DIAMOND, icon: Diamond, name: 'Diamond' },
            { tool: Tool.STAR, icon: Star, name: 'Star' },
        ],
    },
];

export const ShapesPalette = () => {
    const { activeTool, setTool } = useCanvasStore();

    const handleSelect = (e: React.MouseEvent, tool: Tool) => {
        e.preventDefault();
        e.stopPropagation();
        setTool(tool);
    };

    return (
        <div
            className="absolute left-2 top-0 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-3 w-[220px] z-50"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            {shapeGroups.map((group, gi) => (
                <div key={group.label}>
                    {gi > 0 && <div className="h-px bg-slate-200/80 my-2" />}
                    <div className="grid grid-cols-4 gap-1">
                        {group.shapes.map(({ tool, icon: Icon, name }) => {
                            const isActive = activeTool === tool;
                            return (
                                <button
                                    key={tool}
                                    onPointerDown={(e) => handleSelect(e, tool)}
                                    title={name}
                                    className={cn(
                                        "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-100 cursor-pointer",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200"
                                            : "text-slate-900 hover:bg-slate-100 active:scale-95"
                                    )}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
