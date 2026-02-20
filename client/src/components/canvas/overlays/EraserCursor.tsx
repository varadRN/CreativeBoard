import { useEffect, useRef, useState } from 'react';

interface EraserCursorProps {
    containerRef: React.RefObject<HTMLDivElement>;
    active: boolean;
    size: number;
}

export const EraserCursor = ({ containerRef, active, size }: EraserCursorProps) => {
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [isDown, setIsDown] = useState(false);
    const [visible, setVisible] = useState(false);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !active) {
            setVisible(false);
            return;
        }

        const onMove = (e: MouseEvent) => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                setPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
                setVisible(true);
            });
        };

        const onDown = () => setIsDown(true);
        const onUp = () => setIsDown(false);
        const onLeave = () => setVisible(false);
        const onEnter = () => setVisible(true);

        container.addEventListener('mousemove', onMove);
        container.addEventListener('mousedown', onDown);
        container.addEventListener('mouseup', onUp);
        container.addEventListener('mouseleave', onLeave);
        container.addEventListener('mouseenter', onEnter);

        return () => {
            cancelAnimationFrame(rafRef.current);
            container.removeEventListener('mousemove', onMove);
            container.removeEventListener('mousedown', onDown);
            container.removeEventListener('mouseup', onUp);
            container.removeEventListener('mouseleave', onLeave);
            container.removeEventListener('mouseenter', onEnter);
        };
    }, [containerRef, active]);

    if (!active || !visible) return null;

    return (
        <div
            className="pointer-events-none absolute z-40"
            style={{
                left: pos.x - size / 2,
                top: pos.y - size / 2,
                width: size,
                height: size,
            }}
        >
            {/* Outer ring */}
            <div
                className="absolute inset-0 rounded-full transition-all duration-75"
                style={{
                    border: isDown ? '2px solid rgba(239, 68, 68, 0.8)' : '2px solid rgba(100, 116, 139, 0.5)',
                    backgroundColor: isDown ? 'rgba(239, 68, 68, 0.08)' : 'rgba(100, 116, 139, 0.04)',
                    boxShadow: isDown
                        ? '0 0 12px rgba(239, 68, 68, 0.3), inset 0 0 8px rgba(239, 68, 68, 0.1)'
                        : '0 0 8px rgba(0, 0, 0, 0.08)',
                    transform: isDown ? 'scale(0.92)' : 'scale(1)',
                    transition: 'transform 100ms ease, border-color 100ms ease, background-color 100ms ease, box-shadow 100ms ease',
                }}
            />
            {/* Center dot */}
            <div
                className="absolute rounded-full"
                style={{
                    width: 4,
                    height: 4,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: isDown ? 'rgba(239, 68, 68, 0.8)' : 'rgba(100, 116, 139, 0.6)',
                    transition: 'background-color 100ms ease',
                }}
            />
        </div>
    );
};
