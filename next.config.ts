import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set API body size limits
  // CSV uploads use formData (not JSON), so the CSV route handles its own size check.
  // This caps all other JSON API bodies at 1 MB.
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
