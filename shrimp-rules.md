# Development Guidelines — invoice-web

## 프로젝트 개요

- **서비스**: 견적서 웹 뷰어 — Notion에 입력한 견적서를 클라이언트가 로그인 없이 웹에서 열람하고 PDF로 다운로드하는 전용 뷰어.
- **스택**: Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS 4 / shadcn/ui(`base-nova` 스타일).
- **핵심 미완 사항**: Notion 연동 방식(실시간 조회 vs 스냅샷), 슬러그(slug) 발급/만료 정책, PDF 렌더링 방식은 아직 미확정 (`docs/PRD.md` 12장 참조). 이 영역을 구현할 때는 반드시 먼저 PRD의 "확인이 필요한 질문"을 사용자에게 확인하거나, 사용자가 이미 결정한 내용이 있는지 대화 맥락에서 확인할 것.

## Next.js 버전 관련 필수 규칙

- **이 저장소의 Next.js(16.3.2)는 표준 버전과 다른 브레이킹 체인지를 포함한다.** App Router 관련 코드(라우팅, 데이터 페칭, 레이아웃, 서버 액션, 캐싱 등)를 작성/수정하기 전에 반드시 `node_modules/next/dist/docs/01-app/` 하위의 관련 문서를 먼저 읽을 것.
- 학습 데이터에 있는 일반적인 Next.js 지식(특히 구버전 API, 폐기된 패턴)에 의존하지 말 것. 문서의 deprecation notice를 반드시 따를 것.
- `AGENTS.md`는 `next dev` 실행 시 자동 재생성되는 파일이다. 내용을 임의로 삭제/수정하지 말고, diff에 포함되면 그대로 커밋할 것.

## 코드 스타일 (프로젝트 고유)

- **들여쓰기**: `app/`, `components/site-*.tsx`, `components/theme-*.tsx` 등 사람이 직접 작성한 `.tsx`/`.ts` 파일은 4-스페이스 들여쓰기를 사용한다 (`app/layout.tsx`, `components/site-header.tsx` 참고).
- **예외**: `components/ui/*`(shadcn CLI로 생성된 파일)와 `lib/utils.ts`는 shadcn/CLI가 생성한 원본 포맷(2-스페이스)을 그대로 유지한다. shadcn 컴포넌트를 새로 추가할 때 CLI 산출물의 들여쓰기를 임의로 4-스페이스로 바꾸지 말 것 — 대신 `/add-component` 커맨드의 프로세스(기존 컴포넌트와 컨벤션 비교 후 필요한 부분만 수정)를 따를 것.
- 새로 작성하는 페이지/일반 컴포넌트(`app/**`, `components/*.tsx` 최상위)는 4-스페이스, 변수는 camelCase를 따른다.
- 경로 별칭은 `@/*`(`tsconfig.json` paths) 및 `components.json`의 aliases(`@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`)를 사용한다. 상대 경로(`../../`) import를 사용하지 말 것.

## shadcn/ui 컴포넌트 추가 규칙

- 새 shadcn 컴포넌트가 필요하면 직접 `npx shadcn add`를 호출하지 말고 `/add-component` 슬래시 커맨드(`.claude/commands/add-component.md`)의 프로세스를 따른다:
  1. `components.json` 설정(`style: base-nova`, `baseColor: neutral`, `iconLibrary: lucide`) 확인
  2. `components/ui/`에 이미 존재하면 건너뛰고 알림 (덮어쓰지 않음)
  3. 설치 후 `cn()`(`@/lib/utils`), `class-variance-authority`(cva) 패턴, `@base-ui/react` 래핑 방식, `lucide-react` import 스타일이 기존 컴포넌트(`button.tsx`, `card.tsx` 등)와 일치하는지 검토·수정
- 이미 존재하는 `components/ui/*` 파일을 임의로 덮어쓰지 말 것 — 먼저 사용자에게 확인.
- 새 의존성이 `package.json`에 추가되면 변경 사항을 사용자에게 알릴 것.

## Notion 연동 구현 시 주의사항

- 이 프로젝트에는 아직 Notion API 연동 코드가 없다 (`lib/`에는 `utils.ts`만 존재). Notion 연동 기능을 처음 구현할 때는 다음을 지킬 것:
  - Integration Token 등 민감정보는 `.env.example`에 키 이름만 추가하고, 실제 값은 `.env.local`(git-ignored)에만 존재해야 한다. 토큰 값을 코드/커밋/로그에 노출하지 말 것.
  - slug(고유 링크)는 순차 번호가 아닌 예측 불가능한 값으로 생성해야 한다 (PRD F2, NFR 보안 항목).
  - 동기화 방식(A: 실시간 조회 / B: 스냅샷)이 확정되지 않았으므로, 구현 전 사용자에게 방식을 확인할 것.

## 다국어/커뮤니케이션 규칙 (사용자 전역 설정과 일치)

- 사용자 대면 텍스트(페이지 콘텐츠, 메타데이터, UI 문구)는 한국어를 기본으로 한다 (`app/layout.tsx`의 `title`/`description`, `app/page.tsx` 문구 참고).
- 코드 주석은 한국어로, 간결하게 작성한다. 단, 함수/변수명은 영어(camelCase)를 유지한다.
- `console.log` 대신 적절한 로깅 방식을 사용한다. 현재 프로젝트에는 별도 로깅 라이브러리가 아직 설정되어 있지 않으므로, 로깅이 필요한 기능을 추가할 때는 먼저 사용자에게 로깅 라이브러리 도입 여부를 확인할 것.

## 여러 파일을 동시에 수정해야 하는 경우

- `README.md`의 "기술 스택 / 주요 명령어 / 화면 구성" 절과 `docs/PRD.md`의 내용이 서로 어긋나지 않도록, 기능 범위나 화면 구성이 바뀌면 두 파일을 함께 갱신할 것.
- `components.json`의 `style`/`baseColor`/`iconLibrary` 설정을 변경하면, 이미 설치된 `components/ui/*` 전체가 새 설정과 불일치하게 되므로 기존 컴포넌트들도 함께 재검토·갱신할 것.
- `.mcp.json`(팀 공유 MCP 서버 목록)을 수정하면, 로컬 활성화 목록인 `.claude/settings.local.json`의 `enabledMcpjsonServers`도 필요 시 함께 갱신할 것.

## 금지 사항

- **금지**: `node_modules/next/dist/docs/`를 확인하지 않고 App Router의 라우팅/데이터 페칭/캐싱 관련 코드를 학습 데이터의 일반 지식만으로 작성하는 것.
- **금지**: `components/ui/*` 파일을 `/add-component` 프로세스 없이 직접 `npx shadcn`으로 덮어쓰거나 임의로 재작성하는 것.
- **금지**: PRD에서 "확인 필요"로 명시된 사항(Notion 스키마, 게시 트리거 방식, 동기화 방식, 링크 만료 정책, PDF 구현 방식, 배포 환경)을 임의로 결정하고 구현부터 진행하는 것 — 먼저 사용자 확인.
- **금지**: `.env.local`, Notion Integration Token 등 민감 정보를 커밋하거나 문서/커밋 메시지에 값 그대로 기재하는 것.
- **금지**: 사람이 직접 작성한 `.tsx` 파일에서 2-스페이스 들여쓰기를 사용하거나, shadcn 생성 파일(`components/ui/*`)의 포맷을 4-스페이스로 임의 변경하는 것.
