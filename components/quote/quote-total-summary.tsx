import { Card, CardContent } from "@/components/ui/card";
import { formatWon } from "@/lib/format";
import type { Quote } from "@/lib/types/quote";

interface QuoteTotalSummaryProps {
    totalAmount: Quote["totalAmount"];
}

// 견적서 합계 요약. 총 금액이 없으면 '금액 미정'으로 표시한다.
export function QuoteTotalSummary({ totalAmount }: QuoteTotalSummaryProps) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">총 금액</span>
                <span className="text-xl font-semibold tabular-nums sm:text-2xl">
                    {totalAmount === null ? "금액 미정" : formatWon(totalAmount)}
                </span>
            </CardContent>
        </Card>
    );
}
