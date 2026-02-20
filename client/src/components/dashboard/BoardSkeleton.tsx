export const BoardSkeleton = () => {
    return (
        <div className="bg-[#1A1F36] rounded-xl overflow-hidden border border-white/5 shadow-sm">
            {/* Thumbnail Skeleton */}
            <div className="h-40 bg-white/5 animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-4">
                {/* Title Line */}
                <div className="h-5 bg-white/10 rounded-md animate-pulse w-3/4" />

                {/* Meta Line */}
                <div className="flex justify-between items-center pt-2">
                    <div className="h-3 bg-white/5 rounded-md animate-pulse w-1/3" />

                    {/* Circle / Avatar Skeleton (User requested 'circle loading') */}
                    <div className="h-6 w-6 bg-white/10 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );
};
