import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-500 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors w-full justify-center"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
