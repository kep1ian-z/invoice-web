import { ClockAlertIcon, FileXIcon, HouseIcon, MailIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuoteLinkStatus } from "@/lib/types/quote";

// 오류 안내 변형. 정상 링크(valid)는 오류 화면이 필요 없어 제외한다.
type QuoteLinkErrorVariant = Exclude<QuoteLinkStatus, "valid">;

interface QuoteLinkErrorProps {
    variant: QuoteLinkErrorVariant;
}

// 변형별 아이콘과 안내 문구
const errorContent = {
    not_found: {
        icon: FileXIcon,
        title: "견적서를 찾을 수 없습니다",
        description: "링크가 올바르지 않거나 존재하지 않는 견적서입니다. 주소를 다시 확인해 주세요.",
    },
    expired: {
        icon: ClockAlertIcon,
        title: "만료된 링크입니다",
        description: "이 견적서 링크는 더 이상 사용할 수 없습니다. 새 링크가 필요하면 문의해 주세요.",
    },
} as const satisfies Record<
    QuoteLinkErrorVariant,
    { icon: typeof FileXIcon; title: string; description: string }
>;

// 잘못되었거나 만료된 링크 접근 시 보여주는 안내 화면.
// expired 변형은 UI 시안이며 만료 정책이 확정되기 전까지 라우팅에는 연결하지 않는다.
export function QuoteLinkError({ variant }: QuoteLinkErrorProps) {
    const { icon: Icon, title, description } = errorContent[variant];

    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            <Card className="mx-auto max-w-md text-center">
                <CardContent className="flex flex-col items-center gap-4 py-6">
                    <Icon className="size-10 text-muted-foreground" aria-hidden="true" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-muted-foreground break-keep">{description}</p>
                    </div>

                    {/* 문의 연락처: PRD 미확정 값이라 플레이스홀더로 둔다 */}
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                        <MailIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-muted-foreground">문의:</span>
                        {/* TODO: 실제 문의 연락처 값 반영 (PRD 확정 후) */}
                        <span>연락처 준비 중</span>
                    </div>

                    <Button nativeButton={false} render={<Link href="/" />}>
                        <HouseIcon data-icon="inline-start" aria-hidden="true" />
                        홈으로 돌아가기
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
