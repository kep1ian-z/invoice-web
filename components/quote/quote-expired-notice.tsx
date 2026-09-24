import { ClockAlertIcon } from "lucide-react";

import { formatDate } from "@/lib/format";
import type { Quote } from "@/lib/types/quote";

interface QuoteExpiredNoticeProps {
    validUntil: NonNullable<Quote["validUntil"]>;
}

// 유효기간이 지난 견적서 상단에 보여주는 안내. 내용은 그대로 열람할 수 있고 안내만 한다.
export function QuoteExpiredNotice({ validUntil }: QuoteExpiredNoticeProps) {
    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
            <ClockAlertIcon className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="space-y-1">
                <p className="font-medium">유효기간이 지난 견적서입니다</p>
                <p className="text-muted-foreground break-keep">
                    이 견적서는 {formatDate(validUntil)}까지 유효했습니다. 금액과 조건이 변경되었을
                    수 있으니 진행 전에 담당자에게 확인해 주세요.
                </p>
            </div>
        </div>
    );
}
