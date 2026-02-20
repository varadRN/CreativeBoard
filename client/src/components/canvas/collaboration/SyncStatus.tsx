import { Cloud, Loader2, AlertTriangle } from 'lucide-react';

interface SyncStatusProps {
    status: 'saved' | 'saving' | 'offline';
}

export const SyncStatus = ({ status }: SyncStatusProps) => {
    if (status === 'saving') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
        );
    }

    if (status === 'offline') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-orange-500">
                <AlertTriangle className="w-3 h-3" /> Offline
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1.5 text-xs text-green-600">
            <Cloud className="w-3 h-3" /> Saved
        </span>
    );
};
