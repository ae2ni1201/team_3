# 메디보카 (MediVoca) — 의학용어 단어암기

의료 관련 학과 학생을 위한 **로그인 없는** 의학용어 암기 웹.
플래시카드로 외우고, 검색으로 찾고, 퀴즈로 점검한다.

- 스택: **React + Vite + TypeScript + Supabase + Vercel + GitHub**
- 데이터: 공공데이터 API (없으면 Supabase / 샘플 데이터로 대체)
- 회원가입·로그인·개인정보 저장 **없음**

## 실행 방법

> ⚠️ 이 컴퓨터에는 아직 Node.js가 설치되어 있지 않습니다.
> [https://nodejs.org](https://nodejs.org) 에서 LTS 버전을 설치한 뒤 아래를 실행하세요.

```bash
npm install          # 처음 한 번 (의존성 설치)
cp .env.example .env.local   # 환경변수 파일 만들기 (값은 팀 리더에게)
npm run dev          # 개발 서버 실행 → http://localhost:5173
```

환경변수(`.env.local`)를 채우지 않아도 **샘플 용어 15개로 데모가 돌아갑니다.**

## 폴더 구조

```
src/
  components/   공통 컴포넌트 (Header 등)
  pages/        화면 (Home / Search / Flashcard / Quiz)
  services/     데이터 연결 (publicDataApi, supabase)
  data/         샘플 데이터 (fallback)
  types/        공통 타입 (MedicalTerm)
```

## 팀 협업 방식 (데모: 2인 팀)

`main` 브랜치에는 **직접 푸시하지 않습니다.** 각자 브랜치에서 작업하고 Pull Request로 병합합니다.

| 팀원 | 브랜치 | 담당 |
|------|--------|------|
| A (데이터) | `feature/data-search` | 공공데이터 API 연결(`services/`), Supabase, 검색(`SearchPage`) |
| B (기능/화면) | `feature/flashcard-quiz` | 플래시카드(`FlashcardPage`), 퀴즈(`QuizPage`), 공통 UI |

작업 순서: `git switch main && git pull` → 자기 브랜치로 이동 → 담당 파일만 수정 →
작은 단위 커밋 → push → **PR 생성** → 리뷰 → `main` 병합.

커밋 메시지 예: `feat: 공공데이터 API 연결`, `feat: 플래시카드 뒤집기 추가`, `fix: 모바일 카드 잘림 수정`

## 주의
- API 키·Supabase 키는 `.env.local`(→ `.gitignore`)에만. **GitHub·채팅방에 올리지 않기.**
- Vercel 배포 시 환경변수는 Vercel 프로젝트 설정에 등록.
- 개인정보(이름·전화번호·이메일)는 입력받지도 저장하지도 않습니다.
