import { logger } from "@/lib/logger";

// PDF 생성용 내부 렌더링임을 알리는 쿼리 값(?source=pdf). 이 요청은 열람 이력에서 제외한다.
export const PDF_RENDER_SOURCE = "pdf";

// 견적서 열람 이력(F8)을 로그로 남긴다. 수집 항목은 열람 일시와 slug뿐이며,
// IP·기기 정보 등 개인정보는 기록하지 않는다 (docs/PRD.md 12장 Q7 확정 사항).
// 로깅 실패가 페이지 렌더를 막지 않도록 오류는 삼키고 경고만 남긴다.
export function logQuoteView(slug: string): void {
    try {
        logger.info({ event: "quote_view", slug, viewedAt: new Date().toISOString() }, "견적서 열람");
    } catch (error) {
        logger.warn({ err: error }, "견적서 열람 이력 기록 실패");
    }
}
