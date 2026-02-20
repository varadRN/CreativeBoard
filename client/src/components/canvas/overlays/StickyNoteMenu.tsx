import { useEffect, useState } from 'react';
import { Canvas, Object as FabricObject, Point, util, Group } from 'fabric';
import { StickyNoteColors } from '@/lib/fabricUtils';
import { Trash2 } from 'lucide-react';

interface StickyNoteMenuProps {
    canvas: Canvas | null;
    selectedObject: FabricObject | null;
}

export const StickyNoteMenu = ({ canvas, selectedObject }: StickyNoteMenuProps) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!selectedObject || !canvas) return;

        const updatePosition = () => {
            const obj = selectedObject;
            const rect = obj.getBoundingRect();

            // Top-Left in scene
            const tl = new Point(rect.left, rect.top);
            // Viewport Transform
            const vpt = canvas.viewportTransform;
            if (!vpt) return;

            // Transform to viewport
            const tlVp = util.transformPoint(tl, vpt);

            // Dimensions need to be scaled by zoom
            const zoom = canvas.getZoom();
            const widthVp = rect.width * zoom;

            // Place it 60px above the top
            setPosition({
                top: tlVp.y - 60,
                left: tlVp.x + widthVp / 2
            });
        };

        updatePosition();

        // Listen to object moving
        selectedObject.on('moving', updatePosition);
        selectedObject.on('scaling', updatePosition);
        selectedObject.on('modified', updatePosition);

        // Also listen to canvas zoom/pan
        // @ts-ignore
        canvas.on('viewport:transform', updatePosition);

        return () => {
            selectedObject.off('moving', updatePosition);
            selectedObject.off('scaling', updatePosition);
            selectedObject.off('modified', updatePosition);
            // @ts-ignore
            canvas.off('viewport:transform', updatePosition);
        };
    }, [selectedObject, canvas]);

    // @ts-ignore
    if (!selectedObject || selectedObject.type !== 'sticky-note') return null;

    const changeColor = (colorIndex: number) => {
        if (!canvas || !selectedObject) return;
        const color = StickyNoteColors[colorIndex];
        const group = selectedObject as Group;
        // Assume order: Rect is 0, Textbox is 1
        const items = group.getObjects();
        // Background
        if (items[0]) items[0].set('fill', color.bg);
        // Text
        if (items[1]) items[1].set('fill', color.text);

        // Update custom property
        // @ts-ignore
        selectedObject.colorIndex = colorIndex;

        canvas.requestRenderAll();
        canvas.fire('object:modified', { target: selectedObject }); // trigger save
    };

    const deleteNote = () => {
        if (!canvas || !selectedObject) return;
        canvas.remove(selectedObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        canvas.fire('object:removed', { target: selectedObject }); // trigger history/save
    };

    return (
        <div
            className="absolute z-50 flex items-center gap-2 p-2 bg-white rounded-full shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, 0)'
            }}
        >
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2">
                {StickyNoteColors.map((c, i) => (
                    <button
                        key={c.name}
                        onClick={() => changeColor(i)}
                        className="w-6 h-6 rounded-full border border-black/5 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c.bg }}
                        title={c.name}
                    />
                ))}
            </div>

            <button
                onClick={deleteNote}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Note"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};
