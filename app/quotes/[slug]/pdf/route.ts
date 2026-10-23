import { logger } from "@/lib/logger";
import { buildContentDisposition, buildPdfFileName } from "@/lib/pdf-filename";
import { renderQuotePdf } from "@/lib/pdf/render-quote-pdf";
import { getPublishedQuote } from "@/lib/quote-access";

// 서버리스 환경에서 Chromium 기동과 렌더링에 필요한 시간을 확보한다(초)
export const maxDuration = 30;

// 견적서 PDF 다운로드. 승인(게시)된 견적서만 허용하고 그 외는 404를 반환한다.
export async function GET(request: Request, ctx: RouteContext<"/quotes/[slug]/pdf">) {
    const { slug } = await ctx.params;

    try {
        const quote = await getPublishedQuote(slug);

        if (!quote) {
            return new Response("견적서를 찾을 수 없습니다.", { status: 404 });
        }

        // 웹 화면과 동일한 상세 페이지를 인쇄 모드로 렌더한다
        const pageUrl = new URL(`/quotes/${slug}`, request.url).toString();
        const pdf = await renderQuotePdf(pageUrl);

        return new Response(Buffer.from(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": buildContentDisposition(buildPdfFileName(quote)),
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        logger.error({ slug, err: error }, "견적서 PDF 생성 실패");

        return new Response("PDF를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.", {
            status: 500,
        });
    }
}
