var config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#6C5CE7',
                'primary-hover': '#5B4BD5',
                accent: '#4F46E5',
                'accent-light': '#4F86E5',
                'canvas-bg': '#1A1F36',
                'dark-bg': '#0F0D1A',
                'dark-surface': '#1E1B2E',
                'dark-border': 'rgba(255, 255, 255, 0.1)',
                success: '#22C55E',
                warning: '#F59E0B',
                error: '#EF4444',
            },
            boxShadow: {
                toolbar: '0 4px 24px rgba(0, 0, 0, 0.12)',
                modal: '0 25px 50px rgba(0, 0, 0, 0.25)',
                'glow-purple': '0 0 20px rgba(108, 92, 231, 0.3)',
            },
        },
    },
    plugins: [],
};
export default config;
