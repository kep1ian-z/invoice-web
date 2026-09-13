# 견적서 웹 뷰어 (Invoice Web)

Notion에 입력한 견적서 데이터를 클라이언트가 로그인 없이 웹에서 열람하고, 동일한
내용을 PDF로 다운로드할 수 있도록 제공하는 전용 웹 뷰어입니다. 상세 요구사항은
[`docs/PRD.md`](./docs/PRD.md)를 참고하세요.

## 기술 스택

- Next.js 16 (App Router) / React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui (base-nova 스타일)

## 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 환경 변수

`.env.example`을 복사해 `.env.local`을 만들고 실제 값을 채워주세요. Notion 연동
방식(실시간 조회 vs 스냅샷)과 스키마가 아직 확정되지 않았으므로, 변수 목록은
`docs/PRD.md`의 결정 사항에 따라 추가될 수 있습니다.

```bash
cp .env.example .env.local
```

## 주요 명령어

- `npm run dev` — 개발 서버 실행
- `npm run build` — 프로덕션 빌드
- `npm run start` — 프로덕션 서버 실행
- `npm run lint` — ESLint 검사

## 화면 구성

- 견적서 상세 페이지: 고유 링크(slug)로 접근하는 견적서 열람 및 PDF 다운로드 화면
- 링크 오류 페이지: 잘못되었거나 만료된 링크 접근 시 표시되는 안내 화면

작성자용 게시/관리 화면은 별도로 만들지 않으며, Notion을 그대로 사용합니다.

## 참고 문서

- [`AGENTS.md`](./AGENTS.md) — 이 저장소의 Next.js 버전은 표준과 다른 부분이 있어
  작업 전 `node_modules/next/dist/docs/`의 관련 문서를 확인해야 합니다.
- [`docs/PRD.md`](./docs/PRD.md) — 기능 요구사항, 데이터 연동 방식, 확인이 필요한
  오픈 이슈 목록.
