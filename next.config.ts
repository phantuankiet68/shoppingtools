import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: false,

    allowedDevOrigins: [
        'kbuilder.io.vn',
        'https://kbuilder.io.vn',
        '112.213.88.148',
        'sitea.kbuilder.vn',
        'http://sitea.kbuilder.vn',
    ],

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
};

export default nextConfig;
