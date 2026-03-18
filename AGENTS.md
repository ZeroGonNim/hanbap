# 🤖 Antigravity AI Agent Rules

## 1. CORE & TECH

- 언어/태도: 한국어 필수. 단순 생성기가 아닌 성능·보안·확장성을 제안하는 기술 파트너.
- Tech Stack: React 18+(Hook), TypeScript(strict), Tailwind CSS, Zustand, TanStack Query(React Query v5), Yarn.
- Node: ≥ 18 LTS.

### 1-1. TypeScript 규칙

- `any` 사용 금지 → 불가피하면 `unknown` + 타입 가드로 좁힌다.
- `as` 타입 단언 최소화. 사용 시 `// ASSERT: 사유` 주석 필수.
- API 응답은 **Zod 스키마**로 런타임 검증 후 타입 추론(`z.infer`)한다.
- `Enum` 대신 `as const` 객체 + `typeof` 유니온을 권장한다.
- 유틸리티 타입(`Pick`, `Omit`, `Partial` 등)을 적극 활용하여 중복 타입을 줄인다.

### 1-2. 코드 스타일

- 단일 책임 원칙: 하나의 파일/함수는 하나의 역할만 수행한다.
- 컴포넌트 파일 최대 **200줄**. 초과 시 하위 컴포넌트 또는 커스텀 훅으로 분리한다.
- 커스텀 훅 분리 기준: 로직이 **3개 이상의 상태(state)** 를 관리하면 훅으로 추출한다.
- 깊은 중첩 ≤ 3단계. 초과 시 early return 또는 함수 추출로 해결한다.
- 주석은 "무엇(what)"이 아닌 **"왜(why)"** 위주로 작성한다.

### 1-3. 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `UserProfileCard.tsx` |
| 커스텀 훅 | useCamelCase | `useAuthSession.ts` |
| 유틸 함수 | camelCase | `formatCurrency.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserProfile`, `ApiResponse` |
| 디렉토리 | kebab-case | `user-profile/` |

### 1-4. Import 순서

```ts
// 1. 외부 라이브러리
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 내부 모듈 (절대경로)
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

// 3. 타입
import type { UserProfile } from '@/types/user';

// 4. 스타일 / 에셋
import './styles.css';
```

---

## 2. 상태 관리 경계

서버 상태와 클라이언트 상태를 **절대 혼용하지 않는다.**

### TanStack Query — 서버 상태 전용

- API 데이터 페칭, 캐싱, 뮤테이션, 낙관적 업데이트.
- `staleTime`, `gcTime`을 도메인별로 적절히 설정한다.
- Query Key는 배열 형태로 계층 구조를 유지한다: `['users', userId, 'posts']`
- 뮤테이션 후 관련 쿼리 `invalidateQueries`를 반드시 호출한다.

### Zustand — 클라이언트 UI 상태 전용

- 모달, 사이드바, 테마, 로컬 필터 등 **서버와 무관한 UI 상태**만 관리한다.
- 스토어는 도메인별로 분리한다 (예: `useAuthStore`, `useUIStore`).
- `persist` 미들웨어 사용 시, 저장 대상 필드를 `partialize`로 명시한다.
- 서버 데이터를 Zustand에 복제하지 않는다.

---

## 3. 에러 핸들링

### 3-1. 기본 원칙

- 모든 비동기 호출은 `try/catch`로 감싸며, 에러 타입을 구분한다.
- 엣지 케이스(null, undefined, 빈 배열 등)를 방어적으로 처리한다.

### 3-2. API 에러 표준 구조

```ts
interface ApiError {
  code: string;        // 'AUTH_EXPIRED' | 'VALIDATION_FAILED' | ...
  message: string;     // 사용자에게 표시할 메시지
  details?: unknown;   // 디버깅용 추가 정보 (로깅 전용, UI 노출 금지)
}
```

### 3-3. Error Boundary

- **페이지 단위**: 각 라우트 최상단에 Error Boundary를 배치한다.
- **섹션 단위**: 독립적인 위젯/카드 영역에 개별 Boundary를 적용하여 부분 장애를 격리한다.
- fallback UI는 "다시 시도" 버튼을 포함한다.

### 3-4. TanStack Query 에러 전략

- `retry`: GET 요청 최대 2회, 뮤테이션은 0회.
- `onError` 콜백에서 토스트/알림으로 사용자에게 피드백한다.
- 401 에러 시 글로벌 인터셉터에서 토큰 갱신 → 실패 시 로그아웃 처리.

---

## 4. 보안

### 4-1. XSS 방어

- `dangerouslySetInnerHTML` 사용 **금지**. 불가피하면 `DOMPurify`로 sanitize 후 사용하고, PR 리뷰 필수.
- 사용자 입력값은 렌더링 전 반드시 이스케이프/검증한다.
- URL 파라미터를 직접 DOM에 주입하지 않는다.

### 4-2. 환경 변수

- `VITE_` / `NEXT_PUBLIC_` 접두사가 붙은 변수에 **시크릿(API Secret, DB 비밀번호 등)을 절대 넣지 않는다.**
- `.env` 파일은 `.gitignore`에 반드시 포함한다.
- `.env.example` 파일을 유지하여 필요한 변수 목록을 문서화한다.

### 4-3. 인증·토큰

- Access Token: 메모리(변수/Zustand) 보관. localStorage/sessionStorage 금지.
- Refresh Token: `httpOnly` + `Secure` + `SameSite=Strict` 쿠키로 관리.
- 토큰 만료 처리: Axios/Fetch 인터셉터에서 자동 갱신 로직을 구현한다.

### 4-4. 의존성 보안

- 신규 패키지 설치 전 `yarn audit` 실행. 알려진 취약점(Critical/High)이 있는 패키지는 설치 금지.
- 주 1회 `yarn audit`를 실행하여 취약점을 점검한다.
- 패키지 선택 기준: 주간 다운로드 10만+ , 최근 6개월 이내 업데이트, MIT/Apache 2.0 라이선스.

---

## 5. 성능 최적화

### 5-1. React 렌더링

- `React.memo`: props가 빈번히 동일한 **리스트 아이템** 컴포넌트에 적용한다.
- `useMemo`: 연산 비용이 큰 파생 데이터(필터링, 정렬, 집계)에만 적용한다.
- `useCallback`: 자식 컴포넌트에 전달하는 핸들러 함수에 적용한다.
- 무분별한 메모이제이션은 오히려 성능을 해치므로, **측정 후 적용**을 원칙으로 한다.

### 5-2. 번들 & 로딩

- 라우트 단위 `React.lazy` + `Suspense`로 코드 스플리팅한다.
- 이미지: `loading="lazy"`, WebP/AVIF 포맷 우선, 반응형 `srcset` 적용.
- 서드파티 라이브러리는 tree-shaking 가능 여부를 확인 후 도입한다.
- 번들 분석(`vite-plugin-visualizer` 등)으로 비대한 의존성을 주기적으로 점검한다.

### 5-3. 캐싱

- TanStack Query `staleTime` 기본값을 도메인별로 설정한다 (예: 사용자 프로필 5분, 설정 30분).
- 정적 에셋은 빌드 해시 + `Cache-Control: immutable`을 활용한다.

---

## 6. 테스트

### 6-1. 도구

- 단위/통합: **Vitest** + **Testing Library**
- E2E: **Playwright** (필요 시)

### 6-2. 필수 테스트 범위

| 대상 | 필수 여부 | 비고 |
|---|---|---|
| 유틸 함수 | ✅ 필수 | 순수 함수 — 입력/출력 기반 테스트 |
| 커스텀 훅 | ✅ 필수 | `renderHook`으로 상태 변화 검증 |
| API 서비스 | ✅ 필수 | MSW로 모킹하여 요청/응답 검증 |
| UI 컴포넌트 | 🔶 선택 | 사용자 인터랙션이 복잡한 경우에 작성 |
| E2E | 🔶 선택 | 핵심 비즈니스 플로우에 한정 |

### 6-3. 테스트 컨벤션

- 테스트 파일: `__tests__/대상파일명.test.ts(x)` 또는 동일 디렉토리 내 `대상.test.ts`.
- `describe` → 대상, `it` → 행위 기반 서술 (`it('빈 입력이면 에러를 반환한다')`).

---

## 7. Git 컨벤션

### 7-1. 커밋 메시지 (Conventional Commits)

```
<type>(<scope>): <subject>

[body]
[footer]
```

| type | 용도 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변화 없음) |
| `style` | 코드 포맷, 세미콜론 등 |
| `docs` | 문서 수정 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 패키지, 설정 변경 |

### 7-2. 브랜치 전략

```
main ← develop ← feature/기능명
                ← fix/이슈번호-설명
                ← hotfix/긴급수정
```

### 7-3. PR 규칙

- PR 제목은 커밋 타입을 따른다: `feat(auth): 소셜 로그인 추가`
- 변경 파일 **10개 이하** 권장. 초과 시 PR을 분리한다.
- 셀프 리뷰 후 제출. 최소 1인 승인 후 머지.

---

## 8. EXPERT TEAM (병렬 검수)

기획, 디자인, 개발, QA 4개 파트가 병렬로 참여하되, **토큰 절약을 위해 의견이 일치하거나 문제가 없는 파트는 "✅ [파트명]: Pass"로만 짧게 응답**한다.

| 파트 | 책임 |
|---|---|
| 기획 | 요구사항 검증, 비즈니스 로직 정합성 확인 |
| 디자인 | UX 흐름, 웹 접근성(WCAG 2.1 AA), 반응형 레이아웃 검증 |
| 개발 | 코드 구현, 아키텍처 적합성, 성능 최적화 점검 |
| QA | 엣지 케이스 도출, 크로스 브라우저 호환성, 무결성 테스트 |


### 8-1. 멀티 라운드 검수 (확장 포맷 적용 시)

구조 변경, 신규 기능 등 **확장 포맷**이 적용되는 작업에서는 단일 패스가 아닌 멀티 라운드로 검수한다.
```
1차 — 독립 검수: 각 파트가 독립적으로 리뷰하고 결과를 출력한다.
2차 — 교차 검토: 이슈가 있는 파트끼리 교차 피드백한다.
       • QA 이슈 → 개발이 수정안 제시
       • 디자인 이슈 → 기획이 요구사항 재확인
       • 개발 이슈 → QA가 영향 범위 재검증
3차 — 최종 합의: 모든 파트가 합의한 뒤 코드를 확정한다.
```

단순 수정/버그픽스(기본 포맷)에서는 1차 독립 검수만 수행하여 토큰을 절약한다.


---

## 9. WORKFLOW & APPROVAL

### 9-1. 작업 원칙

1. **문서 우선 참조**: 작업 전 반드시 `docs/` 폴더의 문서나 `Implementation Plan`을 먼저 읽고 컨텍스트를 파악한다.
2. **단계별 작업**: 한 번에 하나의 컴포넌트/기능만 처리하여 품질을 높인다.
3. **실행 가능 코드**: 항상 실행 가능한 구조로 제공하며, 필요한 `yarn` 명령어를 포함한다.
5. **개발 우선, 운영 후행 (철칙)**: 모든 요청 사항은 먼저 로컬(Development) 환경에 반영하여 검증한다. 운영(Production) 배포인 `npx vercel --prod`는 사용자가 로컬 결과를 확인한 후 **명시적인 승인(예: "운영 배포해줘")을 할 때만** 진행한다. AI가 임의로 운영 배포를 결정해서는 안 된다.

### 9-2. 출력 포맷

AI는 코드 작성 전에 반드시 문제를 분석하고 해결 전략을 먼저 설명한다. 단순 코드 생성이 아니라 **문제 해결 과정이 드러나야** 한다. 작업 복잡도에 따라 두 가지 포맷을 사용한다.

#### 기본 포맷 (단순 수정 / 버그픽스)
```
1️⃣ 결론 (무엇을 했는지 한 줄 요약)
2️⃣ 코드 (실행 가능한 전체 코드)
3️⃣ 핵심 설계 이유 (왜 이렇게 했는지 간결히)
4️⃣ 병렬 검수 결과 (각 파트 한 줄)
```

#### 확장 포맷 (신규 기능 / 구조 설계 / 복잡한 문제)
```
1️⃣ 문제 분석 (현재 상태와 원인 파악)
2️⃣ 해결 전략 (선택지 비교 및 채택 사유)
3️⃣ 코드 (실행 가능한 전체 코드)
4️⃣ 병렬 검수 결과 (각 파트 한 줄)
```

### 9-3. 필수 승인 (Plan Approval)

다음의 **파괴적 작업**을 수행하기 전에는 반드시 사용자에게 이유를 설명하고 승인을 대기한다:

- 새로운 패키지 설치 또는 메이저 버전 업그레이드
- 기존 파일 삭제 및 폴더 구조 변경
- 대규모 리팩토링 (3개 이상 파일에 걸친 구조 변경)
- 공용 컴포넌트/훅의 인터페이스 변경 (breaking change)
- 환경 변수 추가/삭제

---

## 10. ENVIRONMENT & SKILLS SETUP (환경 동기화)
다른 PC(집 ↔ 사무실)로 이동하여 작업할 때, 터미널(프로젝트 폴더)에 아래 명령어들을 실행하여 완벽히 동일한 AI 환경을 구축한다.

### 🛠️ 1. 스킬(Skills) 설치 명령어
```bash
npx skills add https://github.com/vercel-labs/skills --skill find-skills -y
npx skills add https://github.com/anthropics/skills --skill frontend-design -y
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices -y
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines -y
```