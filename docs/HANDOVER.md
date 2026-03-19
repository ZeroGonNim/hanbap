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
- **예약 현황**: 2026-03-20 된장찌개 포스팅 예약됨

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
| AI 분석 | Gemini 1.5 Flash (`src/analyzer.ts`) |
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

---

## 7. 📝 대화 메모리 및 특이사항
- **사용자 선호**: 기술 용어 최소화, 한번에 정리해서 전달, 가능한 한 직접 처리
- **인스타그램 비주얼**: '정갈한 스튜디오 샷'보다 **'따뜻하고 정겨운 상차림'** 분위기 선호
- **모바일 연동**: 복잡한 API 설정 대신 파일 직접 수정 통한 간편한 방식 지향
- **TodayPromo 연동**: 인스타그램 포스팅 시 웹사이트 '오늘의 메뉴' 실시간 동기화 구축됨
- **QR코드/오프라인 안내문**: 별도 준비 중 (이 프로젝트 범위 밖)
- **텔레그램 봇**: `@hanbap_noti_bot` (Chat ID: 1898506231)

---

## 8. 🔜 남은 작업

### 단기
1. **카카오톡 비즈니스 API 실연동** — 카카오 채널 개설 필요
2. **네이버 플레이스 답글 AI 초안 생성** — 수집 리뷰별 답글 초안을 reports/에 저장

### 기타 확장
- Gemini API 쿼터 확보 시 AI 이미지 생성 활성화
- ~~관리자 대시보드 추가 기능~~ → 완료 (2026-03-19)
- 웹사이트 디자인 고도화 (Glassmorphism, 브랜드 타이포그래피)
- 마스터 템플릿 구축 (다른 홍보 사이트 재활용)

---
*Last Updated: 2026-03-19 16:00 KST*
