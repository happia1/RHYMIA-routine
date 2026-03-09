import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // public 폴더 이미지를 최적화 없이 그대로 서빙 (routine-icons 등 로드 안정화)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
