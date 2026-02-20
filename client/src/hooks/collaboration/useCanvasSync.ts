
import { useEffect, useRef, useCallback } from 'react';
import { socketClient } from '@/lib/collaboration/socketClient';
import { Canvas, util } from 'fabric';
import { toast } from 'sonner';
import { debounce } from 'lodash';

const DEBUG_SYNC = true;

export const useCanvasSync = (
    boardId: string,
    canvas: Canvas | null,
    userId: string | undefined,
    onAction?: () => void,
    isLoaded: boolean = true,
    isConnected: boolean = false
) => {
    const isRemoteUpdate = useRef(false);
    const isMounted = useRef(true);
    // Use refs to avoid stale closures
    const isLoadedRef = useRef(isLoaded);
    const boardIdRef = useRef(boardId);

    // Keep refs in sync
    useEffect(() => { isLoadedRef.current = isLoaded; }, [isLoaded]);
    useEffect(() => { boardIdRef.current = boardId; }, [boardId]);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // --- Listeners (Receive from Server) ---
    useEffect(() => {
        const socket = socketClient.getSocket();
        if (!socket || !boardId || !canvas || !userId) return;

        console.log('[SYNC] Listener effect running, setting up RX handlers');

        const handleElementAdded = (data: { element: any, userId: string }) => {
            if (DEBUG_SYNC) toast.info(`📥 RX element-added: ${data.element?.type}`);
            console.log('[SYNC] RX element-added', data.element?.type, data.element?.id);
            isRemoteUpdate.current = true;

            util.enlivenObjects([data.element])
                .then((objects: any[]) => {
                    if (!isMounted.current) return;
                    try { canvas.getElement(); } catch { return; }
                    objects.forEach(obj => {
                        obj.set('id', data.element.id);
                        canvas.add(obj);
                    });
                    canvas.requestRenderAll();
                    if (DEBUG_SYNC) toast.success(`✅ Added remote element`);
                })
                .catch((err) => {
                    console.error('[SYNC] enlivenObjects failed:', err);
                    if (DEBUG_SYNC) toast.error(`❌ Failed: ${err.message}`);
                })
                .finally(() => {
                    isRemoteUpdate.current = false;
                });
        };

        const handleElementModified = (data: { element: any, userId: string }) => {
            if (!isMounted.current) return;
            try { canvas.getElement(); } catch { return; }

            const obj = canvas.getObjects().find((o: any) => o.id === data.element.id);
            if (obj) {
                isRemoteUpdate.current = true;
                try {
                    obj.set(data.element);
                    obj.setCoords();
                    canvas.requestRenderAll();
                } finally {
                    isRemoteUpdate.current = false;
                }
            }
        };

        const handleElementRemoved = (data: { elementId: string, userId: string }) => {
            if (!isMounted.current) return;
            try { canvas.getElement(); } catch { return; }

            const obj = canvas.getObjects().find((o: any) => o.id === data.elementId);
            if (obj) {
                isRemoteUpdate.current = true;
                try {
                    canvas.remove(obj);
                    canvas.requestRenderAll();
                } finally {
                    isRemoteUpdate.current = false;
                }
            }
        };

        const handleCanvasUpdate = (data: { canvasData: any, userId: string }) => {
            if (!isMounted.current) return;
            try { canvas.getElement(); } catch { return; }
            console.log('[SYNC] RX canvas-update (full state sync)');
            if (DEBUG_SYNC) toast.info('📥 RX full canvas sync');
            isRemoteUpdate.current = true;
            canvas.loadFromJSON(data.canvasData).then(() => {
                canvas.requestRenderAll();
                isRemoteUpdate.current = false;
            }).catch(() => {
                isRemoteUpdate.current = false;
            });
        };

        socket.on('element-added', handleElementAdded);
        socket.on('element-modified', handleElementModified);
        socket.on('element-removed', handleElementRemoved);
        socket.on('canvas-update', handleCanvasUpdate);

        return () => {
            socket.off('element-added', handleElementAdded);
            socket.off('element-modified', handleElementModified);
            socket.off('element-removed', handleElementRemoved);
            socket.off('canvas-update', handleCanvasUpdate);
        };
    }, [boardId, canvas, userId, isConnected]);

    // --- Emitters (Send to Server) ---
    useEffect(() => {
        if (!boardId || !canvas) return;

        console.log('[SYNC] Emitter effect running! boardId:', boardId, 'canvas:', !!canvas);

        const ensureId = (obj: any) => {
            if (!obj.id) obj.id = crypto.randomUUID();
            return obj.id;
        };

        // Debounced full-canvas sync as GUARANTEED BACKUP
        const debouncedFullSync = debounce(() => {
            if (isRemoteUpdate.current || !isLoadedRef.current) return;
            const freshSocket = socketClient.getSocket();
            if (!freshSocket?.connected) return;

            try {
                const json = canvas.toJSON(['id', 'stroke', 'strokeWidth', 'fill', 'opacity',
                    'angle', 'left', 'top', 'scaleX', 'scaleY', 'type', 'path', 'points',
                    'objects', 'text', 'fontSize', 'fontFamily', 'width', 'height', 'rx', 'ry']);
                console.log('[SYNC] TX canvas-update (full state backup)');
                freshSocket.emit('canvas-update', { boardId: boardIdRef.current, canvasData: json });
            } catch (err) {
                console.error('[SYNC] Full canvas sync failed:', err);
            }
        }, 1500); // 1.5 second debounce

        // Emit individual element event + schedule full sync backup
        const emitEvent = (event: string, payload: any) => {
            if (isRemoteUpdate.current) {
                console.log(`[SYNC] Skipped emit ${event}: isRemoteUpdate=true`);
                return;
            }
            // Use ref to check loaded state (avoids stale closure)
            if (!isLoadedRef.current) {
                console.log(`[SYNC] Skipped emit ${event}: not loaded yet`);
                return;
            }
            // Get FRESH socket each time (same pattern as working cursor emitter)
            const freshSocket = socketClient.getSocket();
            if (freshSocket && freshSocket.connected) {
                console.log(`[SYNC] TX ${event}:`, payload?.element?.type || payload?.elementId || 'unknown');
                if (DEBUG_SYNC) toast.success(`📤 TX ${event}`);
                freshSocket.emit(event, payload);
            } else {
                console.error(`[SYNC] TX ${event} FAILED: no connected socket`);
                if (DEBUG_SYNC) toast.error(`❌ TX FAILED: socket not ready`);
            }

            // Schedule full canvas sync as backup
            debouncedFullSync();
        };

        const onObjectAdded = (e: any) => {
            if (!e.target) return;
            const obj = e.target;
            ensureId(obj);
            const element = obj.toObject(['id', 'stroke', 'strokeWidth', 'fill', 'opacity', 'angle', 'left', 'top', 'scaleX', 'scaleY', 'type', 'path', 'points', 'objects', 'text', 'fontSize', 'fontFamily', 'width', 'height']);
            emitEvent('element-added', { boardId: boardIdRef.current, element });
            if (onAction) onAction();
        };

        const onObjectModified = (e: any) => {
            if (!e.target) return;
            let obj = e.target;
            if (obj.group) obj = obj.group;
            ensureId(obj);
            const element = obj.toObject(['id', 'stroke', 'strokeWidth', 'fill', 'opacity', 'angle', 'left', 'top', 'scaleX', 'scaleY', 'type', 'path', 'points', 'objects', 'text', 'fontSize', 'fontFamily', 'width', 'height', 'rx', 'ry']);
            emitEvent('element-modified', { boardId: boardIdRef.current, element });
            if (onAction) onAction();
        };

        const onObjectRemoved = (e: any) => {
            if (!e.target) return;
            emitEvent('element-removed', { boardId: boardIdRef.current, elementId: e.target.id });
            if (onAction) onAction();
        };

        const onPathCreated = (e: any) => {
            const pathObj = e.path || e.target;
            if (!pathObj) return;
            ensureId(pathObj);
            const element = pathObj.toObject(['id', 'stroke', 'strokeWidth', 'fill', 'opacity', 'angle', 'left', 'top', 'scaleX', 'scaleY', 'type', 'path', 'points']);
            emitEvent('element-added', { boardId: boardIdRef.current, element });
            if (onAction) onAction();
        };

        canvas.on('object:added', onObjectAdded);
        canvas.on('object:modified', onObjectModified);
        canvas.on('object:removed', onObjectRemoved);
        canvas.on('path:created', onPathCreated);
        canvas.on('text:changed', onObjectModified);
        canvas.on('text:editing:exited', onObjectModified);

        return () => {
            canvas.off('object:added', onObjectAdded);
            canvas.off('object:modified', onObjectModified);
            canvas.off('object:removed', onObjectRemoved);
            canvas.off('path:created', onPathCreated);
            canvas.off('text:changed', onObjectModified);
            canvas.off('text:editing:exited', onObjectModified);
            debouncedFullSync.cancel();
        };
    }, [boardId, canvas, userId, onAction, isConnected]);

    // Manual Sync Helper (for Undo/Redo)
    const syncCanvasState = useCallback((json: any) => {
        const socket = socketClient.getSocket();
        if (socket && boardId) {
            socket.emit('canvas-update', { boardId, canvasData: json });
        }
    }, [boardId]);

    return { syncCanvasState };
};
