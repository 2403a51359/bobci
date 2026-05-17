/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000'
    return [
      {
        source: '/webhook/:path*',
        destination: `${backend}/webhook/:path*`,
      },
    ]
  },
}

module.exports = nextConfig

// Made with Bob
