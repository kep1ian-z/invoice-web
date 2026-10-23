"use client";

import { useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface QuoteDownloadButtonProps {
    slug: string;
}

// Content-Disposition 헤더에서 파일명(RFC 5987 filename*)을 꺼낸다. 없으면 기본 이름을 쓴다.
function parseFileName(contentDisposition: string | null): string {
    const encoded = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];

    if (!encoded) {
        return "견적서.pdf";
    }

    try {
        return decodeURIComponent(encoded);
    } catch {
        return "견적서.pdf";
    }
}

// PDF 다운로드 버튼. 서버가 생성한 PDF를 받아 저장하고, 진행 중에는 비활성화한다.
export function QuoteDownloadButton({ slug }: QuoteDownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    // PDF를 요청해 blob으로 받은 뒤 브라우저 다운로드를 트리거한다
    const handleClick = async () => {
        setIsDownloading(true);

        try {
            const response = await fetch(`/quotes/${slug}/pdf`);

            if (!response.ok) {
                throw new Error(`PDF 요청 실패: ${response.status}`);
            }

            const blob = await response.blob();
            const fileName = parseFileName(response.headers.get("Content-Disposition"));
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = objectUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(objectUrl);
        } catch {
            toast.error("PDF를 다운로드하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            type="button"
            onClick={handleClick}
            disabled={isDownloading}
            aria-busy={isDownloading}
            className="print:hidden"
        >
            {isDownloading ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
                <DownloadIcon data-icon="inline-start" aria-hidden="true" />
            )}
            {isDownloading ? "PDF 생성 중..." : "PDF 다운로드"}
        </Button>
    );
}
