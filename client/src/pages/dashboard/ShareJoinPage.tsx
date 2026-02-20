import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ShareJoinPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const attempted = useRef(false);

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token || attempted.current) return;
        attempted.current = true;

        const joinBoard = async () => {
            try {
                const { data } = await api.post(`/share/join/${token}`);

                if (data.success) {
                    setStatus('success');
                    toast.success(data.data.message || 'Joined board successfully');
                    // Small delay to read success message if needed, but immediate is usually better
                    navigate(`/board/${data.data.boardId}`, { replace: true });
                }
            } catch (error: any) {
                console.error(error);
                const msg = error.response?.data?.message || 'Failed to join board';
                setErrorMsg(msg);
                setStatus('error');
                // Do not redirect automatically so user sees the error
            }
        };

        joinBoard();
    }, [token, navigate]);

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F111A] text-white p-4">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold">Unable to Join Board</h2>
                    <p className="text-gray-400">{errorMsg}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-medium transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F111A]">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                <p className="text-gray-400">Joining board...</p>
            </div>
        </div>
    );
};

export default ShareJoinPage;
