import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "owbttzijsdqyiarakocm.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/product-images/**",
        search: "",
      },
    ],
    minimumCacheTTL: 86400,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
