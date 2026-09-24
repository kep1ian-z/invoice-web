import type { Quote } from "@/lib/types/quote";

// 유효기간 상태. 값이 없으면 unset.
export type QuoteValidityState = "unset" | "valid" | "expiring" | "expired";

const DAY_MS = 24 * 60 * 60 * 1000;

// 임박으로 표시할 남은 일수
const EXPIRING_SOON_DAYS = 7;

// 한국 시간 기준 오늘 날짜(YYYY-MM-DD)를 반환한다.
function getTodayInSeoul(): string {
    return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

// 유효기간으로 상태를 판정한다. 유효기간 당일까지는 유효하며, 만료돼도 열람은 막지 않고 안내만 한다.
// 배지와 만료 안내가 같은 기준을 쓰도록 이 함수 하나로 판정한다.
export function getQuoteValidityState(validUntil: Quote["validUntil"]): QuoteValidityState {
    if (!validUntil) {
        return "unset";
    }

    const remainingDays =
        (Date.parse(validUntil.slice(0, 10)) - Date.parse(getTodayInSeoul())) / DAY_MS;

    if (Number.isNaN(remainingDays)) {
        return "unset";
    }
    if (remainingDays < 0) {
        return "expired";
    }
    if (remainingDays <= EXPIRING_SOON_DAYS) {
        return "expiring";
    }
    return "valid";
}
