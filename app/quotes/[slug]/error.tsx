"use client";

import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// 견적서 조회 중 Notion 오류 등 예기치 못한 문제가 생겼을 때 보여주는 안내 화면.
// 「존재하지 않는 링크」(not-found)와 구분해 잠시 후 다시 시도하도록 안내한다.
export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            <Card className="mx-auto max-w-md text-center">
                <CardContent className="flex flex-col items-center gap-4 py-6">
                    <TriangleAlertIcon
                        className="size-10 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">견적서를 불러오지 못했습니다</h1>
                        <p className="text-muted-foreground break-keep">
                            일시적인 문제일 수 있습니다. 잠시 후 다시 시도해 주세요.
                        </p>
                    </div>
                    <Button onClick={reset}>다시 시도</Button>
                </CardContent>
            </Card>
        </div>
    );
}
