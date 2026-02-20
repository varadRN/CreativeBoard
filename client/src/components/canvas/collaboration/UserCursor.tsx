import { MousePointer2 } from 'lucide-react';

interface UserCursorProps {
    x: number;
    y: number;
    userName: string;
    color: string;
}

export const UserCursor = ({ x, y, userName, color }: UserCursorProps) => {
    return (
        <div
            className="absolute pointer-events-none transition-all duration-100 ease-linear z-50 flex flex-col items-start"
            style={{
                transform: `translate(${x}px, ${y}px)`,
                left: 0,
                top: 0
            }}
        >
            <MousePointer2
                className="w-5 h-5 fill-current"
                style={{ color: color }}
            />
            <div
                className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm whitespace-nowrap"
                style={{ backgroundColor: color }}
            >
                {userName}
            </div>
        </div>
    );
};
