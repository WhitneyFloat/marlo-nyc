/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Anthropic SDK uses Node.js built-ins — must run in Node runtime, not Edge
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
  },

  // Don't expose Next.js version in response headers
  poweredByHeader: false,

  // Strict mode catches subtle React bugs early
  reactStrictMode: true,

  // Fail the build on any ESLint errors (keeps the deploy clean)
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Fail the build on TypeScript errors
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
