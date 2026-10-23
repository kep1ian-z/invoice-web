import { notFound } from "next/navigation";

import { QuoteExpiredNotice } from "@/components/quote/quote-expired-notice";
import { QuoteDownloadButton } from "@/components/quote/quote-download-button";
import { QuoteLineItemsTable } from "@/components/quote/quote-line-items-table";
import { QuoteStatusBadge } from "@/components/quote/quote-status-badge";
import { QuoteTotalSummary } from "@/components/quote/quote-total-summary";
import { QuoteValidityBadge } from "@/components/quote/quote-validity-badge";
import { formatDate } from "@/lib/format";
import { getQuoteValidityState } from "@/lib/quote-validity";
import { getPublishedQuote } from "@/lib/quote-access";

// 견적서 상세 페이지. 승인된(게시된) 견적서만 표시하고 그 외에는 not-found로 보낸다.
export default async function Page(props: PageProps<"/quotes/[slug]">) {
    const { slug } = await props.params;

    // 조회·게시 판정은 PDF 라우트와 공유하는 헬퍼에 모아둔다 (slug는 Notion 페이지 ID, 60초 캐시)
    const quote = await getPublishedQuote(slug);

    if (!quote) {
        notFound();
    }

    const issuedDate = formatDate(quote.issuedAt);

    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="space-y-8">
                {/* 유효기간이 지난 견적서는 열람은 허용하고 안내만 표시한다 */}
                {quote.validUntil && getQuoteValidityState(quote.validUntil) === "expired" && (
                    <QuoteExpiredNotice validUntil={quote.validUntil} />
                )}

                {/* 헤더: 견적서 번호, 클라이언트명, 발행일, 상태 */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold">견적서 {quote.quoteNumber}</h1>
                            <QuoteStatusBadge status={quote.status} />
                        </div>
                        <p className="text-muted-foreground">{quote.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                            발행일: {issuedDate ?? "미정"}
                        </p>
                        <QuoteValidityBadge validUntil={quote.validUntil} />
                    </div>
                    <QuoteDownloadButton slug={slug} />
                </header>

                {/* 견적 항목 */}
                <section aria-labelledby="quote-items-heading" className="space-y-3">
                    <h2 id="quote-items-heading" className="text-lg font-semibold">
                        견적 항목
                    </h2>
                    <QuoteLineItemsTable lineItems={quote.lineItems} />
                </section>

                {/* 합계 */}
                <QuoteTotalSummary totalAmount={quote.totalAmount} />
            </div>
        </div>
    );
}
