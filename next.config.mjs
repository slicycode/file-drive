/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'shiny-panda-139.convex.cloud',
      },
    ],
  },
}

export default nextConfig
