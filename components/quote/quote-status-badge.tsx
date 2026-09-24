import { Badge } from "@/components/ui/badge";
import type { Quote } from "@/lib/types/quote";

interface QuoteStatusBadgeProps {
    status: Quote["status"];
}

// 상태별 배지 스타일 매핑. 색상만으로 구분하지 않도록 상태 텍스트를 항상 함께 표시한다.
const statusVariantMap = {
    승인: "default",
    대기: "secondary",
    거절: "destructive",
} as const satisfies Record<Quote["status"], "default" | "secondary" | "destructive">;

// 견적서 상태(대기/거절/승인) 배지
export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
    return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
}
