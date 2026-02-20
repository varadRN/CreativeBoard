import { useState, useEffect } from 'react';
import { api } from '@/lib/api'; // Use direct API for local fetch inside modal or move to store
import { Loader2, Copy, Check, UserPlus, X, Globe, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    boardTitle: string;
}

export const ShareModal = ({ isOpen, onClose, boardId, boardTitle }: ShareModalProps) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('viewer');
    const [loading, setLoading] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [publicAccess, setPublicAccess] = useState<'private' | 'view' | 'edit'>('private');

    // Fetch collaborators when modal opens
    useEffect(() => {
        if (isOpen && boardId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [collabRes, boardRes] = await Promise.all([
                        api.get(`/boards/${boardId}/share/collaborators`),
                        api.get(`/boards/${boardId}`)
                    ]);
                    setCollaborators(collabRes.data.data);

                    if (boardRes.data.data.publicAccess) {
                        setPublicAccess(boardRes.data.data.publicAccess);
                    }

                    const baseUrl = window.location.origin;
                    setShareLink(`${baseUrl}/board/${boardId}`);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, boardId]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setInviteLoading(true);
        try {
            await api.post(`/boards/${boardId}/share/invite`, { email, permission });
            toast.success('Invitation sent!');
            setEmail('');
            // Refresh collaborators list
            const res = await api.get(`/boards/${boardId}/share/collaborators`);
            setCollaborators(res.data.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to invite');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleAccessChange = async (newAccess: 'private' | 'view' | 'edit') => {
        try {
            await api.put(`/boards/${boardId}`, { publicAccess: newAccess });
            setPublicAccess(newAccess);
            toast.success('Access settings updated');
        } catch (error) {
            toast.error('Failed to update access settings');
        }
    };

    const handleCopyLink = async () => {
        try {
            let url = '';

            // If board is public (Anyone with account), copy direct link
            if (publicAccess !== 'private') {
                url = `${window.location.origin}/board/${boardId}`;
            } else {
                // If private, generate a unique join token
                const { data } = await api.post(`/boards/${boardId}/share/link`, { permission: 'viewer' });
                const token = data.data.shareToken;
                url = `${window.location.origin}/share/join/${token}`;
            }

            await navigator.clipboard.writeText(url);
            setShareLink(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Link copied to clipboard');
        } catch (error) {
            console.error(error);
            toast.error('Failed to copy link');
        }
    };

    const removeCollaborator = async (userId: string) => {
        try {
            await api.delete(`/boards/${boardId}/share/collaborators/${userId}`);
            setCollaborators(prev => prev.filter(c => c.user.id !== userId));
            toast.success('Collaborator removed');
        } catch (error) {
            toast.error('Failed to remove collaborator');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold truncate max-w-xs" title={boardTitle}>Share "{boardTitle}"</h2>
                            <p className="text-sm text-gray-500">Invite others to collaborate in real-time</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                        {/* Copy Link Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Anyone with the link
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 truncate cursor-not-allowed select-none">
                                    {shareLink || "Click copy to generate link..."}
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Invite Section */}
                        <form onSubmit={handleInvite} className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Invite by email
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                                />
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={!email || inviteLoading}
                                    className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {inviteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invite'}
                                </button>
                            </div>
                        </form>

                        {/* General Access Section */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700">General Access</h3>
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${publicAccess === 'private' ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                                        {publicAccess === 'private' ? <User size={18} /> : <Globe size={18} />}
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <select
                                                value={publicAccess === 'private' ? 'private' : 'public'}
                                                onChange={(e) => handleAccessChange(e.target.value === 'private' ? 'private' : 'view')}
                                                className="bg-transparent text-gray-900 text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-4"
                                            >
                                                <option value="private">Restricted</option>
                                                <option value="public">Anyone with the link</option>
                                            </select>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {publicAccess === 'private'
                                                ? 'Only people invited can access'
                                                : 'Anyone on the internet with the link can access'}
                                        </p>
                                    </div>
                                </div>

                                {publicAccess !== 'private' && (
                                    <select
                                        value={publicAccess}
                                        onChange={(e) => handleAccessChange(e.target.value as 'view' | 'edit')}
                                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                    >
                                        <option value="view">Viewer</option>
                                        <option value="edit">Editor</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Collaborators List */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Collaborators</h3>
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {collaborators.map((c: any) => (
                                        <div key={c.user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {c.user.avatarUrl ? (
                                                    <img src={c.user.avatarUrl} alt={c.user.fullName} className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                                                        {c.user.fullName.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        {c.user.fullName}
                                                        {c.role === 'owner' && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">Owner</span>}
                                                        {c.user.id === c.grantedById && <span className="text-[10px] text-gray-400">(You)</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{c.user.email}</p>
                                                </div>
                                            </div>

                                            {c.role !== 'owner' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 capitalize">{c.role}</span>
                                                    <button
                                                        onClick={() => removeCollaborator(c.user.id)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Owner</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
