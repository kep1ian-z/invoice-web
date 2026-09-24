import { APIErrorCode, isNotionClientError } from "@notionhq/client";
import { unstable_cache } from "next/cache";

import { logger } from "@/lib/logger";
import { createNotionClient, getNotionDatabaseId } from "@/lib/notion/client";
import { fetchQuoteFromPage } from "@/lib/notion/mapper";
import type { Quote } from "@/lib/types/quote";

// 견적서 캐시 재검증 주기(초). Notion 수정이 최대 이 시간 안에 반영된다.
const QUOTE_REVALIDATE_SECONDS = 60;

// Notion 페이지 ID 형식(하이픈 유무와 관계없이 32자리 hex)
const NOTION_ID_PATTERN = /^[0-9a-f]{32}$/;

// Notion ID를 하이픈 없는 소문자 32자리로 정규화한다. 형식이 아니면 null.
function normalizeNotionId(value: string): string | null {
    const normalized = value.replaceAll("-", "").toLowerCase();

    return NOTION_ID_PATTERN.test(normalized) ? normalized : null;
}

// 페이지가 우리 견적서 DB 소속이고 휴지통에 없는지 확인한다.
// 통합(Integration)에 공유된 다른 페이지가 ID만으로 노출되는 것을 막기 위한 검사다.
function isQuotePage(page: unknown, databaseId: string): boolean {
    if (typeof page !== "object" || page === null) {
        return false;
    }

    const { object, parent, in_trash: inTrash } = page as Record<string, unknown>;

    if (object !== "page" || inTrash === true) {
        return false;
    }

    if (typeof parent !== "object" || parent === null) {
        return false;
    }

    const parentDatabaseId = (parent as Record<string, unknown>).database_id;

    return (
        typeof parentDatabaseId === "string" &&
        normalizeNotionId(parentDatabaseId) === normalizeNotionId(databaseId)
    );
}

// Notion에서 견적서를 조회한다. 없거나 우리 DB 소속이 아니면 null.
// 「미존재」는 null로, 그 외 Notion 오류는 그대로 던져 오류 경계에서 처리한다.
async function fetchQuoteFromNotion(pageId: string): Promise<Quote | null> {
    const notionClient = createNotionClient();

    try {
        const page = await notionClient.pages.retrieve({ page_id: pageId });

        if (!isQuotePage(page, getNotionDatabaseId())) {
            logger.warn({ pageId }, "우리 견적서 DB 소속이 아닌 페이지 접근 시도");
            return null;
        }

        return await fetchQuoteFromPage(notionClient, pageId, page);
    } catch (error) {
        if (isNotionClientError(error) && error.code === APIErrorCode.ObjectNotFound) {
            return null;
        }

        logger.error({ pageId, err: error }, "Notion 견적서 조회 실패");
        throw error;
    }
}

// Notion 응답은 slug(페이지 ID)별로 캐시한다. 오류는 캐시되지 않는다.
const getCachedQuote = unstable_cache(fetchQuoteFromNotion, ["quote-by-slug"], {
    revalidate: QUOTE_REVALIDATE_SECONDS,
    tags: ["quotes"],
});

// 견적서 조회의 단일 접점. slug는 Notion 페이지 ID이며, 형식이 다르면 Notion을 호출하지 않는다.
export async function getQuoteBySlug(slug: string): Promise<Quote | null> {
    const pageId = normalizeNotionId(slug);

    if (!pageId) {
        return null;
    }

    return getCachedQuote(pageId);
}
