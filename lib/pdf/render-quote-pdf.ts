import { existsSync } from "node:fs";

import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

import { logger } from "@/lib/logger";

// 로컬 개발용 브라우저 후보 경로. 환경변수 PDF_BROWSER_PATH가 있으면 그것을 우선한다.
const LOCAL_BROWSER_PATHS = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
];

// 페이지 로딩 제한 시간(ms). Vercel 함수 maxDuration 안에 끝나야 한다.
const PAGE_LOAD_TIMEOUT_MS = 20_000;

// 실행 환경에 맞는 브라우저를 띄운다. Vercel(서버리스)은 경량 Chromium, 로컬은 설치된 Chrome/Edge를 쓴다.
async function launchBrowser(): Promise<Browser> {
    if (process.env.VERCEL) {
        return puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
        });
    }

    const executablePath =
        process.env.PDF_BROWSER_PATH ?? LOCAL_BROWSER_PATHS.find((path) => existsSync(path));

    if (!executablePath) {
        throw new Error(
            "PDF 생성용 브라우저를 찾을 수 없습니다. PDF_BROWSER_PATH 환경변수에 Chrome/Edge 경로를 지정하세요.",
        );
    }

    return puppeteer.launch({ executablePath, headless: true });
}

// 상세 페이지(pageUrl)를 인쇄 모드로 렌더해 PDF 바이트로 반환한다.
// 웹 화면과 같은 페이지를 그대로 렌더하므로 내용·순서·금액이 동일하다.
export async function renderQuotePdf(pageUrl: string): Promise<Uint8Array> {
    const browser = await launchBrowser();

    try {
        const page = await browser.newPage();

        // 다크모드와 무관하게 항상 라이트 테마의 인쇄용 레이아웃으로 출력한다
        await page.emulateMediaType("print");
        await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);

        await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: PAGE_LOAD_TIMEOUT_MS });
        await page.evaluate(() => document.fonts.ready);

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" },
        });

        logger.debug({ pageUrl, bytes: pdf.byteLength }, "견적서 PDF 생성 완료");

        return pdf;
    } finally {
        await browser.close();
    }
}
