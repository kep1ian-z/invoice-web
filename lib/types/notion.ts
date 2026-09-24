import type { Quote, QuoteStatus } from "@/lib/types/quote";

// Notion 데이터베이스 원시 속성 타입. 속성 키와 Notion 속성 타입, 「상태」옵션값,
// 「항목」하위 DB 구조 모두 실제 DB 스키마 조회 결과로 확정되었다.

// Notion 속성 타입별 원시 응답 형태 (필요한 필드만 정의)
interface NotionRichText {
    plain_text: string;
}

interface NotionTitleProperty {
    type: "title";
    title: NotionRichText[];
}

interface NotionRichTextProperty {
    type: "rich_text";
    rich_text: NotionRichText[];
}

interface NotionStatusProperty {
    type: "status";
    status: { name: QuoteStatus } | null;
}

interface NotionFormulaNumberProperty {
    type: "formula";
    formula: { type: "number"; number: number | null };
}

interface NotionNumberProperty {
    type: "number";
    number: number | null;
}

interface NotionDateProperty {
    type: "date";
    date: { start: string; end: string | null } | null;
}

interface NotionRelationProperty {
    type: "relation";
    relation: { id: string }[];
}

export interface NotionQuoteProperties {
    /** 견적서 번호 (title) → quoteNumber */
    "견적서 번호": NotionTitleProperty;
    /** 클라이언트명 (rich_text) → clientName */
    "클라이언트명": NotionRichTextProperty;
    /** 상태 (status) → status. 옵션: 대기 / 거절 / 승인 */
    "상태": NotionStatusProperty;
    /** 총 금액 (number) → totalAmount */
    "총 금액": NotionNumberProperty;
    /** 발행일 (date) → issuedAt */
    "발행일": NotionDateProperty;
    /** 유효기간 (date) → validUntil */
    "유효기간": NotionDateProperty;
    /** 항목 (relation) → lineItems. 하위 DB 페이지 ID 목록이며 별도 조회가 필요하다 */
    "항목": NotionRelationProperty;
}

// 「항목」relation이 가리키는 하위 DB의 원시 속성 (양방향 relation인 Invoices는 생략)
export interface NotionLineItemProperties {
    /** 항목명 (title) → itemName */
    "항목명": NotionTitleProperty;
    /** 수량 (number) → quantity */
    "수량": NotionNumberProperty;
    /** 단가 (number, 원화) → unitPrice */
    "단가": NotionNumberProperty;
    /** 금액 (formula: 수량 * 단가) → subtotal */
    "금액": NotionFormulaNumberProperty;
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
