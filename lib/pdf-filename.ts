import type { Quote } from "@/lib/types/quote";

// 파일명에 쓸 수 없는 문자(Windows/macOS/URL 예약 문자와 제어 문자)
const INVALID_FILENAME_CHARS = /[\\/:*?"<>|\u0000-\u001f]/g;

// 발행일(ISO)을 한국시간 기준 YYYY-MM-DD로 변환한다. 값이 없거나 유효하지 않으면 null.
function formatIssuedDate(iso: string | null): string | null {
    if (!iso) {
        return null;
    }

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    // sv-SE 로캘이 YYYY-MM-DD 형식을 반환한다
    return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(date);
}

// PDF 파일명을 만든다: 견적서_{클라이언트명}_{발행일 YYYY-MM-DD}.pdf (발행일이 없으면 날짜 생략)
export function buildPdfFileName(quote: Pick<Quote, "clientName" | "issuedAt">): string {
    const clientName =
        quote.clientName.replace(INVALID_FILENAME_CHARS, "").replace(/\s+/g, " ").trim() ||
        "견적서";
    const issuedDate = formatIssuedDate(quote.issuedAt);
    const baseName = issuedDate ? `견적서_${clientName}_${issuedDate}` : `견적서_${clientName}`;

    return `${baseName}.pdf`;
}

// Content-Disposition 헤더 값을 만든다. 한글 파일명은 RFC 5987 filename*로 인코딩하고,
// 구형 클라이언트를 위해 ASCII 대체 이름(filename)도 함께 보낸다.
export function buildContentDisposition(fileName: string): string {
    const asciiFallback = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
    const encoded = encodeURIComponent(fileName).replace(
        /['()*]/g,
        (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
    );

    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
