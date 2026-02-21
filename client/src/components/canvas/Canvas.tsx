import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas as FabricCanvas, Point, PencilBrush, Object as FabricObject, Group, Textbox, Rect, Ellipse, Triangle as FabricTriangle, Line as FabricLine, Polygon, Color, util } from 'fabric';
import { debounce } from 'lodash';
import { useCanvasStore, Tool } from '@/stores/canvasStore';
import { useAuthStore } from '@/stores/authStore';
import { CanvasNavbar } from '../../components/layout/CanvasNavbar';
import { Toolbar } from './toolbar/Toolbar';
import { ColorPickerPill } from './color-picker/ColorPickerPill';
import { ZoomControls } from './overlays/ZoomControls';
import { StickyNoteMenu } from './overlays/StickyNoteMenu';
import { EraserCursor } from './overlays/EraserCursor';
import { Loader2, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useDisableBrowserZoom } from '@/hooks/useDisableBrowserZoom';

// Collaboration Hooks  ( ws + presence  setup )
import { useWebSocket } from '@/hooks/collaboration/useWebSocket';
import { usePresence } from '@/hooks/collaboration/usePresence';
import { useCursorEmitter } from '@/hooks/collaboration/useCursors';
import { CursorsLayer } from './collaboration/CursorsLayer';
import { GridBackground } from './GridBackground';
import { createStickyNote } from '@/lib/fabricUtils';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { useHistoryStore } from '@/stores/historyStore';
import { socketClient } from '@/lib/collaboration/socketClient';



export const Canvas = () => {
    useDisableBrowserZoom();    // prevents pinch-zoom breaking the canvas
    const { boardId } = useParams<{ boardId: string }>();
    const { user } = useAuthStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<FabricCanvas | null>(null);

    // History
    const { pushState, snapshot, clearSnapshot } = useHistoryStore();
    const isRestoring = useRef(false);

    const [boardData, setBoardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ type: '403' | '404' | 'error', message: string } | null>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');

    const { isConnected } = useCollaborationStore();

    const {
        activeTool, strokeColor, fillColor, strokeWidth,
        opacity, backgroundColor, setZoom, setTool, zoom,
        stickyNoteColorIndex, setPaletteOpen,
        isReadOnly, setIsReadOnly
    } = useCanvasStore();

    const [canDelete, setCanDelete] = useState(false);
    const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
    const eraserSize = 30;

    // --- Collaboration Hooks ---
    useWebSocket(boardId!);
    usePresence(boardId!);

    const [isLoaded, setIsLoaded] = useState(false);

    const sendCursorPosition = useCursorEmitter(boardId!, user?.color || '#000');

    // Load board data
    useEffect(() => {
        if (!boardId) return;
        const loadBoard = async () => {
            try {
                const { data } = await api.get(`/boards/${boardId}`);
                console.log("Board data fetched:", data.data);
                if (data.data) {
                    setBoardData(data.data);
                    const role = data.data.role || 'viewer';
                    setIsReadOnly(role === 'viewer');
                } else {
                    console.warn("Board data is empty");
                    setLoading(false);
                }
            } catch (error: any) {
                console.warn('Board load failed:', error);
                if (error.response?.status === 403) {
                    setError({ type: '403', message: 'You do not have permission to access this board.' });
                } else if (error.response?.status === 404) {
                    setError({ type: '404', message: 'Board not found or has been deleted.' });
                } else {
                    setError({ type: 'error', message: 'Failed to load board.' });
                }
                setLoading(false);
            }
        };
        loadBoard();
    }, [boardId]);

    // canvas init
    useEffect(() => {
        const canvasElement = canvasRef.current;
        const containerElement = containerRef.current;

        if (!canvasElement || !containerElement || !boardData) return;

        // Strict Mode double-mount fix
        if (fabricRef.current) {
            fabricRef.current.dispose();
        }

        const { width, height } = containerElement.getBoundingClientRect();

        const canvas = new FabricCanvas(canvasElement, {
            width,
            height,
            backgroundColor: 'transparent', // handle bg in GridBackground for the pattern
            selection: true,
        });

        // Save to ref IMMEDIATELY so cleanup works
        fabricRef.current = canvas;

        let safetyTimeout: NodeJS.Timeout;

        if (boardData.canvasData) {
            // Safety timeout: If loadFromJSON hangs, force load after 5s
            safetyTimeout = setTimeout(() => {
                if (loading) {
                    console.warn('Board assets timeout — continuing without saved data.');
                    setLoading(false);
                }
            }, 5000);

            (async () => {
                try {
                    console.log("Loading canvas data into Fabric...", boardData.canvasData ? "Data exists" : "No data");
                    await canvas.loadFromJSON(boardData.canvasData);
                    clearTimeout(safetyTimeout);
                    canvas.requestRenderAll();
                    pushState(JSON.stringify(canvas.toJSON()));
                    setLoading(false);
                    setIsLoaded(true); // Mark as loaded
                } catch (err) {
                    clearTimeout(safetyTimeout);
                    console.error("Canvas load error:", err);
                    setLoading(false);
                    setIsLoaded(true); // Mark as loaded even on error to allow new edits
                }
            })();
        } else {
            setLoading(false);
            setIsLoaded(true);
        }
    }, [boardData]);

    // Read-Only Mode
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        canvas.selection = !isReadOnly;
        canvas.defaultCursor = isReadOnly ? 'default' : 'default';
        canvas.hoverCursor = isReadOnly ? 'default' : 'move';

        canvas.forEachObject((obj) => {
            obj.selectable = !isReadOnly;
            obj.evented = !isReadOnly; // Disable drag/resize/rotate
        });

        // Also discard active object if switching to read-only
        if (isReadOnly) {
            canvas.discardActiveObject();
        }

        canvas.requestRenderAll();
    }, [isReadOnly, isLoaded]); // Re-run when loaded or permissions change

    // Zoom & palm (logo) Handler
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const onMouseWheel = (opt: any) => {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();

            // Zoom (Ctrl + Wheel or Pinch)
            if (opt.e.ctrlKey) {
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.1) zoom = 0.1; // Min zoom 10%
                canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY } as Point, zoom);
                useCanvasStore.getState().setZoom(zoom);
            } else {
                // Pan (Wheel / Trackpad Scroll)
                const vpt = canvas.viewportTransform!;
                vpt[4] -= opt.e.deltaX;
                vpt[5] -= delta;
                canvas.requestRenderAll();
            }
            opt.e.preventDefault();
            opt.e.stopPropagation();
        };

        canvas.on('mouse:wheel', onMouseWheel);

        const handleResize = () => {
            if (containerRef.current && fabricRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                fabricRef.current.setDimensions({ width, height });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            canvas.off('mouse:wheel', onMouseWheel);
            window.removeEventListener('resize', handleResize);
        };
    }, [isLoaded]); // Attach handlers once canvas is loaded

    // Canvas Disposal on Board Change
    useEffect(() => {
        return () => {
            if (fabricRef.current) {
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
        };
    }, [boardId]);


    // Save logic
    const saveCanvas = useMemo(
        () => async (id: string, json: any, thumbnail?: string) => {
            if (!isLoaded) return;
            if (!id) return;
            setSaveStatus('saving');
            try {
                const payload: any = { canvasData: json };
                if (thumbnail) payload.thumbnail = thumbnail;
                await api.put(`/boards/${id}/canvas`, payload);
                setSaveStatus('saved');
            } catch (error) {
                console.error('[SAVE] Canvas save failed:', error);
                setSaveStatus('offline');
            }
        },
        [isLoaded]
    );



    //   keepalive save on tab close

    const latestCanvasData = useRef<string | null>(null);
    useEffect(() => {
        if (!fabricRef.current || !isLoaded) return;
        const updateRef = () => {
            if (isLoaded) {
                latestCanvasData.current = JSON.stringify(fabricRef.current?.toJSON());
            }
        };
        const canvas = fabricRef.current;
        canvas.on('object:modified', updateRef);
        canvas.on('object:added', updateRef);
        canvas.on('object:removed', updateRef);
        return () => {
            canvas.off('object:modified', updateRef);
            canvas.off('object:added', updateRef);
            canvas.off('object:removed', updateRef);
        }
    }, [boardId, isLoaded]);

    useEffect(() => {
        const handleUnload = () => {
            if (latestCanvasData.current && boardId) {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // @ts-ignore
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/boards/${boardId}/canvas/beacon`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ canvasData: JSON.parse(latestCanvasData.current) }),
                    keepalive: true,
                });
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [boardId]);

    // Auto-save on local changes (debounced)
    const handleCanvasChange = useCallback(() => {
        console.log("[DEBUG-CLIENT] Canvas change detected");
        if (!fabricRef.current || !boardId) {
            console.warn("[DEBUG-CLIENT] Missing ref or boardId");
            return;
        }

        // Explicitly include all properties (cast needed: Fabric v6 types don't declare this overload)
        const json = (fabricRef.current as any).toJSON([
            'id', 'stroke', 'strokeWidth', 'fill', 'opacity', 'angle', 'left', 'top',
            'scaleX', 'scaleY', 'type', 'path', 'points', 'objects', 'text', 'fontSize',
            'fontFamily', 'width', 'height', 'rx', 'ry'
        ]);

        saveCanvas(boardId, json);
    }, [saveCanvas, boardId]);

    // Inline sync for undo/redo (replaces useCanvasSync hook to avoid duplicate listeners)
    const syncCanvasState = useCallback((json: any) => {
        const sock = socketClient.getSocket();
        if (sock?.connected && boardId) {
            sock.emit('canvas-update', { boardId, canvasData: json });
        }
    }, [boardId]);

    // ============================================================
    // DIRECT CANVAS SYNC — Lightweight, instant, no lag; dont touch this unless you know what youre doing (imp)
    // ============================================================
    const isRemoteSyncRef = useRef(false);
    const skipNextAddedRef = useRef(false); // Prevent double-emit from path:created + object:added

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas || !boardId || !isLoaded || !isConnected) return;

        // Minimal props for fast serialization
        const PROPS = ['id', 'type', 'left', 'top', 'width', 'height',
            'scaleX', 'scaleY', 'angle', 'fill', 'stroke', 'strokeWidth',
            'opacity', 'path', 'points', 'rx', 'ry', 'radius',
            'text', 'fontSize', 'fontFamily', 'objects',
            'x1', 'y1', 'x2', 'y2', 'flipX', 'flipY'];

        const ensureId = (obj: any) => {
            if (!obj.id) obj.id = crypto.randomUUID();
        };

        const shouldSkip = () => isRemoteSyncRef.current || isRestoring.current;

        const emitNow = (event: string, payload: any) => {
            const sock = socketClient.getSocket();
            if (sock?.connected) sock.emit(event, payload);
        };

        // Debounced auto-save to database (1s after last change)
        const debouncedSave = debounce(() => {
            if (!canvas || !boardId) return;
            const json = (canvas as any).toJSON([
                'id', 'type', 'left', 'top', 'width', 'height',
                'scaleX', 'scaleY', 'angle', 'fill', 'stroke', 'strokeWidth',
                'opacity', 'path', 'points', 'rx', 'ry', 'radius',
                'text', 'fontSize', 'fontFamily', 'objects',
                'x1', 'y1', 'x2', 'y2', 'flipX', 'flipY'
            ]);
            // Generate full-quality PNG image of the board
            let thumbnail: string | undefined;
            try {
                thumbnail = canvas.toDataURL({
                    format: 'png',
                    multiplier: 1,
                });
            } catch (e) { /* ignore image generation errors */ }
            saveCanvas(boardId, json, thumbnail);
        }, 1000);

        // outgoing events
        const onObjectAdded = (e: any) => {
            if (shouldSkip() || !e.target) return;
            if (skipNextAddedRef.current) {
                skipNextAddedRef.current = false;
                return;
            }
            const obj = e.target;
            ensureId(obj);
            emitNow('element-added', { boardId, element: obj.toObject(PROPS) });
            pushState(JSON.stringify(canvas.toJSON()));
            debouncedSave();
        };

        const onObjectModified = (e: any) => {
            if (shouldSkip() || !e.target) return;
            let obj = e.target;
            if (obj.group) obj = obj.group;
            ensureId(obj);
            emitNow('element-modified', { boardId, element: obj.toObject(PROPS) });
            pushState(JSON.stringify(canvas.toJSON()));
            debouncedSave();
        };

        const onObjectRemoved = (e: any) => {
            if (shouldSkip() || !e.target?.id) return;
            emitNow('element-removed', { boardId, elementId: e.target.id });
            pushState(JSON.stringify(canvas.toJSON()));
            debouncedSave();
        };

        const onPathCreated = (e: any) => {
            if (shouldSkip()) return;
            const pathObj = e.path || e.target;
            if (!pathObj) return;
            ensureId(pathObj);
            skipNextAddedRef.current = true;
            emitNow('element-added', { boardId, element: pathObj.toObject(PROPS) });
            pushState(JSON.stringify(canvas.toJSON()));
            debouncedSave();
        };

        // incoming events from other users
        const sock = socketClient.getSocket();

        const handleElementAdded = (data: { element: any, userId: string }) => {
            if (data.userId === user?.id) return;
            isRemoteSyncRef.current = true;
            util.enlivenObjects([data.element])
                .then((objects: any[]) => {
                    objects.forEach(obj => {
                        obj.set('id', data.element.id);
                        canvas.add(obj);
                    });
                    canvas.requestRenderAll();
                })
                .catch(err => console.error('[SYNC] RX add failed:', err))
                .finally(() => { isRemoteSyncRef.current = false; });
        };

        const handleElementModified = (data: { element: any, userId: string }) => {
            if (data.userId === user?.id) return;
            isRemoteSyncRef.current = true;
            const obj = canvas.getObjects().find((o: any) => o.id === data.element.id);
            if (obj) {
                obj.set(data.element);
                obj.setCoords();
                canvas.requestRenderAll();
            }
            isRemoteSyncRef.current = false;
        };

        const handleElementRemoved = (data: { elementId: string, userId: string }) => {
            if (data.userId === user?.id) return;
            isRemoteSyncRef.current = true;
            const obj = canvas.getObjects().find((o: any) => o.id === data.elementId);
            if (obj) {
                canvas.remove(obj);
                canvas.requestRenderAll();
            }
            isRemoteSyncRef.current = false;
        };

        const handleCanvasCleared = (data: { userId: string }) => {
            if (data.userId === user?.id) return;
            isRemoteSyncRef.current = true;
            canvas.clear();
            canvas.requestRenderAll();
            isRemoteSyncRef.current = false;
        };

        const handleCanvasUpdate = (data: { canvasData: any, userId: string }) => {
            if (data.userId === user?.id) return;
            isRemoteSyncRef.current = true;
            canvas.loadFromJSON(data.canvasData)
                .then(() => {
                    canvas.requestRenderAll();
                    isRemoteSyncRef.current = false;
                })
                .catch(() => { isRemoteSyncRef.current = false; });
        };

        // Attach canvas listeners
        canvas.on('object:added', onObjectAdded);
        canvas.on('object:modified', onObjectModified);
        canvas.on('object:removed', onObjectRemoved);
        canvas.on('path:created', onPathCreated);

        // Attach socket listeners
        if (sock) {
            sock.on('element-added', handleElementAdded);
            sock.on('element-modified', handleElementModified);
            sock.on('element-removed', handleElementRemoved);
            sock.on('canvas-update', handleCanvasUpdate);
            sock.on('canvas-cleared', handleCanvasCleared);
        }

        return () => {
            canvas.off('object:added', onObjectAdded);
            canvas.off('object:modified', onObjectModified);
            canvas.off('object:removed', onObjectRemoved);
            canvas.off('path:created', onPathCreated);
            debouncedSave.cancel();
            if (sock) {
                sock.off('element-added', handleElementAdded);
                sock.off('element-modified', handleElementModified);
                sock.off('element-removed', handleElementRemoved);
                sock.off('canvas-update', handleCanvasUpdate);
                sock.off('canvas-cleared', handleCanvasCleared);
            }
        };
    }, [boardId, isLoaded, isConnected, user?.id]);



    // Handle undo/redo functionality (imp)
    useEffect(() => {
        if (snapshot && !isRestoring.current) {
            const canvas = fabricRef.current;
            if (!canvas) return;

            // Block external updates
            isRestoring.current = true;

            const json = JSON.parse(snapshot);

            canvas.loadFromJSON(json)
                .then(() => {
                    canvas.requestRenderAll();
                    // Sync restored state to server
                    saveCanvas(boardId!, canvas.toJSON());

                    // --- REAL-TIME SYNC FIX ---
                    // Broadcast full state to other clients immediately
                    syncCanvasState(json);

                    isRestoring.current = false;
                    clearSnapshot();
                })
                .catch((err) => {
                    console.error("Undo/Redo failed:", err);
                    isRestoring.current = false;
                    clearSnapshot();
                });
        }
    }, [snapshot, clearSnapshot, saveCanvas, syncCanvasState, boardId]);



    // Sync Zoom Store -> Fabric Canvas
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        // If zoom changed externally (e.g. from Toolbar buttons)
        if (Math.abs(canvas.getZoom() - zoom) > 0.001) {
            const { width = 800, height = 600 } = canvas; // Use canvas dimensions
            const point = new Point(width / 2, height / 2);

            canvas.zoomToPoint(point, zoom);
            canvas.requestRenderAll();
        }
    }, [zoom]);

    // Sticky Note 
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas || activeTool !== Tool.STICKY_NOTE) return;

        try {
            // Calculate center of visible area (accounting for pan/zoom)
            const vpt = canvas.viewportTransform;
            if (!vpt) return;

            // Center of the canvas element size, transformed to scene coordinates
            const centerX = (canvas.width! / 2 - vpt[4]) / vpt[0];
            const centerY = (canvas.height! / 2 - vpt[5]) / vpt[3];

            // @ts-ignore
            const note = createStickyNote({ x: centerX, y: centerY }, stickyNoteColorIndex);
            canvas.add(note);
            canvas.setActiveObject(note);
            canvas.requestRenderAll();
            pushState(JSON.stringify(canvas.toJSON()));
            saveCanvas(boardId!, canvas.toJSON());

            // Auto-Focus Text (Miro-style: Type immediately)
            // @ts-ignore
            const textObj = (note as Group).getObjects().find(obj => obj.type === 'textbox') as Textbox;
            if (textObj) {
                setTimeout(() => {
                    try {
                        // Ensure note is active
                        if (canvas.getActiveObject() !== note) {
                            canvas.setActiveObject(note);
                        }
                        // Enter Editing (might fail on Groups)
                        textObj.enterEditing();
                        textObj.selectAll();
                        canvas.requestRenderAll();
                    } catch (e) {
                        console.warn("Auto-focus failed:", e);
                    }
                }, 100);
            }

            toast.success("Sticky Note Added!");

            // Reset to Select immediately so user can edit/move
            setTool(Tool.SELECT);
        } catch (err) {
            console.error("Failed to create sticky note:", err);
            console.warn("Failed to create sticky note:", err);
            setTool(Tool.SELECT);
        }
    }, [activeTool, saveCanvas, setTool, stickyNoteColorIndex]);
    // Update tool properties
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        if (activeTool === Tool.PEN) {
            // Regular pen brush
            const brush = new PencilBrush(canvas);
            brush.color = strokeColor;
            brush.width = strokeWidth;
            brush.strokeLineCap = 'round';
            brush.strokeLineJoin = 'round';
            canvas.freeDrawingBrush = brush;
            canvas.isDrawingMode = true;
            canvas.selection = false;
            canvas.freeDrawingCursor = 'crosshair';
            // Custom Pen Cursor - Distinct Pen with Clip
            const penSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'/></svg>`;
            const penCursor = `url("data:image/svg+xml,${encodeURIComponent(penSvg)}") 0 24, auto`;
            canvas.defaultCursor = penCursor;
            canvas.hoverCursor = penCursor;
            canvas.freeDrawingCursor = penCursor;
        } else if (activeTool === Tool.PENCIL) {
            // Pencil: thinner, more precise
            const brush = new PencilBrush(canvas);
            brush.color = strokeColor;
            brush.width = strokeWidth; // Use direct width
            brush.strokeLineCap = 'round';
            brush.strokeLineJoin = 'round';
            canvas.freeDrawingBrush = brush;
            canvas.isDrawingMode = true;
            canvas.selection = false;

            // Custom Pencil Cursor - Pencil with Eraser (Edit-2 style)
            const pencilSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'/><path d='M15 5l4 4'/></svg>`;
            const pencilCursor = `url("data:image/svg+xml,${encodeURIComponent(pencilSvg)}") 2 22, auto`;
            canvas.defaultCursor = pencilCursor;
            canvas.hoverCursor = pencilCursor;
            canvas.freeDrawingCursor = pencilCursor;
        } else if (activeTool === Tool.MARKER) {
            // Marker: bold, thick strokes
            const brush = new PencilBrush(canvas);
            brush.color = strokeColor;
            brush.width = strokeWidth; // Use direct width
            brush.strokeLineCap = 'round';
            brush.strokeLineJoin = 'round';
            canvas.freeDrawingBrush = brush;
            canvas.isDrawingMode = true;
            canvas.selection = false;

            // Custom Marker Cursor - Chisel Tip (Corrected Bounds)
            const markerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M16.5 2.5L2.5 16.5 0 24l7.5-2.5 14-14 -5-5z'/></svg>`;
            const markerCursor = `url("data:image/svg+xml,${encodeURIComponent(markerSvg)}") 0 24, auto`;
            canvas.defaultCursor = markerCursor;
            canvas.hoverCursor = markerCursor;
            canvas.freeDrawingCursor = markerCursor;
        } else if (activeTool === Tool.HIGHLIGHTER) {
            // Highlighter: thick, semi-transparent overlay
            const brush = new PencilBrush(canvas);
            try {
                // Use strokeColor but force 40% opacity
                const c = new Color(strokeColor);
                c.setAlpha(0.4);
                brush.color = c.toRgba();
            } catch (e) {
                brush.color = strokeColor;
            }
            brush.width = strokeWidth * 4; // Scaled relative to size settings (e.g. 8xp -> 32px highlighter)
            brush.strokeLineCap = 'butt'; // Square ends
            brush.strokeLineJoin = 'round';
            canvas.freeDrawingBrush = brush;
            canvas.isDrawingMode = true;
            canvas.selection = false;

            // Custom Highlighter Cursor - Wide angled tip
            const highlighterSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m9 11-6 6v3h9l3-3'/><path d='m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4'/></svg>`;
            const highlighterCursor = `url("data:image/svg+xml,${encodeURIComponent(highlighterSvg)}") 0 24, auto`;
            canvas.defaultCursor = highlighterCursor;
            canvas.hoverCursor = highlighterCursor;
            canvas.freeDrawingCursor = highlighterCursor;
        } else if (activeTool === Tool.ERASER) {
            // Real-world eraser: draws white over content (like painting white)
            const eraserBrush = new PencilBrush(canvas);
            eraserBrush.color = '#ffffff';
            eraserBrush.width = eraserSize;
            eraserBrush.strokeLineCap = 'round';
            eraserBrush.strokeLineJoin = 'round';
            canvas.freeDrawingBrush = eraserBrush;
            canvas.isDrawingMode = true;
            canvas.selection = false;
            // Eraser cursor — rounded rectangle with pink eraser look
            const eraserSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect x='6' y='4' width='20' height='24' rx='4' fill='%23f8b4c8' stroke='%23e27396' stroke-width='1.5'/><rect x='6' y='20' width='20' height='8' rx='2' fill='%23f9f9f9' stroke='%23e27396' stroke-width='1.5'/><line x1='10' y1='22' x2='22' y2='22' stroke='%23ddd' stroke-width='1'/></svg>`;
            const eraserCursor = `url("data:image/svg+xml,${eraserSvg}") 16 28, auto`;
            canvas.defaultCursor = eraserCursor;
            canvas.hoverCursor = eraserCursor;
            canvas.freeDrawingCursor = eraserCursor;
        } else if (activeTool === Tool.HAND) {
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = 'grab';
            canvas.hoverCursor = 'grab';
        } else if (activeTool === Tool.TEXT) {
            // Text tool: click to place text
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = 'text';
            canvas.hoverCursor = 'text';
        } else if ([Tool.RECTANGLE, Tool.CIRCLE, Tool.TRIANGLE, Tool.DIAMOND, Tool.STAR, Tool.LINE, Tool.ARROW].includes(activeTool)) {
            // Shape tools: crosshair cursor
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
        } else if (activeTool === Tool.OBJECT_ERASER) {
            // Object eraser: click to remove objects — custom eraser cursor with X
            canvas.isDrawingMode = false;
            canvas.selection = false;
            const objEraserSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect x='6' y='4' width='20' height='24' rx='4' fill='%23a5b4fc' stroke='%234f46e5' stroke-width='1.5'/><rect x='6' y='20' width='20' height='8' rx='2' fill='%23f9f9f9' stroke='%234f46e5' stroke-width='1.5'/><line x1='13' y1='10' x2='19' y2='16' stroke='white' stroke-width='2' stroke-linecap='round'/><line x1='19' y1='10' x2='13' y2='16' stroke='white' stroke-width='2' stroke-linecap='round'/></svg>`;
            const objEraserCursor = `url("data:image/svg+xml,${objEraserSvg}") 16 28, auto`;
            canvas.defaultCursor = objEraserCursor;
            canvas.hoverCursor = objEraserCursor;
        } else {
            canvas.isDrawingMode = false;
            canvas.selection = activeTool === Tool.SELECT;
            canvas.defaultCursor = 'default';
            canvas.hoverCursor = 'move';
            canvas.freeDrawingCursor = 'default';
        }
    }, [activeTool, strokeColor, strokeWidth, fabricRef.current]);


    // Event Listeners
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;

        // --- Shape drawing state ---
        let isDrawingShape = false;
        let shapeStartX = 0;
        let shapeStartY = 0;
        let activeShape: FabricObject | null = null;
        const shapeTool = [Tool.RECTANGLE, Tool.CIRCLE, Tool.TRIANGLE, Tool.DIAMOND, Tool.STAR, Tool.LINE, Tool.ARROW];

        // --- Object eraser state ---
        let isObjectErasing = false;
        let objectsErased = false;

        // Generate diamond points for a given width and height
        const makeDiamondPoints = (w: number, h: number) => [
            { x: w / 2, y: 0 },
            { x: w, y: h / 2 },
            { x: w / 2, y: h },
            { x: 0, y: h / 2 },
        ];

        // Generate 5-point star points for a given width and height
        const makeStarPoints = (w: number, h: number) => {
            const pts: { x: number; y: number }[] = [];
            const cx = w / 2, cy = h / 2;
            const outerRx = w / 2, outerRy = h / 2;
            const innerRx = w / 5, innerRy = h / 5;
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI / 5) * i - Math.PI / 2;
                const rx = i % 2 === 0 ? outerRx : innerRx;
                const ry = i % 2 === 0 ? outerRy : innerRy;
                pts.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
            }
            return pts;
        };

        const baseProps = () => ({
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeUniform: true,
            selectable: false,
            evented: false,
        });

        const createShapePreview = (x: number, y: number) => {
            const props = {
                ...baseProps(),
                left: x, top: y, width: 1, height: 1,
                originX: 'left' as const,
                originY: 'top' as const,
            };
            switch (activeTool) {
                case Tool.RECTANGLE:
                    return new Rect({ ...props, rx: 4, ry: 4 });
                case Tool.CIRCLE:
                    return new Ellipse({ ...props, rx: 1, ry: 1 });
                case Tool.TRIANGLE:
                    return new FabricTriangle({ ...props });
                case Tool.DIAMOND:
                    return new Polygon(makeDiamondPoints(2, 2), { ...baseProps(), left: x, top: y });
                case Tool.STAR:
                    return new Polygon(makeStarPoints(2, 2), { ...baseProps(), left: x, top: y });
                case Tool.LINE:
                    return new FabricLine([x, y, x, y], { ...baseProps(), strokeLineCap: 'round' as const });
                case Tool.ARROW:
                    return new FabricLine([x, y, x, y], { ...baseProps(), strokeLineCap: 'round' as const });
                default:
                    return new Rect(props);
            }
        };

        const onMouseMove = (opt: any) => {
            const evt = opt.e;
            const pointer = canvas.getPointer(evt);
            sendCursorPosition(pointer.x, pointer.y);

            // Object eraser: remove objects as cursor passes over them
            if (isObjectErasing && activeTool === Tool.OBJECT_ERASER) {
                const target = canvas.findTarget(evt);
                if (target) {
                    canvas.remove(target);
                    canvas.requestRenderAll();
                    objectsErased = true;
                }
                return;
            }

            // Shape drawing: resize preview
            if (isDrawingShape && activeShape) {
                const w = pointer.x - shapeStartX;
                const h = pointer.y - shapeStartY;
                const absW = Math.abs(w);
                const absH = Math.abs(h);
                const left = Math.min(shapeStartX, pointer.x);
                const top = Math.min(shapeStartY, pointer.y);

                if (activeTool === Tool.LINE || activeTool === Tool.ARROW) {
                    activeShape.set({ x2: pointer.x, y2: pointer.y } as any);
                } else if (activeTool === Tool.CIRCLE) {
                    activeShape.set({ rx: absW / 2, ry: absH / 2, left, top } as any);
                } else if (activeTool === Tool.DIAMOND || activeTool === Tool.STAR) {
                    // Rebuild polygon with correct-size points
                    canvas.remove(activeShape);
                    const pts = activeTool === Tool.DIAMOND
                        ? makeDiamondPoints(absW, absH)
                        : makeStarPoints(absW, absH);
                    activeShape = new Polygon(pts, { ...baseProps(), left, top });
                    canvas.add(activeShape);
                } else {
                    // Rectangle, Triangle
                    activeShape.set({ left, top, width: absW, height: absH });
                }
                canvas.requestRenderAll();
                return;
            }

            if (isDragging) {
                const vpt = canvas.viewportTransform!;
                vpt[4] += evt.clientX - lastPosX;
                vpt[5] += evt.clientY - lastPosY;
                canvas.requestRenderAll();
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        };

        const onMouseDown = (opt: any) => {
            setPaletteOpen(false); // Close tool palette on interaction
            const evt = opt.e;

            // Shape tools: start drawing
            if (shapeTool.includes(activeTool)) {
                const pointer = canvas.getPointer(evt);
                isDrawingShape = true;
                shapeStartX = pointer.x;
                shapeStartY = pointer.y;
                activeShape = createShapePreview(pointer.x, pointer.y);
                if (activeShape) canvas.add(activeShape);
                return;
            }

            // Object eraser: start drag-to-erase
            if (activeTool === Tool.OBJECT_ERASER) {
                isObjectErasing = true;
                objectsErased = false;
                // Also erase whatever is under the cursor right now
                const target = canvas.findTarget(evt);
                if (target) {
                    canvas.remove(target);
                    canvas.requestRenderAll();
                    objectsErased = true;
                }
                return;
            }

            if (activeTool === Tool.HAND || evt.altKey) {
                isDragging = true;
                canvas.selection = false;
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
                canvas.defaultCursor = 'grabbing';
            } else if (activeTool === Tool.TEXT) {
                // Create a premium Textbox at click position — auto-enter editing
                const pointer = canvas.getPointer(evt);
                const textbox = new Textbox('', {
                    left: pointer.x,
                    top: pointer.y,
                    width: 200,
                    fontSize: 20,
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    fill: strokeColor,
                    backgroundColor: 'transparent',
                    stroke: 'transparent',
                    strokeWidth: 0,
                    borderColor: 'transparent',
                    editingBorderColor: 'rgba(99, 102, 241, 0.4)',
                    cursorColor: strokeColor,
                    padding: 8,
                    splitByGrapheme: true,
                });
                canvas.add(textbox);
                canvas.setActiveObject(textbox);

                // canvas.add() already fires object:added — no need to fire again

                setTimeout(() => {
                    textbox.enterEditing();
                    canvas.requestRenderAll();
                }, 50);
                useCanvasStore.getState().setTool(Tool.SELECT);
            } else if (activeTool === Tool.STICKY_NOTE) {
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
                canvas.defaultCursor = 'grabbing';
            }
        };

        const onMouseUp = () => {
            // Finish object eraser drag
            if (isObjectErasing) {
                isObjectErasing = false;
                if (objectsErased) {
                    pushState(JSON.stringify(canvas.toJSON()));
                    saveCanvas(boardId!, canvas.toJSON());
                    // Removed objects already fired 'object:removed' via canvas.remove()
                    // But we ensure persist state is pushed.
                    objectsErased = false;
                }
                return;
            }

            // Finish shape drawing
            if (isDrawingShape && activeShape) {
                isDrawingShape = false;
                activeShape.set({ selectable: true, evented: true });
                activeShape.setCoords();
                canvas.setActiveObject(activeShape);
                canvas.requestRenderAll();
                pushState(JSON.stringify(canvas.toJSON()));
                saveCanvas(boardId!, canvas.toJSON());

                // canvas.add() already fired object:added — trigger modified for final props
                canvas.fire('object:modified', { target: activeShape });

                activeShape = null;
                // Stay on same shape tool for quick repeated drawing
                return;
            }

            isDragging = false;
            if (activeTool === Tool.HAND) {
                canvas.defaultCursor = 'grab';
            } else if (activeTool !== Tool.ERASER) {
                canvas.selection = activeTool === Tool.SELECT;
                canvas.defaultCursor = 'default';
            }
        };

        const onSelectionChange = (e: any) => {
            if (e.selected && e.selected.length === 1) {
                setSelectedObject(e.selected[0]);
            } else {
                setSelectedObject(null);
            }
            setCanDelete(true);
        };

        const onSelectionCleared = () => {
            setSelectedObject(null);
            setCanDelete(false);
        };

        // Attach Listeners
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:up', onMouseUp);
        canvas.on('selection:created', onSelectionChange);
        canvas.on('selection:updated', onSelectionChange);
        canvas.on('selection:cleared', onSelectionCleared);

        // Cleanup
        return () => {
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:down', onMouseDown);
            canvas.off('mouse:up', onMouseUp);
            canvas.off('selection:created', onSelectionChange);
            canvas.off('selection:updated', onSelectionChange);
            canvas.off('selection:cleared', onSelectionCleared);
        };
    }, [activeTool, strokeColor, saveCanvas, sendCursorPosition]);

    // Actions
    const handleDelete = useCallback(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            // Delete selected objects
            canvas.discardActiveObject();
            isRemoteSyncRef.current = true;
            activeObjects.forEach((obj) => canvas.remove(obj));
            isRemoteSyncRef.current = false;
        } else {
            // No selection — clear entire canvas
            const allObjects = canvas.getObjects();
            if (!allObjects.length) return;
            isRemoteSyncRef.current = true; // Prevent individual object:removed events during clear
            canvas.clear();
            isRemoteSyncRef.current = false;
            // Emit canvas-cleared to sync with other boards
            const sock = socketClient.getSocket();
            if (sock?.connected) {
                sock.emit('canvas-cleared', { boardId });
            }
        }

        pushState(JSON.stringify(canvas.toJSON()));
        saveCanvas(boardId!, canvas.toJSON());
        setCanDelete(false);
    }, [saveCanvas, pushState]);

    // Handle Keyboard Shortcuts (Delete, Undo, Redo)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input is focused
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                handleDelete();
            }

            // Undo (Ctrl+Z)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                useHistoryStore.getState().undo();
            }

            // Redo (Ctrl+Y or Ctrl+Shift+Z)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                useHistoryStore.getState().redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDelete]);

    const handleDownload = useCallback(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        // Tweak background for export
        const originalBg = canvas.backgroundColor;
        // Use the store's background color (or default white if transparent)
        // If backgroundColor is transparent, we probably want white for JPG? Or the 'Grid' color.
        // User asked for "background board image".
        canvas.backgroundColor = backgroundColor === 'transparent' ? '#ffffff' : backgroundColor;

        try {
            const dataURL = canvas.toDataURL({
                format: 'jpeg',
                quality: 0.9,
                multiplier: 2, // Retinat/High-res
                enableRetinaScaling: true
            });

            const link = document.createElement('a');
            link.download = `creative-board-${boardData?.title || 'export'}.jpg`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Board downloaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to download board");
        } finally {
            // Restore
            canvas.backgroundColor = originalBg;
            canvas.requestRenderAll();
        }
    }, [boardData, backgroundColor]);



    return (
        <div className="flex flex-col h-screen overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-slate-600">Loading Canvas...</span>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0F111A] text-white">
                    <div className="text-center space-y-6 max-w-md p-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${error.type === '403' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                            {error.type === '403' ? <Lock size={40} /> : <AlertTriangle size={40} />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                {error.type === '403' ? 'Access Denied' : error.type === '404' ? 'Board Not Found' : 'Something went wrong'}
                            </h1>
                            <p className="text-gray-400">
                                {error.message}
                            </p>
                            {error.type === '403' && (
                                <p className="text-sm text-gray-500 mt-4 bg-white/5 p-3 rounded-lg border border-white/10">
                                    Tip: Ask the board owner to set "General Access" to
                                    <span className="text-primary font-medium"> "Anyone with an account"
                                    </span> or invite you by email.
                                </p>
                            )}
                        </div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all"
                        >
                            <ArrowLeft size={18} /> Go to Dashboard
                        </Link>
                    </div>
                </div>
            )}

            <CanvasNavbar
                boardId={boardId!}
                title={boardData?.title || 'Untitled Board'}
                status={saveStatus}
                isConnected={isConnected}
            />

            <div className="flex-1 relative overflow-hidden" ref={containerRef}>
                <GridBackground canvasRef={fabricRef as any} />
                <CursorsLayer boardId={boardId!} canvasRef={containerRef} />

                <canvas ref={canvasRef} />

                <ColorPickerPill />
                <Toolbar
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    canDelete={canDelete}
                />
                <ZoomControls />
                <StickyNoteMenu canvas={fabricRef.current} selectedObject={selectedObject} />
            </div>
        </div>
    );
};
