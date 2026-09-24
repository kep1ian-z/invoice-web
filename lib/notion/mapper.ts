import type { Client } from "@notionhq/client";

import { logger } from "@/lib/logger";
import type {
    NotionLineItemProperties,
    NotionQuoteProperties,
} from "@/lib/types/notion";
import type { Quote, QuoteLineItem, QuoteStatus } from "@/lib/types/quote";

// Notion 응답 → 내부 Quote 변환 모듈.
// SDK 응답은 unknown으로 취급하고 타입 가드로 좁혀 lib/types/notion.ts의 원시 타입을 만든다.
// 스키마 변경(PRD 11장)이 생기면 어떤 속성이 문제인지 오류 메시지에 드러나도록 한다.

// 항목 조회 시 기본 동시 요청 수. Notion 평균 제한(3req/s)에 맞춘다.
const DEFAULT_LINE_ITEM_CONCURRENCY = 3;

const QUOTE_STATUSES: readonly QuoteStatus[] = ["대기", "거절", "승인"];

// 속성 매핑 실패 오류. 문제가 된 속성명을 함께 보관한다.
export class NotionMappingError extends Error {
    readonly propertyName: string;

    constructor(propertyName: string, message: string) {
        super(message);
        this.name = "NotionMappingError";
        this.propertyName = propertyName;
    }
}

// 오류를 logger.error로 기록하고 던질 오류 객체를 반환한다. 값(개인정보)은 기록하지 않는다.
function createMappingError(
    propertyName: string,
    message: string,
    context: Record<string, unknown> = {}
): NotionMappingError {
    logger.error({ propertyName, ...context }, message);
    return new NotionMappingError(propertyName, message);
}

// 일반 객체(null/배열 제외) 여부를 판별하는 타입 가드
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 값의 타입을 오류 메시지용 문자열로 표현한다.
function describeType(value: unknown): string {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
}

// 페이지 응답에서 properties 객체를 꺼낸다. 부분 응답(권한 부족 등)이면 오류를 던진다.
function getPageProperties(
    page: unknown,
    context: string
): Record<string, unknown> {
    if (!isRecord(page) || !isRecord(page.properties)) {
        throw createMappingError(
            "properties",
            `${context}: 응답에 properties가 없습니다 (부분 응답이거나 통합 권한 확인 필요)`
        );
    }
    return page.properties;
}

// 속성 하나를 꺼내 존재 여부와 Notion 속성 타입을 검증한다.
function getTypedProperty(
    properties: Record<string, unknown>,
    key: string,
    expectedType: string,
    context: string
): Record<string, unknown> {
    const property = properties[key];

    if (!isRecord(property)) {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"이(가) 없습니다 (Notion DB 스키마 변경 확인)`
        );
    }
    if (property.type !== expectedType) {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 타입이 다릅니다 (기대: ${expectedType}, 실제: ${describeType(property.type)}/${String(property.type)})`,
            { expectedType, actualType: property.type }
        );
    }
    return property;
}

// rich text 배열 검증 (plain_text만 사용)
function parseRichTextArray(
    value: unknown,
    key: string,
    context: string
): { plain_text: string }[] {
    if (!Array.isArray(value)) {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 텍스트 값이 배열이 아닙니다 (${describeType(value)})`
        );
    }
    return value.map((item: unknown) => {
        if (!isRecord(item) || typeof item.plain_text !== "string") {
            throw createMappingError(
                key,
                `${context}: 속성 "${key}"의 텍스트 항목에 plain_text가 없습니다`
            );
        }
        return { plain_text: item.plain_text };
    });
}

// title 속성 파싱
function parseTitle(
    properties: Record<string, unknown>,
    key: string,
    context: string
): { type: "title"; title: { plain_text: string }[] } {
    const property = getTypedProperty(properties, key, "title", context);
    return {
        type: "title",
        title: parseRichTextArray(property.title, key, context),
    };
}

// rich_text 속성 파싱
function parseRichText(
    properties: Record<string, unknown>,
    key: string,
    context: string
): { type: "rich_text"; rich_text: { plain_text: string }[] } {
    const property = getTypedProperty(properties, key, "rich_text", context);
    return {
        type: "rich_text",
        rich_text: parseRichTextArray(property.rich_text, key, context),
    };
}

// 숫자(null 허용) 검증
function parseNullableNumber(
    value: unknown,
    key: string,
    context: string
): number | null {
    if (value === null) return null;
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 숫자 값이 올바르지 않습니다 (${describeType(value)})`
        );
    }
    return value;
}

// number 속성 파싱
function parseNumber(
    properties: Record<string, unknown>,
    key: string,
    context: string
): { type: "number"; number: number | null } {
    const property = getTypedProperty(properties, key, "number", context);
    return {
        type: "number",
        number: parseNullableNumber(property.number, key, context),
    };
}

// formula(number) 속성 파싱. formula 결과 타입이 number가 아니면 오류
function parseFormulaNumber(
    properties: Record<string, unknown>,
    key: string,
    context: string
): { type: "formula"; formula: { type: "number"; number: number | null } } {
    const property = getTypedProperty(properties, key, "formula", context);
    const formula = property.formula;

    if (!isRecord(formula) || formula.type !== "number") {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 formula 결과 타입이 number가 아닙니다`
        );
    }
    return {
        type: "formula",
        formula: {
            type: "number",
            number: parseNullableNumber(formula.number, key, context),
        },
    };
}

// date 속성 파싱. 값이 비어 있으면 date는 null
function parseDate(
    properties: Record<string, unknown>,
    key: string,
    context: string
): { type: "date"; date: { start: string; end: string | null } | null } {
    const property = getTypedProperty(properties, key, "date", context);
    const date = property.date;

    if (date === null) return { type: "date", date: null };

    if (!isRecord(date) || typeof date.start !== "string") {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 날짜 값 형식이 올바르지 않습니다`
        );
    }
    const end = date.end;
    if (end !== null && end !== undefined && typeof end !== "string") {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 종료일 형식이 올바르지 않습니다`
        );
    }
    return { type: "date", date: { start: date.start, end: end ?? null } };
}

// QuoteStatus 여부를 판별하는 타입 가드
function isQuoteStatus(value: unknown): value is QuoteStatus {
    return QUOTE_STATUSES.some((status) => status === value);
}

// status 속성 파싱. 정의되지 않은 옵션이면 오류 (옵션 추가/이름 변경 감지)
function parseStatus(
    properties: Record<string, unknown>,
    key: string,
    context: string
): { type: "status"; status: { name: QuoteStatus } | null } {
    const property = getTypedProperty(properties, key, "status", context);
    const status = property.status;

    if (status === null) return { type: "status", status: null };

    if (!isRecord(status) || !isQuoteStatus(status.name)) {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 옵션이 정의된 값(${QUOTE_STATUSES.join("/")})이 아닙니다`
        );
    }
    return { type: "status", status: { name: status.name } };
}

// relation 속성 파싱. Notion은 페이지 조회 시 relation을 최대 25개까지만 주므로
// has_more가 true이면 항목이 누락되므로 오류로 처리한다.
function parseRelation(
    properties: Record<string, unknown>,
    key: string,
    context: string
): { type: "relation"; relation: { id: string }[]; has_more?: boolean } {
    const property = getTypedProperty(properties, key, "relation", context);

    if (!Array.isArray(property.relation)) {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 relation 값이 배열이 아닙니다`
        );
    }
    if (property.has_more === true) {
        throw createMappingError(
            key,
            `${context}: 속성 "${key}"의 relation이 25개를 초과해 일부 항목이 잘렸습니다 (페이지네이션 미구현)`
        );
    }
    const relation = property.relation.map((item: unknown) => {
        if (!isRecord(item) || typeof item.id !== "string") {
            throw createMappingError(
                key,
                `${context}: 속성 "${key}"의 relation 항목에 id가 없습니다`
            );
        }
        return { id: item.id };
    });
    return { type: "relation", relation };
}

// 견적서 페이지 응답을 원시 속성 타입으로 좁힌다.
export function parseQuoteProperties(page: unknown): NotionQuoteProperties {
    const context = "견적서 페이지";
    const properties = getPageProperties(page, context);

    return {
        "견적서 번호": parseTitle(properties, "견적서 번호", context),
        "클라이언트명": parseRichText(properties, "클라이언트명", context),
        "상태": parseStatus(properties, "상태", context),
        "총 금액": parseNumber(properties, "총 금액", context),
        "발행일": parseDate(properties, "발행일", context),
        "유효기간": parseDate(properties, "유효기간", context),
        "항목": parseRelation(properties, "항목", context),
    };
}

// 항목 페이지 응답을 원시 속성 타입으로 좁힌다.
export function parseLineItemProperties(
    page: unknown,
    pageId: string
): NotionLineItemProperties {
    const context = `항목 페이지(${pageId})`;
    const properties = getPageProperties(page, context);

    return {
        "항목명": parseTitle(properties, "항목명", context),
        "수량": parseNumber(properties, "수량", context),
        "단가": parseNumber(properties, "단가", context),
        "금액": parseFormulaNumber(properties, "금액", context),
    };
}

// rich text 배열을 하나의 문자열로 합친다.
function joinPlainText(richTexts: { plain_text: string }[]): string {
    return richTexts.map((item) => item.plain_text).join("");
}

// 항목 원시 속성을 QuoteLineItem으로 변환한다.
// 수량/단가/금액이 비어 있으면 임의 계산으로 대체하지 않고 오류로 처리한다.
export function mapNotionLineItem(
    properties: NotionLineItemProperties,
    pageId: string
): QuoteLineItem {
    const context = `항목 페이지(${pageId})`;
    const quantity = properties["수량"].number;
    const unitPrice = properties["단가"].number;
    const subtotal = properties["금액"].formula.number;

    if (quantity === null) {
        throw createMappingError("수량", `${context}: 「수량」 값이 비어 있습니다`);
    }
    if (unitPrice === null) {
        throw createMappingError("단가", `${context}: 「단가」 값이 비어 있습니다`);
    }
    if (subtotal === null) {
        throw createMappingError(
            "금액",
            `${context}: 「금액」(formula) 결과가 비어 있습니다 (수량*단가로 대체하지 않음)`
        );
    }

    return {
        itemName: joinPlainText(properties["항목명"].title),
        unitPrice,
        quantity,
        subtotal,
    };
}

// 견적서 원시 속성을 내부 Quote로 변환한다.
// slug는 Notion 속성이 아니라 게시 시점에 별도 발급되는 값이며(docs/PRD.md F2),
// lineItems는 「항목」relation을 별도 조회(fetchLineItems)한 결과를 호출부가 넘긴다.
// 이렇게 하면 이 함수가 순수 동기 함수로 유지되어 네트워크 없이 테스트할 수 있다.
export function mapNotionPropertiesToQuote(
    slug: string,
    properties: NotionQuoteProperties,
    lineItems: QuoteLineItem[]
): Quote {
    const quoteNumber = joinPlainText(properties["견적서 번호"].title).trim();
    const clientName = joinPlainText(properties["클라이언트명"].rich_text).trim();

    // 견적서 번호/클라이언트명이 비면 화면에 빈 견적서를 노출하지 않도록 오류 처리
    if (quoteNumber === "") {
        throw createMappingError("견적서 번호", "견적서 번호(title)가 비어 있습니다");
    }
    if (clientName === "") {
        throw createMappingError("클라이언트명", "클라이언트명(rich_text)이 비어 있습니다");
    }

    // 상태가 비어 있으면 안전하게 「대기」(비게시)로 취급한다.
    const statusName = properties["상태"].status?.name;
    if (statusName === undefined) {
        logger.warn({ propertyName: "상태" }, "상태가 비어 있어 「대기」(비게시)로 처리합니다");
    }
    const status: QuoteStatus = statusName ?? "대기";

    return {
        slug,
        quoteNumber,
        clientName,
        status,
        totalAmount: properties["총 금액"].number,
        issuedAt: properties["발행일"].date?.start ?? null,
        validUntil: properties["유효기간"].date?.start ?? null,
        lineItems,
        isPublished: status === "승인",
    };
}

// 항목 배열을 동시성 제한을 두고 순서를 유지하며 병렬 처리한다.
async function mapWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    task: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array<R>(items.length);
    let nextIndex = 0;
    let failed = false;

    // 워커 하나: 남은 항목이 있는 동안 하나씩 가져와 처리한다.
    async function worker(): Promise<void> {
        while (!failed && nextIndex < items.length) {
            const currentIndex = nextIndex++;
            try {
                results[currentIndex] = await task(items[currentIndex]);
            } catch (error) {
                failed = true;
                throw error;
            }
        }
    }

    const workerCount = Math.max(1, Math.min(limit, items.length));
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
}

// 「항목」relation의 페이지 ID들을 병렬 조회해 QuoteLineItem[]으로 변환한다.
// 레이트리밋(평균 3req/s)을 넘지 않도록 동시 요청 수를 제한하고, relation 순서를 유지한다.
export async function fetchLineItems(
    notionClient: Client,
    relationIds: readonly string[],
    concurrency: number = DEFAULT_LINE_ITEM_CONCURRENCY
): Promise<QuoteLineItem[]> {
    return mapWithConcurrency(relationIds, concurrency, async (pageId) => {
        try {
            const page = await notionClient.pages.retrieve({ page_id: pageId });
            const properties = parseLineItemProperties(page, pageId);
            return mapNotionLineItem(properties, pageId);
        } catch (error) {
            if (!(error instanceof NotionMappingError)) {
                logger.error({ pageId, err: error }, "항목 페이지 조회에 실패했습니다");
            }
            throw error;
        }
    });
}

// 견적서 페이지 응답 하나를 항목 조회까지 포함해 Quote로 변환하는 편의 함수.
export async function fetchQuoteFromPage(
    notionClient: Client,
    slug: string,
    page: unknown
): Promise<Quote> {
    const properties = parseQuoteProperties(page);
    const relationIds = properties["항목"].relation.map((item) => item.id);
    const lineItems = await fetchLineItems(notionClient, relationIds);
    return mapNotionPropertiesToQuote(slug, properties, lineItems);
}
