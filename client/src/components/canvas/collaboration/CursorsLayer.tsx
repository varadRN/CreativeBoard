import { useCursors } from '@/hooks/collaboration/useCursors';
import { UserCursor } from './UserCursor';

interface CursorsLayerProps {
    boardId: string;
    canvasRef: React.RefObject<any>; // Just for getting container bounds if needed
}

export const CursorsLayer = ({ boardId, canvasRef }: CursorsLayerProps) => {
    const { cursors } = useCursors(boardId, canvasRef);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {Object.values(cursors).map((cursor) => (
                <UserCursor
                    key={cursor.userId}
                    x={cursor.x}
                    y={cursor.y}
                    userName={cursor.userName}
                    color={cursor.color}
                />
            ))}
        </div>
    );
};
