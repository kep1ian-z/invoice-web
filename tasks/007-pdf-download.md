# Task 007: PDF 다운로드 기능 구현

견적서 상세 페이지의 PDF 다운로드를 서버사이드 렌더링으로 구현하고, 웹 화면과 내용·순서·금액이 동일한지 검증한다.

## 확정 사항

- 구현 방식: 서버사이드 렌더링 (`puppeteer-core` + Vercel은 `@sparticuz/chromium`, 로컬은 Chrome/Edge, 환경변수 `PDF_BROWSER_PATH`로 지정 가능)
- 파일명: `견적서_{클라이언트명}_{발행일 YYYY-MM-DD}.pdf` (발행일이 없으면 날짜 생략, 파일명 금지문자 제거)
- 배포 환경: Vercel (`maxDuration = 30`)

## 관련 파일

- `app/quotes/[slug]/pdf/route.ts`: PDF 다운로드 Route Handler
- `lib/pdf/render-quote-pdf.ts`: 상세 페이지를 인쇄 모드로 렌더해 PDF 생성
- `lib/pdf-filename.ts`: 파일명 및 `Content-Disposition`(RFC 5987) 생성
- `lib/quote-access.ts`: 상세 페이지와 PDF 라우트가 공유하는 게시(승인) 판정
- `components/quote/quote-download-button.tsx`: 다운로드 버튼 (로딩/실패 처리)
- `components/quote/quote-line-items-table.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`: 인쇄 시 표 레이아웃 고정 및 헤더/푸터 숨김

## 수락 기준

- [x] 승인된 견적서는 PDF가 내려오고 파일명이 규칙대로 생성된다
- [x] 승인되지 않았거나 존재하지 않는 링크는 PDF를 받을 수 없다 (404)
- [x] PDF 내용·순서·금액이 웹 화면과 일치한다
- [x] 다운로드 버튼이 실제 PDF를 저장하고 로딩/실패 상태를 표시한다
- [x] `npm run lint`, `npm run build` 통과

## 구현 단계

- [x] 007-A: PDF 생성 Route Handler, 파일명 유틸, 게시 판정 헬퍼, 인쇄 스타일
- [x] 007-B: 다운로드 버튼 연결 (fetch → blob 저장, 로딩/실패 토스트)
- [x] 007-C: 동일성 및 E2E 검증

## 테스트 체크리스트 (Playwright MCP 및 로컬 `next start` 기준)

- [x] 버튼 클릭 시 PDF 다운로드가 트리거되고 파일명이 `견적서_ABC 회사_2026-09-12.pdf`로 저장된다
- [x] 생성 중 버튼이 비활성화되고 완료 후 복구된다
- [x] 실제 Notion 승인 견적서 3건(ABC 회사, 그린리프 코퍼레이션, 주식회사 구대기)의 웹 텍스트와 PDF 텍스트를 대조해 클라이언트명·항목 순서·단가·수량·금액·합계가 일치한다 (차이는 PDF에서 숨기는 다운로드 버튼 문구뿐)
- [x] PDF 이미지 확인: 헤더/푸터/버튼 없이 항목 표 아래에 총 금액이 표시되고 1페이지에 들어간다
- [x] 유효기간이 지난 견적서(ABC 회사, 그린리프 코퍼레이션)의 PDF에 만료 안내가 함께 표시된다
- [x] 거절·대기·존재하지 않는 ID·형식 오류 슬러그의 `/pdf` 요청은 모두 404이다
- [x] `/pdf`가 500을 반환하면 오류 토스트가 표시되고 버튼이 복구된다
- [x] Notion 장애(잘못된 토큰) 시 PDF 요청은 500이며 응답에 토큰이 노출되지 않고 서버 로그에 기록된다
- [x] 375px·다크모드에서 다운로드 버튼 레이아웃이 깨지지 않고 가로 스크롤이 없다

## 참고 및 한계

- Vercel 실제 배포 환경에서의 Chromium 실행(번들 크기, 콜드스타트, 타임아웃)은 Task 008-C(배포)에서 확인한다.
- PDF는 항상 라이트 테마로 출력한다.
- PDF 생성은 약 3초 소요된다 (로컬 기준).
