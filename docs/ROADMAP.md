# 견적서 웹 뷰어 (Invoice Web) 개발 로드맵

Notion에 입력한 견적서를 클라이언트가 로그인 없이 열람하고, 웹 화면과 동일한 PDF로 다운로드할 수 있게 하는 전용 웹 뷰어.

## 개요

견적서 웹 뷰어는 **견적서 작성자(내부 담당자)** 와 **클라이언트(외부)** 를 위한 서비스로, Notion 입력만으로 전문적인 열람 페이지가 생성되도록 하는 것을 핵심 가치로 삼습니다:

- **Notion 기반 자동 게시**: 작성자가 Notion에 입력하고 게시 상태로 바꾸면 별도 코드 작업 없이 웹 페이지가 생성됩니다.
- **비로그인 공개 열람**: 클라이언트는 고유 링크(slug)만으로 인증 없이 견적 내용을 확인합니다.
- **동일성 보장 PDF 다운로드**: 클라이언트는 웹 화면과 100% 동일한 내용의 PDF를 저장할 수 있습니다.

> 참고: Notion 속성 스키마는 실제 DB 조회로 확정되었습니다(Phase 1 완료). 동기화 방식(실시간 조회 vs 스냅샷), 링크 만료 정책, PDF 구현 방식, 배포 환경은 `docs/PRD.md` 12장 "확인이 필요한 질문"에서 아직 미확정입니다. 해당 항목을 구현하는 Task 착수 전 반드시 사용자에게 확인합니다.

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- `/tasks` 디렉토리에 새 작업 파일 생성
- 명명 형식: `XXX-description.md` (예: `001-routing-setup.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
- 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조
- 이러한 예시들은 완료된 작업의 최종 상태를 반영함 (체크된 박스와 변경 사항 요약). 새 작업 문서에는 빈 박스와 변경 사항 요약이 없어야 함

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- **API 연동 및 비즈니스 로직 구현 시 Playwright MCP(`.mcp.json`에 구성됨)로 테스트 수행 필수**
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
- 테스트 통과 확인 후 다음 단계로 진행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: 견적서 라우팅 및 페이지 구조 설정** ✅ - 완료
  - Shrimp Task Manager 태스크: `a2e8be01-276d-4122-870c-e9751f82fa75`
  - ✅ 견적서 상세 페이지 라우트 생성 (`app/quotes/[slug]/page.tsx`, `PageProps` 헬퍼 + Promise params 컨벤션 적용)
  - ✅ 링크 오류 안내용 세그먼트 전용 `not-found.tsx` 생성
  - ✅ 기존 `app/layout.tsx`의 `SiteHeader`/`SiteFooter` 구조를 유지한 채 공통 레이아웃 상속
  - ✅ 각 라우트의 빈 껍데기 파일만 생성 (실제 데이터 연동 제외)

- **Task 002: 타입 정의 및 데이터 모델 설계** ✅ - 완료
  - Shrimp Task Manager 태스크: `17c887a4-45f2-4f33-bd8e-4e5f3f50eafd`
  - ✅ 견적서(Quote) 도메인 타입 정의 (`lib/types/quote.ts`): 견적서 번호, 클라이언트명, 상태, 총 금액, 발행일, 유효기간, 라인 아이템, 게시 여부
  - ✅ 실제 Notion DB 스키마 조회 결과 반영 (`lib/types/notion.ts`): 속성명/타입 확정, 「상태」옵션값(`대기`/`거절`/`승인`)을 `QuoteStatus` 유니온으로 정의, 게시는 「승인」일 때만
  - ✅ 「항목」relation 하위 DB(항목명/수량/단가/금액(formula)) 원시 타입 정의
  - ✅ Notion 응답 → 내부 타입 매핑 함수는 시그니처만 선언 (구현은 Task 005)
  - ✅ 링크 상태 타입(`QuoteLinkStatus`) 정의

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

- **Task 003: 견적서 전용 컴포넌트 라이브러리 구현** ✅ - 완료
  - Shrimp Task Manager 태스크: `1bcb8d31-e032-4eb2-b1d0-81f3bda07c63`, `0a65c672-263d-4a51-b24b-6e889e120dc1`, `3c058772-ef50-4ace-9961-7b56cc903463`
  - ✅ shadcn `table` 컴포넌트 추가 (`components/ui/table.tsx`, CLI가 `cn`을 외부 패키지로 잘못 import해 `@/lib/utils`로 수정, 의존성 변경 없음)
  - ✅ 견적 항목 표(`QuoteLineItemsTable`: 데스크톱 표 / 모바일 카드 스택), 합계 요약(`QuoteTotalSummary`, 금액 없으면 '금액 미정'), 상태 배지, 유효기간 배지(표시 전용) 구현 (`components/quote/*`)
  - ✅ 더미 견적서 fixture 작성 (`lib/mocks/quotes.ts`: 승인/대기/거절/유효기간 임박/경과/금액 없음 6케이스, `getMockQuoteBySlug` 단일 조회 접점)
  - ✅ 원화·날짜 포맷 유틸 작성 (`lib/format.ts`)

- **Task 004: 견적서 상세/오류 페이지 UI 완성** ✅ - 완료
  - Shrimp Task Manager 태스크: `16019963-f59c-4148-9559-5a875d9992fa`, `7bd45437-8660-4c9d-8d87-b33b1120c251`, `f62bd505-bbdf-4097-a1c7-7f56dc7967ba`
  - ✅ 더미 데이터로 견적서 상세 페이지 전체 UI 구현 (헤더, 상태·유효기간 배지, 항목표, 합계, PDF 다운로드 버튼). 승인(`isPublished`)된 견적서만 표시하고 그 외는 `notFound()`
  - ✅ 링크 오류 페이지 UI 구현 (`QuoteLinkError`: `not_found` 사용 중, `expired`는 UI 시안만 두고 라우팅 미연결). 문의 연락처는 "연락처 준비 중" 플레이스홀더
  - ✅ 모바일(375px)/데스크톱/다크모드 반응형 레이아웃 적용 및 Playwright 브라우저 검증 (F6)
  - ✅ PDF 다운로드 버튼은 UI만 구현 (클릭 시 안내 toast, 실제 생성은 Task 007)

### Phase 3: 핵심 기능 구현

- **Task 005: Notion 연동 및 데이터 페칭 구현** ✅ - 완료
  - Shrimp Task Manager 태스크: `c49dc771-17d4-407d-9680-b5111ea4e564`, `d30e286f-0dea-4711-899e-8772b1e82b86`, `5d584eaa-3a47-43fe-b598-444cc34161f3`
  - ✅ Notion SDK(`@notionhq/client` v5) 클라이언트 설정(`lib/notion/client.ts`) 및 pino 로거 도입(`lib/logger.ts`). `.env.example`의 기존 키(`NOTION_API_KEY`, `NOTION_DATABASE_ID`) 그대로 사용, 토큰 값 미커밋
  - ✅ Notion 응답 → `Quote` 매핑(`mapNotionPropertiesToQuote`) 및 「항목」relation 하위 DB 병렬 조회(동시 3개) 구현 (`lib/notion/mapper.ts`). 속성 누락·타입 불일치 시 원인이 드러나는 오류 발생
  - ✅ 동기화 방식 확정: 실시간 조회 + 60초 캐시(`unstable_cache`, `lib/quotes.ts`의 `getQuoteBySlug`). `cacheComponents` 전환은 후속 과제
  - ✅ 더미 데이터 조회를 실제 Notion 데이터로 교체하고 Notion 장애 시 오류 화면(`error.tsx`) 추가
  - ✅ Playwright MCP로 실제 Notion 견적서 표시 확인 (항목 합계와 총 금액 일치)
  - 해결됨(Task 008): 항목이 25개를 초과하면 Notion 응답이 잘리던 문제는 페이지네이션으로 처리하고 항목 조회 동시성을 3→10으로 높임

- **Task 006: 고유 링크(slug) 발급 및 접근 제어 구현** ✅ - 완료
  - Shrimp Task Manager 태스크: `3c8f29dc-0bb7-43b3-ba86-b9ec641d943b`, `e9734c5a-5991-44c6-b323-a2c672ff049f`
  - ✅ slug는 Notion 페이지 ID(32자 hex)를 사용하기로 확정. 형식이 잘못되면 Notion 호출 없이 미존재 처리, 우리 견적서 DB 소속이 아닌 페이지는 노출하지 않음 (F2)
  - ✅ 존재하지 않거나 게시(승인)되지 않은 링크는 오류 페이지로 라우팅 (F5)
  - ✅ 만료 정책 확정: 유효기간이 지나도 열람은 허용하고 안내만 표시 (F7). 판정은 `lib/quote-validity.ts`로 통일해 배지와 안내가 같은 기준(한국시간, 당일까지 유효) 사용
  - ✅ Playwright MCP 검증: 정상 / 거절·대기·존재하지 않는 링크 404 / 만료 안내(라이트·다크·375px)
  - 참고: 링크 폐기·재발급은 불가능(페이지 ID 고정)

- **Task 006-1: 핵심 기능 통합 테스트** ✅ - 완료
  - Shrimp Task Manager 태스크: `5d7e54be-27d8-443a-8dc8-cf65afea1015`
  - ✅ Playwright MCP로 링크 접속→열람→PDF 버튼(안내 토스트) 플로우 검증 (PDF 실제 생성은 Task 007)
  - ✅ Notion 동기화 실패(잘못된 토큰) 시 500 오류 화면과 다시 시도 버튼 검증, 토큰 미노출 확인
  - ✅ 엣지 케이스(빈 필수 속성, 게시되지 않은 견적서 등): 비승인·존재하지 않는 링크는 실제 Notion으로 검증. 빈 필수 속성·항목 0개는 실제 Notion 데이터가 아닌 가짜 응답으로만 검증
  - Playwright MCP로 "링크 접속 → 견적 열람 → PDF 다운로드" 전체 플로우 E2E 테스트
  - Notion 동기화 실패 시 오류 처리 검증
  - 에러 핸들링 및 엣지 케이스(빈 필수 속성, 게시되지 않은 견적서 등) 테스트

### Phase 4: 고급 기능 및 최적화 ✅

- **Task 007: PDF 다운로드 기능 구현** ✅ - 완료
  - Shrimp Task Manager 태스크: `4440c51a-cfb1-4f9d-abf1-9f7a2ec241e8`, `82809a73-e631-4e18-9b51-99fcc0bc0f78`, `3bf92c3c-70df-48f2-904b-dd4abcb158fb`
  - ✅ 구현 방식 확정: 서버사이드 렌더링 (`puppeteer-core` + Vercel은 `@sparticuz/chromium`, 로컬은 Chrome/Edge). 상세 페이지를 인쇄 모드로 렌더해 웹과 같은 컴포넌트를 사용 (`app/quotes/[slug]/pdf/route.ts`, `lib/pdf/render-quote-pdf.ts`)
  - ✅ 파일명 규칙 확정: `견적서_{클라이언트명}_{발행일 YYYY-MM-DD}.pdf` (발행일 없으면 날짜 생략, RFC 5987 인코딩) (`lib/pdf-filename.ts`)
  - ✅ 승인(게시) 판정을 `lib/quote-access.ts`로 공유해 비승인·미존재·형식 오류 슬러그의 PDF는 404
  - ✅ 다운로드 버튼 연결 (로딩 표시, 실패 시 오류 토스트)
  - ✅ 실제 Notion 승인 견적서 3건으로 웹과 PDF의 내용·순서·금액 일치 검증, Notion 장애 시 500 및 토큰 미노출 확인 (`tasks/007-pdf-download.md`)
  - ✅ Vercel 배포본 검증은 Task 008에서 완료 (Chromium 바이너리 누락과 한글 폰트 문제를 해결)

- **Task 008: 조회 이력 로깅 및 성능·배포 최적화** ✅ - 완료
  - Shrimp Task Manager 태스크: `5122db05-e526-4626-b77b-fbc7192cb16d`, `444f19de-5a3e-4191-a8b1-d9c2363bbb40`, `6d5127fe-146e-4606-a8e7-0c0f35a0297f`
  - ✅ 견적서 열람 이력 단순 로그 구현 (F8): 열람 일시와 slug만 pino로 기록(IP/기기 미수집), 응답 이후 `after()`로 기록하며 PDF 내부 렌더링·비승인/미존재 링크는 제외 (`lib/view-log.ts`)
  - ✅ 최초 로딩 3초 이내 성능 확인 (NFR): 로컬 기준 캐시 미스 서버 응답 0.6~1.9초, 캐시 히트 0.02~0.05초, 브라우저 load 약 0.1초. Notion 항목 조회 동시성을 3→10으로 높여 항목 25개에서도 3초 이내가 되도록 함
  - ✅ 항목 25개 초과 페이지네이션 구현 (`fetchAllRelationIds`, `lib/notion/mapper.ts`): 가짜 응답으로 60개·커서 순회·오류 경로 검증, 실제 Notion 응답 형태 확인
  - ✅ Vercel 배포 및 배포본 검증 (`https://invoice-web-lyart-eight.vercel.app`): 정상 열람·404 처리·PDF 다운로드 확인, 페이지 응답 총 0.5~0.8초, PDF 첫 요청 약 7초(이후 약 3초)
  - ✅ PDF 500 해결: `@sparticuz/chromium/bin`이 배포 함수에 빠지던 문제를 `outputFileTracingIncludes`로 해결 (`next.config.ts`)
  - ✅ PDF 한글 빈칸 해결: Vercel 서버에 한글 폰트가 없어 Noto Sans KR 웹폰트 추가 (`app/layout.tsx`)
  - ✅ 로깅은 기존 pino 로거(`lib/logger.ts`)를 사용하고 `console.log`는 쓰지 않음. `.env.example` 갱신(`LOG_LEVEL`, `PDF_BROWSER_PATH`), 시크릿은 저장소에 없음
  - 참고: 프리뷰·배포별 URL(Deployment Protection)에서는 PDF에 로그인 화면이 찍히므로 클라이언트에는 프로덕션 도메인 링크만 공유 (`tasks/008-logging-performance-deploy.md`)
