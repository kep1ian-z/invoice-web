// 견적서 웹 뷰어의 핵심 도메인 타입. Notion에서 가져온 데이터를 화면에 표시하기 전
// 내부적으로 사용하는 정규화된 형태다 (docs/PRD.md 6장 필드 매핑 참고).

export interface QuoteLineItem {
    itemName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface Quote {
    slug: string;
    clientName: string;
    lineItems: QuoteLineItem[];
    totalAmount: number;
    validUntil: string;
    isPublished: boolean;
}

// 링크 접근 시 판단해야 하는 상태 (docs/PRD.md F5: 잘못된/만료된 링크 처리)
export type QuoteLinkStatus = "valid" | "not_found" | "expired";
