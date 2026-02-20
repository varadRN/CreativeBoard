import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { LoadingScreen } from '../components/shared/LoadingScreen';

interface ProvidersProps {
    children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
    const { getMe, isLoading } = useAuthStore();

    useEffect(() => {
        // Check auth status on mount
        getMe();
    }, [getMe]);

    // Optionally show loading screen here for the entire app init
    // But usually we let Router handle it via ProtectedRoute for protected pages.
    // However, preventing flash of "Landing Page" if actually logged in is nice.

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <BrowserRouter>
            {children}
            <Toaster
                position="top-right"
                richColors
                theme="dark"
                closeButton
                toastOptions={{
                    style: { background: '#18181b', border: '1px solid #27272a', color: '#fff' }
                }}
            />
        </BrowserRouter>
    );
};
