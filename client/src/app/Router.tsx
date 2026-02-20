import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LoadingScreen } from '../components/shared/LoadingScreen';

// --- Default Imports (No curly braces) ---
import LandingPage from '../pages/marketing/LandingPage';
import NotFoundPage from '../pages/marketing/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Lazy load heavy application pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const BoardPage = lazy(() => import('../pages/board/BoardPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage'));
const EmailVerifiedPage = lazy(() => import('../pages/auth/EmailVerifiedPage'));
const ShareJoinPage = lazy(() => import('../pages/dashboard/ShareJoinPage'));

export const MainRouter = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
                    }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/verify-email-success" element={<EmailVerifiedPage />} />

                {/* Share Routes (Join via token) */}
                <Route
                    path="/share/join/:token"
                    element={<Navigate to="/dashboard?join=true" replace />}
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard/*"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/board/:boardId"
                    element={
                        <ProtectedRoute>
                            <BoardPage />
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};