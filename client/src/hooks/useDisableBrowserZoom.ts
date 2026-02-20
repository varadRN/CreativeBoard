import { useEffect } from 'react';

/**
 * Prevents native browser zoom behavior (Ctrl + Wheel, Pinch-to-Zoom on Trackpad).
 * This ensures only the canvas zooms, not the entire UI.
 */
export const useDisableBrowserZoom = () => {
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_')) {
                e.preventDefault();
            }
        };

        // Touch/Gesture events (safari/mobile)
        const handleGestureStart = (e: Event) => {
            e.preventDefault();
        };

        // Add listeners with { passive: false } to allow prevention
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKey);

        // Safari/Gesture specific
        // @ts-ignore
        if (typeof document.gestureStart !== 'undefined') {
            // @ts-ignore
            document.addEventListener('gesturestart', handleGestureStart);
            // @ts-ignore
            document.addEventListener('gesturechange', handleGestureStart);
        }

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKey);
            // @ts-ignore
            if (typeof document.gestureStart !== 'undefined') {
                // @ts-ignore
                document.removeEventListener('gesturestart', handleGestureStart);
                // @ts-ignore
                document.removeEventListener('gesturechange', handleGestureStart);
            }
        };
    }, []);
};
