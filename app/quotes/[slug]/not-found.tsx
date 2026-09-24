import { QuoteLinkError } from "@/components/quote/quote-link-error";

// 존재하지 않거나 게시되지 않은 견적서 링크 접근 시 표시되는 안내 페이지
export default function NotFound() {
    return <QuoteLinkError variant="not_found" />;
}
