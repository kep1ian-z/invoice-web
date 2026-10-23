import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 서버 전용 PDF 렌더링 패키지는 번들링하지 않고 Node에서 그대로 로드한다
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
