import { Server, Socket } from 'socket.io';

export const handleCanvas = (io: Server, socket: Socket) => {
    const userId = socket.data.user?.id;

    socket.on('element-added', (data: { boardId: string, element: any }) => {
        console.log(`[SERVER] element-added: Board ${data.boardId}, User ${userId}, Type ${data.element?.type}, ID ${data.element?.id}`);
        if (!data.boardId) return;
        socket.to(data.boardId).emit('element-added', {
            element: data.element,
            userId
        });
        console.log(`[SERVER] Broadcasted element-added to room ${data.boardId}`);
    });

    socket.on('element-modified', (data: { boardId: string, element: any }) => {
        if (!data.boardId) return;
        socket.to(data.boardId).emit('element-modified', {
            element: data.element,
            userId
        });
    });

    socket.on('canvas-update', (data: { boardId: string, canvasData: any }) => {
        if (!data.boardId) return;
        socket.to(data.boardId).emit('canvas-update', {
            canvasData: data.canvasData,
            userId
        });
    });

    socket.on('element-removed', (data: { boardId: string, elementId: string }) => {
        if (!data.boardId) return;
        socket.to(data.boardId).emit('element-removed', {
            elementId: data.elementId,
            userId
        });
    });

    socket.on('canvas-cleared', (data: { boardId: string }) => {
        if (!data.boardId) return;
        socket.to(data.boardId).emit('canvas-cleared', {
            userId
        });
    });
};
