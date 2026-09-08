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
};

export default nextConfig;
