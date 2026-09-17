import type { Quote } from "@/lib/types/quote";

// Notion 데이터베이스 원시 속성 타입. docs/PRD.md 6장의 "예상 매핑"을 기준으로 한
// 임시 타입이며, 실제 속성명·타입은 아직 확인되지 않았다 (docs/PRD.md 12장 Q1).
// Notion 스키마가 확정되면 각 필드의 속성명 주석을 실제 값으로 갱신해야 한다.

export interface NotionQuoteLineItemProperty {
    /** Notion 속성명 예상: "품목" — 확인 필요 */
    itemName: string;
    /** Notion 속성명 예상: "단가" — 확인 필요 */
    unitPrice: number;
    /** Notion 속성명 예상: "수량" — 확인 필요 */
    quantity: number;
}

export interface NotionQuoteProperties {
    /** Notion 속성명 예상: "클라이언트명" — 확인 필요 */
    clientName: string;
    /** Notion 속성명 예상: "항목/품목" — 확인 필요 (relation 또는 하위 테이블일 가능성) */
    lineItems: NotionQuoteLineItemProperty[];
    /** Notion 속성명 예상: "합계" — 확인 필요 */
    totalAmount: number;
    /** Notion 속성명 예상: "유효기간" — 확인 필요 */
    validUntil: string;
    /** Notion 속성명 예상: "상태" — 확인 필요 (게시 여부 판단 기준) */
    status: string;
}

// Notion 원시 속성을 내부 Quote 타입으로 변환한다.
// slug는 Notion 속성이 아니라 게시 시점에 별도로 발급되는 값이므로 인자로 분리했다
// (docs/PRD.md F2: 예측 불가능한 고유 링크 발급).
// 구현은 Phase 3 Notion 연동 Task에서 진행하며, 여기서는 타입 시그니처만 정의한다.
export function mapNotionPropertiesToQuote(
    slug: string,
    properties: NotionQuoteProperties
): Quote {
    throw new Error("not implemented");
}
