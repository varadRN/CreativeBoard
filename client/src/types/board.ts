export interface Board {
    id: string;
    title: string;
    backgroundColor: string;
    gridType: string;
    canvasData?: any;
    createdById: string;
    isStarred: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    permission?: 'owner' | 'viewer' | 'editor';
    createdBy?: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
}
