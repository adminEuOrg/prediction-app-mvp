import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出配置（兼容 Cloudflare Pages 免费版）
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@supabase/supabase-js"],
  },
};

export default nextConfig;
