import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { getQuoteValidityState } from "@/lib/quote-validity";
import type { Quote } from "@/lib/types/quote";

interface QuoteValidityBadgeProps {
    validUntil: Quote["validUntil"];
}

// 유효기간 상태에 따른 배지 스타일과 문구 (색상 외에 텍스트로도 상태를 전달한다)
const validityConfig = {
    valid: { variant: "outline", label: "유효" },
    expiring: { variant: "secondary", label: "유효기간 임박" },
    expired: { variant: "destructive", label: "유효기간 경과" },
} as const;

// 유효기간 배지 (유효/임박/경과). 유효기간 값이 없으면 '유효기간 미정'으로 표시한다.
export function QuoteValidityBadge({ validUntil }: QuoteValidityBadgeProps) {
    const formattedDate = formatDate(validUntil);
    const state = getQuoteValidityState(validUntil);

    if (state === "unset" || !formattedDate) {
        return <Badge variant="outline">유효기간 미정</Badge>;
    }

    const { variant, label } = validityConfig[state];

    return (
        <Badge variant={variant}>
            {label} · {formattedDate}까지
        </Badge>
    );
}
