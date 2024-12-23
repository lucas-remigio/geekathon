/** @type {import('next').NextConfig} */

// next.config.js
const nextConfig = {
  reactStrictMode: false // Disable React Strict Mode
}

module.exports = nextConfig

module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/subjects',
        permanent: true
      }
    ]
  }
}
