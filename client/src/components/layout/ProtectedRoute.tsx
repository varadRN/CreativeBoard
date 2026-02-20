import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen } from '../shared/LoadingScreen';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, getMe } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        // If we're not authenticated and not loading, try to prompt a check if needed,
        // but usually getMe is called in Providers.tsx. 
        // Here we mainly rely on the store state.
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        // If trying to join via share link or public board URL, save it to persist through registration flow
        if (location.pathname.startsWith('/share/join/') || location.pathname.startsWith('/board/')) {
            localStorage.setItem('pending_share_url', location.pathname + location.search + location.hash);
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
