import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',

    // Enable Turbopack configuration (empty config to silence warnings)
    turbopack: {},

    // Compiler options
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Allow API calls to the FastAPI backend
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NEXT_PUBLIC_API_URL
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
                    : 'http://localhost:8000/api/:path*',
            },
        ];
    },

    // Headers for CORS and security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },

    // Transpile packages if needed
    transpilePackages: [],

    // Image optimization (updated for Next.js 16)
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;