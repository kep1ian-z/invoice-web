import type { QuoteStatus } from "@/lib/types/quote";

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
    /** 페이지 조회 시 relation은 최대 25개까지만 반환되며, 초과 시 true */
    has_more?: boolean;
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

// 변환 함수(mapNotionPropertiesToQuote)는 lib/notion/mapper.ts에 구현되어 있다.
