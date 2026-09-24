// Phase 2 UI 개발용 더미 견적서 데이터.
// Phase 3(Task 005)에서 Notion 페칭으로 교체할 때 이 파일의 조회 함수만 바꾸면 되도록
// 페이지/컴포넌트는 getMockQuoteBySlug를 단일 접점으로 사용한다.
// slug 값은 더미일 뿐이며 실제 발급 규칙을 정하지 않는다.

import type { Quote, QuoteLineItem } from "@/lib/types/quote";

const DAY_MS = 24 * 60 * 60 * 1000;

// 현재 시점 기준 상대 날짜를 ISO 문자열(YYYY-MM-DD)로 만든다.
// 시간이 지나도 임박/경과 케이스의 의미가 유지되도록 고정 날짜 대신 사용한다.
function daysFromNow(days: number): string {
    return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

// 항목명/단가/수량으로 라인 아이템을 만든다 (subtotal = 단가 x 수량).
function createLineItem(
    itemName: string,
    unitPrice: number,
    quantity: number
): QuoteLineItem {
    return { itemName, unitPrice, quantity, subtotal: unitPrice * quantity };
}

// 라인 아이템 subtotal 합계를 계산한다.
function sumSubtotals(lineItems: QuoteLineItem[]): number {
    return lineItems.reduce((sum, item) => sum + item.subtotal, 0);
}

const websiteItems = [
    createLineItem("웹사이트 기획 및 설계", 1500000, 1),
    createLineItem("UI/UX 디자인", 2000000, 1),
    createLineItem("프론트엔드 개발", 80000, 40),
    createLineItem("유지보수 (월)", 300000, 3),
];

const brandingItems = [
    createLineItem("브랜드 아이덴티티 디자인", 2500000, 1),
    createLineItem("로고 시안 추가", 300000, 2),
];

const maintenanceItems = [
    createLineItem("서버 운영 및 모니터링 (월)", 450000, 6),
    createLineItem("긴급 장애 대응 (건)", 200000, 2),
];

const campaignItems = [
    createLineItem("캠페인 랜딩페이지 제작", 1800000, 1),
    createLineItem("배너 디자인", 150000, 5),
];

const consultingItems = [
    createLineItem("시스템 진단 컨설팅", 600000, 2),
    createLineItem("개선안 보고서", 900000, 1),
];

const dataItems = [
    createLineItem("데이터 이관 작업", 70000, 20),
    createLineItem("이관 검수", 500000, 1),
];

export const mockQuotes: Quote[] = [
    // 승인 (정상): 유효기간이 넉넉하게 남은 게시 견적서
    {
        slug: "d3f7a91c-approved-demo",
        quoteNumber: "Q-2026-001",
        clientName: "주식회사 오로라",
        status: "승인",
        totalAmount: sumSubtotals(websiteItems),
        issuedAt: daysFromNow(-5),
        validUntil: daysFromNow(25),
        lineItems: websiteItems,
        isPublished: true,
    },
    // 대기: 아직 승인되지 않아 게시되지 않는다
    {
        slug: "8b21e5d0-pending-demo",
        quoteNumber: "Q-2026-002",
        clientName: "블루웨이브 스튜디오",
        status: "대기",
        totalAmount: sumSubtotals(brandingItems),
        issuedAt: daysFromNow(-2),
        validUntil: daysFromNow(28),
        lineItems: brandingItems,
        isPublished: false,
    },
    // 거절: 게시되지 않는다
    {
        slug: "5c9a03b7-rejected-demo",
        quoteNumber: "Q-2026-003",
        clientName: "한빛상사",
        status: "거절",
        totalAmount: sumSubtotals(maintenanceItems),
        issuedAt: daysFromNow(-10),
        validUntil: daysFromNow(20),
        lineItems: maintenanceItems,
        isPublished: false,
    },
    // 승인 + 유효기간 임박: 만료가 3일 남은 케이스
    {
        slug: "a47e6f12-expiring-demo",
        quoteNumber: "Q-2026-004",
        clientName: "그린리프 코퍼레이션",
        status: "승인",
        totalAmount: sumSubtotals(campaignItems),
        issuedAt: daysFromNow(-27),
        validUntil: daysFromNow(3),
        lineItems: campaignItems,
        isPublished: true,
    },
    // 승인 + 유효기간 경과: 이미 만료된 케이스
    {
        slug: "e90b34a8-expired-demo",
        quoteNumber: "Q-2026-005",
        clientName: "미래테크",
        status: "승인",
        totalAmount: sumSubtotals(consultingItems),
        issuedAt: daysFromNow(-45),
        validUntil: daysFromNow(-15),
        lineItems: consultingItems,
        isPublished: true,
    },
    // 승인 + 총 금액 없음: Notion에서 totalAmount가 비어 있는 케이스
    {
        slug: "2f68c5d9-noamount-demo",
        quoteNumber: "Q-2026-006",
        clientName: "노바 파트너스",
        status: "승인",
        totalAmount: null,
        issuedAt: daysFromNow(-1),
        validUntil: daysFromNow(29),
        lineItems: dataItems,
        isPublished: true,
    },
];

// slug로 더미 견적서를 조회한다. 없으면 undefined를 반환한다.
export function getMockQuoteBySlug(slug: string): Quote | undefined {
    return mockQuotes.find((quote) => quote.slug === slug);
}
