// 견적서 웹 뷰어의 핵심 도메인 타입. Notion에서 가져온 데이터를 화면에 표시하기 전
// 내부적으로 사용하는 정규화된 형태다 (docs/PRD.md 6장 필드 매핑 참고).
// 최상위 속성은 실제 Notion DB 스키마로 확정되었다 (lib/types/notion.ts 참고).

// Notion 「상태」(status) 옵션값. 「승인」일 때만 게시된다.
export type QuoteStatus = "대기" | "거절" | "승인";

// 라인 아이템: 「항목」(relation) 하위 DB의 항목명/단가/수량/금액(formula)에 대응한다.
export interface QuoteLineItem {
    itemName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface Quote {
    /** Notion 속성이 아닌 게시 시점에 별도 발급되는 고유 링크 값 */
    slug: string;
    /** Notion 「견적서 번호」(title) */
    quoteNumber: string;
    /** Notion 「클라이언트명」(rich_text) */
    clientName: string;
    /** Notion 「상태」(status)의 옵션 이름 */
    status: QuoteStatus;
    /** Notion 「총 금액」(number). 값이 비어 있을 수 있어 null 허용 */
    totalAmount: number | null;
    /** Notion 「발행일」(date), ISO 문자열. 값이 비어 있을 수 있어 null 허용 */
    issuedAt: string | null;
    /** Notion 「유효기간」(date), ISO 문자열. 값이 비어 있을 수 있어 null 허용 */
    validUntil: string | null;
    /** Notion 「항목」(relation) 하위 DB에서 조회한 라인 아이템 */
    lineItems: QuoteLineItem[];
    /** 게시 여부. status가 「승인」일 때만 true */
    isPublished: boolean;
}

// 링크 접근 시 판단해야 하는 상태 (docs/PRD.md F5: 잘못된/만료된 링크 처리)
export type QuoteLinkStatus = "valid" | "not_found" | "expired";
