import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0F0D1A] flex items-center justify-center p-4">
                    <div className="bg-[#1A1F36] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">
                            The application encountered an unexpected error.
                        </p>
                        <div className="bg-black/30 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40">
                            <code className="text-red-400 text-xs font-mono">
                                {this.state.error?.message}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl transition-colors font-medium"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
