import { LucideIcon } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

interface BoardEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
}

export const BoardEmptyState = ({ icon: Icon, title, description, actionText, onAction }: BoardEmptyStateProps) => {
    const { theme } = useThemeStore();

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${theme === 'dark' ? 'bg-white/5' : 'bg-indigo-50'}`}>
                <Icon className={`w-8 h-8 transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-indigo-400'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{title}</h3>
            <p className={`max-w-sm mb-8 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>

            {actionText && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
};
