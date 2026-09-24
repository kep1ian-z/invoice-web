// 견적서 화면에서 공통으로 사용하는 포맷 유틸.

const wonFormatter = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
});

// 금액을 원화 문자열로 변환한다 (예: 1234000 -> "₩1,234,000")
export function formatWon(amount: number): string {
    return wonFormatter.format(amount);
}

// ISO 날짜 문자열을 한국어 날짜로 변환한다 (예: "2026-09-24" -> "2026년 9월 24일").
// 값이 없거나 유효하지 않으면 null을 반환한다.
export function formatDate(iso: string | null): string | null {
    if (!iso) {
        return null;
    }

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return dateFormatter.format(date);
}
