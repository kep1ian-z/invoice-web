import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 서버 전용 PDF 렌더링 패키지는 번들링하지 않고 Node에서 그대로 로드한다
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // @sparticuz/chromium은 bin/*.br 바이너리를 코드가 아닌 경로로 읽어 Next의 파일 추적이 놓치므로
  // PDF 라우트 배포 함수에 직접 포함시킨다 (누락 시 Vercel에서 "bin does not exist" 오류)
  outputFileTracingIncludes: {
    "/quotes/\\[slug\\]/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
