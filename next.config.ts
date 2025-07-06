import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.sanity.io",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "img.clerk.com",
                pathname: "/**",
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "7mb",
        },
    },
};

export default nextConfig;
