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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
};

export default nextConfig;
