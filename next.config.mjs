/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
