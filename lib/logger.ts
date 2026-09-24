import pino from "pino";

// 서버 전용 로거. console.log 대신 사용한다.
// 개발 환경에서는 pino-pretty로 읽기 쉽게 출력하고, 운영 환경에서는 JSON을 표준 출력으로 내보낸다.
const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),
    ...(isDevelopment && {
        transport: {
            target: "pino-pretty",
            options: { colorize: true },
        },
    }),
});
