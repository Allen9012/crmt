import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 父目录存在无关 lockfile，显式锁定 file tracing 根目录到本项目，避免 Next 误判 workspace root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
