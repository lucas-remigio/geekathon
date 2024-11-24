/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false // Disable React Strict Mode
}

module.exports = nextConfig

module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true
      }
    ]
  }
}
