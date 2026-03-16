/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false
    }

    return config
  },
}

export default nextConfig
