import { useCollaborationStore } from '@/stores/collaborationStore';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const ConnectionBadge = () => {
    const { connectionStatus } = useCollaborationStore();

    const getStatusConfig = () => {
        switch (connectionStatus) {
            case 'connected':
                return { label: 'Live', color: 'bg-green-500', icon: Wifi };
            case 'connecting':
            case 'reconnecting':
                return { label: 'Reconnecting...', color: 'bg-orange-500', icon: Loader2, animate: true };
            case 'disconnected':
                return { label: 'Offline', color: 'bg-red-500', icon: WifiOff };
            default:
                return { label: 'Unknown', color: 'bg-gray-400', icon: WifiOff };
        }
    };

    const { label, color, icon: Icon, animate } = getStatusConfig();

    return (
        <div className="relative group cursor-help">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                <div className={cn("w-2 h-2 rounded-full", color)} />
                {animate ? (
                    <Icon className="w-3 h-3 animate-spin" />
                ) : (
                    <Icon className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{label}</span>
            </div>

            {/* Status Tooltip */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {connectionStatus === 'connected' && "Real-time collaboration active"}
                {(connectionStatus === 'connecting' || connectionStatus === 'reconnecting') && "Escaping the matrix..."}
                {connectionStatus === 'disconnected' && "Disconnected from server. Changes are saved locally."}
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 rotate-45" />
            </div>
        </div>
    );
};
