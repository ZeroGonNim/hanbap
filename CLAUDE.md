# Project: HnaBap_Promo (AI-Partner-Harness v2.5)

> **[RULE PRIORITY]**: `CLAUDE.md §2 (Hard Rules)` > `docs/` > `rules/*.md` > `AGENTS.md` (Process)
> AI 에이전트는 이 계층을 준수하여 충돌을 해결한다.

---

## 1. 프로젝트 요약 & 워크플로우

- **프로젝트명**: HnaBap_Promo — 하나밥 식당 AI 프로모션 자동화
- **설명**: 일일 리뷰 수집 → 분석 → 인스타그램 자동 포스팅 파이프라인
- **스택**: Node.js/TypeScript (파이프라인), React + Tailwind (프론트엔드), Python (이미지 생성/IG API)
- **진입점**: `CLAUDE.md` → `AGENTS.md` → `rules/hook.md` (Before Hook)
- **핵심**: 모든 T1+ 작업은 **"질문 + 계획"을 한 번에 제시**하여 턴 수를 최소화한다.
- **언어**: 한국어 고정.

---

## 2. 절대 금지 사항 (HARD RULES)

1. **환경 변수에 시크릿 노출 금지** → API 키, 토큰은 `.env`에만, 커밋 금지
2. **운영 배포 임의 실행 금지** → `vercel --prod`, GitHub Actions 트리거는 명시적 승인 필요
3. **파괴적 작업 무단 실행 금지** → 파일 삭제, 패키지 메이저 업그레이드는 대기
4. **`any` 타입 사용 금지** → `unknown` + 타입 가드 대체
5. **`dangerouslySetInnerHTML` 금지** → 불가피 시 DOMPurify 필수
6. **인스타그램 API 직접 호출 금지** → 반드시 `scripts/instagram_automation/` 경유

---

## 3. 작업 유형별 규칙 라우팅 (JIT)

> 필요한 규칙만 선택적으로 읽어 토큰을 절약한다.

| 유형 | 참조 파일 | 핵심 |
|---|---|---|
| 공통/Hook | `rules/hook.md` | 시작/종료 HOOK, 작업 기억 |
| 시스템 최적화 | `rules/meta.md` | JIT 컨텍스트, 스택 적응, 자가 최적화 |
| 에러/디버깅 | `AGENTS.md §3` | try/catch, API 에러 구조 |
| 보안 | `AGENTS.md §4` | 환경 변수, 토큰 관리 |
| Git/배포 | `AGENTS.md §7, §9` | 커밋 컨벤션, 승인 절차 |
| 프론트엔드 | `AGENTS.md §1` | TypeScript, 컴포넌트 규칙 |

---

## 4. 하네스 자가 최적화

- **Friction Logging**: 불필요한 절차 발견 시 즉시 기록 (`rules/meta.md`).
- **Lean Goal**: AI 모델의 발전에 따라 낡은 규칙은 과감히 삭제 제안.
