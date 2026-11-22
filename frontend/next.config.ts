import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "images.unsplash.com",
  //     },
  //     {
  //       protocol: "https",
  //       hostname: "images.pexels.com",
  //     },
  //   ],
  // },
  images: {
  unoptimized: true,
},
}

export default nextConfig
