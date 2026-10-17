import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/savings",
        destination: "/groups",
        permanent: false,
      },
      {
        source: "/savings/:path*",
        destination: "/groups",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
