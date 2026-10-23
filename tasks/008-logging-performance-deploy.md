# Task 008: 조회 이력 로깅 및 성능·배포 최적화

견적서 열람 이력(F8)을 로그로 남기고, 최초 로딩 3초 이내(NFR)를 확인하며, Vercel 배포본에서 전체 기능을 검증한다.

## 확정 사항

- 조회 이력: 열람 일시와 slug만 pino 로그로 기록한다 (IP/기기 미수집)
- 항목 25개 초과 페이지네이션을 이번 Phase 범위에 포함한다
- 배포 환경: Vercel (프로덕션 도메인 `https://invoice-web-lyart-eight.vercel.app`)

## 관련 파일

- `lib/view-log.ts`: `logQuoteView`, `PDF_RENDER_SOURCE` (조회 이력 로깅)
- `app/quotes/[slug]/page.tsx`: 응답 이후 `after()`로 열람 이력 기록
- `app/quotes/[slug]/pdf/route.ts`: PDF 렌더링 요청에 `?source=pdf`를 붙여 열람 이력에서 제외
- `lib/notion/mapper.ts`: `fetchAllRelationIds`(25개 초과 페이지네이션), 항목 조회 동시성 3→10
- `lib/types/notion.ts`: relation 속성 ID 필드 추가
- `next.config.ts`: `outputFileTracingIncludes`로 `@sparticuz/chromium/bin`을 PDF 함수에 포함
- `app/layout.tsx`: Noto Sans KR 웹폰트 추가 (서버에 한글 폰트가 없어 PDF 한글이 비던 문제 해결)
- `.env.example`: 환경변수 안내 (`LOG_LEVEL`, `PDF_BROWSER_PATH` 추가)

## 수락 기준

- [x] 승인된 견적서를 열 때마다 열람 일시와 slug가 로그로 남는다
- [x] 최초 로딩이 3초 이내이다
- [x] 항목이 25개를 초과해도 전체가 조회된다
- [x] 배포본에서 정상 열람, 404 처리, PDF 다운로드가 동작한다
- [x] 시크릿이 저장소에 없다

## 구현 단계

- [x] 008-A: 조회 이력 로깅
- [x] 008-B: 성능 측정·최적화 및 25개 초과 페이지네이션
- [x] 008-C: 배포본 검증 및 마감

## 테스트 체크리스트

### 조회 이력 로깅 (로컬 `next start`)

- [x] 승인 링크를 2번 열면 로그가 2건 남는다 (캐시 히트 포함)
- [x] 거절·존재하지 않는 ID·형식 오류 링크(404)와 PDF 생성용 내부 렌더링은 기록되지 않는다
- [x] 로그에는 `event`, `slug`, `viewedAt`만 있고 `console.log`는 사용하지 않는다

### 성능 (로컬 `next start`)

- [x] 서버 응답: 캐시 미스 0.6~1.9초, 캐시 히트 0.02~0.05초
- [x] 브라우저 load: 데스크톱 약 0.13초, 375px 약 0.06초
- [x] 병목 확인: Notion 요청 1건 약 0.25~0.38초, 동시 25건도 429 없이 약 0.46초 → 항목 조회 동시성 10으로 상향

### 페이지네이션

- [x] 가짜 클라이언트로 60개 전체 조회, relation 순서 유지, 커서 2페이지 순회, 동시 요청 10개 이하
- [x] 25개 이하는 추가 조회를 하지 않는다
- [x] 속성 ID 없음, `has_more`인데 커서 없음은 오류로 처리한다
- [x] 실제 Notion 응답 형태 확인 (전체 조회 결과가 페이지 relation과 순서까지 동일)

### 배포본 스모크 테스트 (프로덕션 도메인)

- [x] 홈 200
- [x] 승인 견적서 3건 열람 200 (페이지 응답 총 0.5~0.8초)
- [x] 거절·대기·존재하지 않는 ID·형식 오류 링크의 페이지와 PDF가 모두 404
- [x] PDF 다운로드 200, 파일명 `견적서_ABC 회사_2026-09-12.pdf` (첫 요청 약 7초 / 이후 약 3초)
- [x] PDF의 한글과 ₩가 정상 표시된다 (사용자 확인)

## 배포 참고사항 및 해결한 문제

- **Chromium 파일 누락**: 첫 배포에서 PDF가 500이었다. `@sparticuz/chromium`의 `bin/*.br` 파일이 배포 함수에 포함되지 않았기 때문이며 `next.config.ts`의 `outputFileTracingIncludes`로 해결했다.
- **PDF 한글 빈칸**: Vercel 서버에는 한글 폰트가 없어 한글과 ₩가 비었다. Noto Sans KR 웹폰트로 해결했다. 로컬은 시스템 폰트가 있어 이 문제가 드러나지 않았다.
- **프리뷰·배포별 URL**: Vercel Deployment Protection이 걸린 URL(`invoice-*-...vercel.app`)에서 PDF를 받으면 PDF 라우트가 같은 주소로 페이지를 다시 열기 때문에 로그인 화면이 PDF에 찍힌다. 클라이언트에게는 프로덕션 도메인 링크만 공유한다.
- **환경변수**: `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 Vercel 프로젝트 환경변수에 설정한다 (필수). `LOG_LEVEL`은 선택이다.
- **열람 이력 확인**: 열람 이력은 pino JSON 로그(`event: "quote_view"`)로 남으며 Vercel Logs의 Runtime Logs에서 확인한다.

## 한계

- PDF 생성은 서버리스 Chromium을 쓰므로 첫 요청이 약 7초로 느리다 (`maxDuration = 30` 이내).
- 항목이 수백 개로 늘면 항목 페이지를 하나씩 조회하는 방식은 요청 수가 늘어난다. 이때는 항목 DB 일괄 쿼리를 검토한다 (역방향 relation 속성 이름 `Invoices`에 의존).
- 25개 이상인 실제 견적서로는 측정하지 못했다 (가짜 응답과 실제 응답 형태로 검증).
- PDF 다운로드 횟수는 기록하지 않는다 (PRD 성공 지표 "열람 대비 PDF 다운로드 전환율"이 필요하면 별도 로그 추가).
