/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Production optimizations
    poweredByHeader: false, // Remove X-Powered-By header for security
    compress: true, // Enable gzip compression

    // Image optimization (for future use)
    images: {
        domains: [], // Add external image domains here if needed
        formats: ['image/webp', 'image/avif'],
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                ],
            },
        ];
    },

    // TypeScript strict mode
    typescript: {
        // Fail build on type errors
        ignoreBuildErrors: false,
    },

    // ESLint configuration
    eslint: {
        // Fail build on lint errors in production
        ignoreDuringBuilds: false,
    },
};

module.exports = nextConfig;
