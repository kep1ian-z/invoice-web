import { Client } from "@notionhq/client";

import { logger } from "@/lib/logger";

// 필수 환경변수를 읽고, 누락되면 어떤 키가 비었는지 알려주는 오류를 던진다.
function getRequiredEnv(key: "NOTION_API_KEY" | "NOTION_DATABASE_ID"): string {
    const value = process.env[key];

    if (!value) {
        logger.error({ key }, "Notion 환경변수가 설정되지 않았습니다");
        throw new Error(`환경변수 ${key}가 설정되지 않았습니다 (.env.local 확인)`);
    }

    return value;
}

// Notion 클라이언트를 만든다. 토큰이 NEXT_PUBLIC 접두사 없이 서버에서만 읽히므로
// 이 모듈은 서버 컴포넌트/서버 코드에서만 import해야 한다.
export function createNotionClient(): Client {
    return new Client({ auth: getRequiredEnv("NOTION_API_KEY") });
}

// 견적서가 저장된 Notion 데이터베이스 ID를 반환한다.
export function getNotionDatabaseId(): string {
    return getRequiredEnv("NOTION_DATABASE_ID");
}
