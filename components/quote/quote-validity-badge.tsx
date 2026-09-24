import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Quote } from "@/lib/types/quote";

interface QuoteValidityBadgeProps {
    validUntil: Quote["validUntil"];
}

type ValidityState = "valid" | "expiring" | "expired";

const DAY_MS = 24 * 60 * 60 * 1000;

// 임박으로 표시할 남은 일수. 표시 전용 임시 기준이며 만료 정책(PRD 12장)과는 무관하다.
const EXPIRING_SOON_DAYS = 7;

// 유효기간 상태에 따른 배지 스타일과 문구 (색상 외에 텍스트로도 상태를 전달한다)
const validityConfig = {
    valid: { variant: "outline", label: "유효" },
    expiring: { variant: "secondary", label: "유효기간 임박" },
    expired: { variant: "destructive", label: "유효기간 경과" },
} as const satisfies Record<
    ValidityState,
    { variant: "outline" | "secondary" | "destructive"; label: string }
>;

// 한국 시간 기준 오늘 날짜(YYYY-MM-DD)를 반환한다.
function getTodayInSeoul(): string {
    return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

// 유효기간까지 남은 일수로 표시 상태를 계산한다. 접근 차단과는 무관한 표시 전용 로직이다.
function getValidityState(validUntil: string): ValidityState {
    const remainingDays =
        (Date.parse(validUntil.slice(0, 10)) - Date.parse(getTodayInSeoul())) / DAY_MS;

    if (remainingDays < 0) {
        return "expired";
    }
    if (remainingDays <= EXPIRING_SOON_DAYS) {
        return "expiring";
    }
    return "valid";
}

// 유효기간 배지 (유효/임박/경과). 유효기간 값이 없으면 '유효기간 미정'으로 표시한다.
export function QuoteValidityBadge({ validUntil }: QuoteValidityBadgeProps) {
    const formattedDate = formatDate(validUntil);

    if (!validUntil || !formattedDate) {
        return <Badge variant="outline">유효기간 미정</Badge>;
    }

    const { variant, label } = validityConfig[getValidityState(validUntil)];

    return (
        <Badge variant={variant}>
            {label} · {formattedDate}까지
        </Badge>
    );
}
