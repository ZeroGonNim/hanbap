# 🤖 Project Handover: 한마음식당 마케팅 자동화 시스템

이 문서는 한마음식당 마케팅 자동화 프로젝트의 현재 상태와 기술적 명세를 기록합니다. 대화가 종료된 후에도 다음 작업자가 이 내용을 바탕으로 작업을 즉시 재개할 수 있습니다.

---

## 1. 🚀 시스템 현황 (Status: 운영 중)

### 자동화 스케줄

| 시간 | 워크플로우 | 내용 | 알림 |
|------|-----------|------|------|
| 매일 09:00 KST | `daily-pipeline.yml` | 리뷰 수집 → Gemini 분석 → 랜딩페이지 업데이트 → git push | 텔레그램 |
| 매일 11:00 KST | `instagram-post.yml` | 인스타그램 자동 포스팅 (예약 or 무작위) | 텔레그램 |
| main 푸시 시 | `deploy.yml` | frontend 빌드 → Vercel 프로덕션 배포 | - |
| 매주 월요일 09:00 | `weekly-report.yml` | 주간 성과 이메일 발송 | 텔레그램 + 이메일 |

### 인스타그램 자동 포스팅
- **계정**: [@hanbap_doksan](https://www.instagram.com/hanbap_doksan/)
- **핵심 기술**: Node.js, Meta Graph API, Google Drive API, Gemini
- **발행 비율**: 메뉴 홍보(70%) / 고객 리뷰(30%) 무작위 교차 발행
- **예약 시스템**: `scheduled_posts.json` 통해 특정 날짜 포스팅 선점
- **예약 현황**: 없음 (된장찌개 삭제됨, 2026-03-19)

### 알림 채널
| 채널 | 내용 |
|------|------|
| 텔레그램 봇 (`@hanbap_noti_bot`) | 모든 자동화 실행 결과 즉시 알림 |
| 이메일 (younggonnim@gmail.com) | 주간 성과 리포트 (월요일) |
| 관리자 대시보드 (`hanbap.vercel.app/admin`) | 통계/카피/리뷰 시각화 (상시) |

---

## 2. 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | TypeScript, Node.js, Playwright, Zod |
| AI 분석 | Gemini 2.0 Flash (`src/analyzer.ts`) |
| 프론트엔드 | React 19, Tailwind CSS 4, Zustand, Framer Motion, Vite |
| 배포 | Vercel (CLI 배포 방식), GitHub Actions |
| 이메일 | Nodemailer + Gmail SMTP |
| 알림 | Telegram Bot API (`src/telegram.ts`) |
| 저장소 | GitHub (ZeroGonNim/hanbap) |

---

## 3. 📂 주요 파일 및 경로

### 백엔드 (자동화)
| 파일 | 역할 |
|------|------|
| `src/pipeline.ts` | 전체 워크플로우 오케스트레이션 (수집→분석→저장→알림) |
| `src/collector.ts` | 4개 플랫폼 리뷰 크롤러 (네이버/카카오/구글/블로그) |
| `src/analyzer.ts` | Gemini 기반 점심/저녁 타겟별 마케팅 카피 생성 |
| `src/reporter.ts` | 일일 리포트 + 프론트엔드 JSON Feed + stats.json 생성 |
| `src/mailer.ts` | Gmail SMTP 이메일 발송 |
| `src/telegram.ts` | 텔레그램 봇 알림 발송 |
| `src/weekly_report.ts` | 주간 리포트 집계 및 이메일/텔레그램 발송 |

### 프론트엔드
| 파일 | 역할 |
|------|------|
| `frontend/src/main.tsx` | 라우팅 분기 (`/admin` → AdminDashboard, lazy loading) |
| `frontend/src/App.tsx` | 메인 랜딩페이지 (useCallback, Zustand 셀렉터 최적화) |
| `frontend/src/pages/AdminDashboard.tsx` | 관리자 대시보드 (비밀번호: hanbap2026) |
| `frontend/src/data/reviews.json` | 파이프라인이 자동 업데이트하는 리뷰 데이터 |
| `frontend/public/stats.json` | 관리자 대시보드용 통계 데이터 |

### 인스타그램 자동화
| 파일 | 역할 |
|------|------|
| `scripts/instagram_automation/integrated_auto_promo.js` | 통합 자동 포스팅 |
| `scripts/instagram_automation/.env` | 토큰 및 API 키 (로컬 전용) |
| `scripts/instagram_automation/scheduled_posts.json` | 예약 장부 |

### GitHub Actions 워크플로우
| 파일 | 스케줄 |
|------|--------|
| `.github/workflows/daily-pipeline.yml` | 매일 09:00 KST — 리뷰 수집 파이프라인 |
| `.github/workflows/instagram-post.yml` | 매일 11:00 KST — 인스타그램 포스팅 |
| `.github/workflows/deploy.yml` | main 푸시 시 — Vercel 자동 배포 |
| `.github/workflows/weekly-report.yml` | 매주 월요일 09:00 KST — 주간 이메일 |

---

## 4. 🔑 환경변수 및 시크릿

### 로컬 `.env` (루트)
```
GEMINI_API_KEY=...
GMAIL_USER=younggonnim@gmail.com
GMAIL_APP_PASSWORD=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

### GitHub Secrets (ZeroGonNim/hanbap → Settings → Secrets)
| Secret | 용도 |
|--------|------|
| `VERCEL_TOKEN` | Vercel 배포용 토큰 |
| `GEMINI_API_KEY` | Gemini API 키 |
| `GMAIL_USER` | Gmail 주소 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 (16자리) |
| `TELEGRAM_BOT_TOKEN` | 텔레그램 봇 토큰 |
| `TELEGRAM_CHAT_ID` | 텔레그램 채팅 ID |
| `IG_ACCESS_TOKEN` | Meta Graph API 액세스 토큰 |
| `IG_USER_ID` | 인스타그램 비즈니스 계정 ID |
| `FB_PAGE_ID` | 페이스북 페이지 ID |
| `GOOGLE_API_KEY` | Google API 키 |
| `GOOGLE_DRIVE_FOLDER_ID` | 구글 드라이브 사진 폴더 ID |

---

## 5. ⚠️ Vercel 배포 주의사항 (시행착오 기록)

### 현재 작동하는 배포 구조
```
GitHub Actions 또는 로컬에서:
1. frontend/ 폴더에서 npm install && npm run build
2. frontend/dist/.vercel/project.json에 프로젝트 ID 주입
3. vercel deploy --prod --yes --scope younggonnim-9194s-projects
4. working-directory: frontend/dist
```

### 절대 하지 말 것
- **Root Directory 설정 + working-directory 동시 사용 금지** — 경로가 이중 적용됨
- **기존 "frontend" 프로젝트 사용 금지** — 고장 상태 (Unexpected error 반복)
- **Hobby 플랜에서 GitHub 웹훅 자동 배포 의존 금지** — 커밋 작성자 불일치로 Blocked됨

### 현재 Vercel 프로젝트 정보
- **프로젝트명**: hanbap (신규 생성, 2026-03-18)
- **Project ID**: `prj_cK7iTnVw0BaCOrPmNEtCax1tdPVt`
- **Org ID**: `team_tCe05zvlYk9cxzHfXWWIrD6P`
- **도메인**: `hanbap.vercel.app`
- **Scope**: `younggonnim-9194s-projects`

---

## 6. ✅ 완료된 작업

### 2026-03-18: 시스템 구축
- Gemini API 연동 (OpenAI에서 전환)
- 리뷰 수집 → 랜딩페이지 자동 반영 파이프라인
- GitHub 저장소 연결 및 Actions 스케줄링
- GitHub → Vercel 자동 배포

### 2026-03-18: 고도화
- 점심/저녁 타겟별 마케팅 카피 자동 분기
- 성과 추적 대시보드 (일일 리포트 + 관리자 페이지)
- 주간 이메일 리포트 (매주 월요일)
- 인스타그램 자동 포스팅 GitHub Actions 추가
- 텔레그램 알림 봇 연동

### 2026-03-18: 품질 개선
- **SEO**: 독산동 키워드, 영업시간 브레이크타임, 우편번호, sameAs, og:locale
- **성능**: lazy loading (AdminDashboard, 모달), Zustand 셀렉터, useCallback
- **접근성**: 모달 ARIA/ESC, aria-label, role="alert", 시맨틱 마크업
- **보안**: .env.example 실제 이메일 제거

### 2026-03-19: 안정화 및 보안
- **인스타 토큰**: 영구 Page Access Token으로 교체 (만료 없음)
- **워크플로우 체이닝**: daily-pipeline 완료 후 instagram-post 자동 트리거
- **충돌 방지**: concurrency 그룹 + git pull --rebase 이중 방어
- **토큰 사전 검증**: 인스타 워크플로우에 Graph API 검증 step 추가
- **실패 알림**: 두 워크플로우 모두 실패 시 텔레그램 알림 (토큰 만료/일반 오류 구분)
- **에러 전파**: integrated_auto_promo.js에 process.exit(1) 추가
- **앱 시크릿 재설정**: Meta 앱 시크릿 노출 건 재설정 완료
- **관리자 대시보드 고도화**: 다크테마, 탭(개요/마케팅/리뷰), 시스템상태 모니터, 인스타현황, 30초 자동새로고침, 빠른링크
- **Vercel SPA 라우팅**: vercel.json routes 방식으로 /admin 404 해결

### 2026-03-19: 파이프라인 수정 및 된장찌개 삭제
- **파이프라인 3건 수정**: .gitignore reports/ 해제, Gemini 모델 1.5→2.0, 네이버 더보기 셀렉터 수정
- **워크플로우 권한**: daily-pipeline, instagram-post에 `contents:write`, `actions:write` 추가
- **unstaged changes 해결**: 두 워크플로우에 `git stash` 추가
- **인스타 토큰 검증**: curl `--data-urlencode` 방식으로 변경 (특수문자 토큰 대응)
- **된장찌개 삭제**: 인스타 자동 포스팅 메뉴 목록 및 today_promo.json 초기화
- **TodayPromo 크래시 수정**: null 데이터 시 하얀 화면 방지 (`!promo.itemName` 체크)
- **AdminDashboard 크래시 수정**: promo null 데이터 처리 추가
- **참고 에이전트 추가**: `docs/reference-agents/`에 인스타 큐레이터, 콘텐츠 크리에이터, 한국 비즈니스 내비게이터
- **SKILLS_GUIDE.md 업데이트**: 참고 에이전트 섹션 추가
- **GitHub CLI 설치**: `gh` 인증 완료 (워크플로우 디버깅용)

### 2026-03-20: 디자인 고도화 및 시스템 확립
- **디자인 컨셉 확정**: '고수의 명반 (Refined Heritage)' — 핀터레스트 레퍼런스 스타일의 Warm Minimalist (크림/베이지 톤 + 명조체).
- **기능 통합 시안 완성**: 최신 리뷰 실시간 롤링, 단계별 리워드 링크(네이버/카카오/인스타), 필수/추천 해시태그 섹션 통합.
- **반응형 설계**: 5단계 브레이크포인트를 고려한 정갈한 레이아웃 설계 완료.
- **디자인 스펙 문서화**: `docs/superpowers/specs/2026-03-20-refined-heritage-design.md`에 상세 명세 기록.

---

## 7. 📝 대화 메모리 및 특이사항
- **사용자 선호**: 억지로 꾸민 빈티지보다는 **'진짜배기 고수의 투박함과 정갈함'** 선호. 핀터레스트풍의 차분하고 고급스러운 톤 지향.
- **핵심 가치**: "음식이 맛있다(63명)", "인심이 좋다(34명)"는 실제 데이터를 디자인의 권위로 활용.
- **인스타그램 비주얼**: '정갈한 스튜디오 샷'보다 **'따뜻하고 정겨운 상차림'** 분위기 선호.
- **모바일 연동**: 복잡한 API 설정 대신 파일 직접 수정 통한 간편한 방식 지향.
- **TodayPromo 연동**: 인스타그램 포스팅 시 웹사이트 '오늘의 메뉴' 실시간 동기화 구축됨.

---

## 8. 🔜 남은 작업

### 단기
1. **디자인 시스템 프론트엔드 적용 (최우선)** — `master-visual-pinterest` 시안을 React/Tailwind 코드로 구현.
2. **리뷰 롤링 컴포넌트 개발** — 최신순 자동 롤링 인터페이스 구현.
3. **카카오톡 비즈니스 API 실연동** — 카카오 채널 개설 필요.

---
*Last Updated: 2026-03-20 KST*
