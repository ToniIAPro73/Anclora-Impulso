/** @type {import('next').NextConfig} */
const nextConfig = {
  // Eliminamos distDir para que Vercel encuentre la carpeta .next por defecto
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
