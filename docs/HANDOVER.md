# 🤖 Project Handover: 한마음식당 마케팅 자동화 시스템

이 문서는 한마음식당 마케팅 자동화 프로젝트의 현재 상태와 기술적 명세를 기록합니다. 대화가 종료된 후에도 다음 작업자가 이 내용을 바탕으로 작업을 즉시 재개할 수 있습니다.

---

## 1. 🚀 시스템 현황 (Status: 운영 중)

### 자동화 파이프라인
- **매일 09:00 KST** — GitHub Actions가 리뷰 수집 → Gemini 분석 → 랜딩페이지 리뷰 업데이트 → Vercel 자동 배포
- **매주 월요일 09:00 KST** — 주간 성과 이메일 리포트 발송 (younggonnim@gmail.com)
- **코드 푸시 시** — GitHub Actions → Vercel CLI 자동 배포

### 인스타그램 자동 포스팅
- **계정**: [@hanbap_doksan](https://www.instagram.com/hanbap_doksan/)
- **핵심 기술**: Node.js, Meta Graph API, Google Drive API, Gemini
- **발행 비율**: 메뉴 홍보(70%) / 고객 리뷰(30%) 무작위 교차 발행
- **예약 시스템**: `scheduled_posts.json` 통해 특정 날짜 포스팅 선점

---

## 2. 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | TypeScript, Node.js, Playwright, Zod |
| AI 분석 | Gemini 1.5 Flash (`src/analyzer.ts`) |
| 프론트엔드 | React 19, Tailwind CSS 4, Zustand, Framer Motion, Vite |
| 배포 | Vercel (CLI 배포 방식), GitHub Actions |
| 이메일 | Nodemailer + Gmail SMTP |
| 저장소 | GitHub (ZeroGonNim/hanbap) |

---

## 3. 📂 주요 파일 및 경로

### 백엔드 (자동화)
| 파일 | 역할 |
|------|------|
| `src/pipeline.ts` | 전체 워크플로우 오케스트레이션 (수집→분석→저장→배포) |
| `src/collector.ts` | 4개 플랫폼 리뷰 크롤러 (네이버/카카오/구글/블로그) |
| `src/analyzer.ts` | Gemini 기반 점심/저녁 타겟별 마케팅 카피 생성 |
| `src/reporter.ts` | 일일 리포트 + 프론트엔드 JSON Feed + stats.json 생성 |
| `src/mailer.ts` | Gmail SMTP 이메일 발송 |
| `src/weekly_report.ts` | 주간 리포트 집계 및 이메일 발송 |

### 프론트엔드
| 파일 | 역할 |
|------|------|
| `frontend/src/main.tsx` | 라우팅 분기 (`/admin` → AdminDashboard) |
| `frontend/src/App.tsx` | 메인 랜딩페이지 |
| `frontend/src/pages/AdminDashboard.tsx` | 관리자 대시보드 (비밀번호: hanbap2026) |
| `frontend/src/data/reviews.json` | 파이프라인이 자동 업데이트하는 리뷰 데이터 |
| `frontend/public/stats.json` | 관리자 대시보드용 통계 데이터 |

### 인스타그램 자동화
| 파일 | 역할 |
|------|------|
| `scripts/instagram_automation/integrated_auto_promo.js` | 통합 자동 포스팅 |
| `scripts/instagram_automation/.env` | 토큰 및 API 키 |
| `scripts/instagram_automation/scheduled_posts.json` | 예약 장부 |

### GitHub Actions 워크플로우
| 파일 | 스케줄 |
|------|--------|
| `.github/workflows/daily-pipeline.yml` | 매일 09:00 KST — 리뷰 수집 파이프라인 |
| `.github/workflows/weekly-report.yml` | 매주 월요일 09:00 KST — 주간 이메일 |
| `.github/workflows/deploy.yml` | main 푸시 시 — Vercel 자동 배포 |

---

## 4. 🔑 환경변수 및 시크릿

### 로컬 `.env` (루트)
```
GEMINI_API_KEY=...
GMAIL_USER=younggonnim@gmail.com
GMAIL_APP_PASSWORD=...
```

### GitHub Secrets (ZeroGonNim/hanbap → Settings → Secrets)
```
VERCEL_TOKEN — Vercel 배포용 토큰
GEMINI_API_KEY — Gemini API 키
GMAIL_USER — Gmail 주소
GMAIL_APP_PASSWORD — Gmail 앱 비밀번호 (16자리)
```

---

## 5. ⚠️ Vercel 배포 주의사항 (시행착오 기록)

### 현재 작동하는 배포 구조
```
GitHub Actions에서:
1. frontend/ 폴더에서 npm install && npm run build
2. frontend/dist/.vercel/project.json에 프로젝트 ID 주입
3. vercel deploy --prod --yes --token=TOKEN --scope younggonnim-9194s-projects
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

## 6. 📝 대화 메모리 및 특이사항
- **사용자 선호**: 기술 용어 최소화, 한번에 정리해서 전달, 가능한 한 직접 처리
- **인스타그램 비주얼**: '정갈한 스튜디오 샷'보다 **'따뜻하고 정겨운 상차림'** 분위기 선호
- **모바일 연동**: 복잡한 API 설정 대신 파일 직접 수정 통한 간편한 방식 지향
- **TodayPromo 연동**: 인스타그램 포스팅 시 웹사이트 '오늘의 메뉴' 실시간 동기화 구축됨
- **QR코드/오프라인 안내문**: 별도 준비 중 (이 프로젝트 범위 밖)

---

## 7. 🔜 남은 작업

### 단기
1. **카카오톡 비즈니스 API 실연동** — 카카오 채널 개설 필요
2. **네이버 플레이스 답글 AI 초안 생성** — 수집 리뷰별 답글 초안을 reports/에 저장

### 기타 확장
- Gemini API 쿼터 확보 시 AI 이미지 생성 활성화
- 관리자 대시보드 A방식 추가 기능 (실시간 Vercel Analytics 연동)
- 웹사이트 디자인 고도화 (Glassmorphism, 브랜드 타이포그래피)
- 마스터 템플릿 구축 (다른 홍보 사이트 재활용)

---
*Last Updated: 2026-03-18 15:30 KST*
