import { getQuoteBySlug } from "@/lib/quotes";
import type { Quote } from "@/lib/types/quote";

// 열람 가능한(승인·게시된) 견적서만 반환한다. 없거나 게시되지 않았으면 null.
// 상세 페이지와 PDF 라우트가 같은 기준을 쓰도록 모아둔 접근 판정 헬퍼다.
export async function getPublishedQuote(slug: string): Promise<Quote | null> {
    const quote = await getQuoteBySlug(slug);

    if (!quote || !quote.isPublished) {
        return null;
    }

    return quote;
}
