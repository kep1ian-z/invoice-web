"use client";

import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// PDF 다운로드 버튼 (UI 전용). 실제 PDF 생성은 이후 Phase에서 구현하며 지금은 안내 토스트만 표시한다.
export function QuoteDownloadButton() {
    // TODO: PDF 생성/다운로드 로직 구현 (이후 Phase)
    const handleClick = () => {
        toast.info("PDF 다운로드는 준비 중입니다.");
    };

    return (
        <Button type="button" onClick={handleClick}>
            <DownloadIcon data-icon="inline-start" aria-hidden="true" />
            PDF 다운로드
        </Button>
    );
}
