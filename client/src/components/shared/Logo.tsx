import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

export const Logo = ({ className, size = 'md' }: LogoProps) => {
    return (
        <div className={cn("relative flex items-center justify-center", sizeMap[size], className)}>
            <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-sm"
            >
                <defs>
                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>

                {/* Board Body */}
                <rect
                    x="2"
                    y="4"
                    width="28"
                    height="24"
                    rx="4"
                    fill="url(#logo-gradient)"
                />

                {/* Screen Area */}
                <rect
                    x="4"
                    y="6"
                    width="24"
                    height="20"
                    rx="2"
                    fill="#0F172A"
                    fillOpacity="0.4"
                />

                {/* Creative Line / Drawing */}
                <path
                    d="M8 18C10 14 14 14 16 16C18 18 22 18 24 14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                />

                {/* Stylus / Pen */}
                <path
                    d="M22 10L26 6L28 8L24 12L22 10Z"
                    fill="white"
                />
                <path
                    d="M22 10L21 13L24 12"
                    fill="#E2E8F0"
                />
            </svg>
        </div>
    );
};
