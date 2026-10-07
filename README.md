# 나의 일하는 방식 — Vercel 배포본 (이유 질문 버전)

- `/` 검사 화면. 12문항을 끝내고 결과를 본 응답자의 기록이 익명으로 서버에 저장됩니다.
- `/admin` 응답 내려받기 화면. 관리자 키를 넣으면 전체 응답을 CSV/JSON으로 받습니다.
- `/?research=1` 문항 설계 근거, `/?debug=1` 디버그 패널.

## 구성
- `public/index.html` 검사 화면 (단일 HTML, 서체 내장)
- `public/admin.html` 응답 내려받기
- `api/submit.js` 응답 저장 (POST)
- `api/export.js` 전체 응답 조회 (GET, `x-admin-key` 헤더 필요)
- `lib/store.js` Vercel Blob 비공개 저장소에 `responses/<세션>.json`으로 저장

## 배포 순서
1. `npm install`
2. `npx vercel login` 후 `npx vercel link` (새 프로젝트 생성)
3. Vercel 대시보드 → 프로젝트 → Storage → Blob 저장소 생성(접근 방식: **Private**) 후 이 프로젝트에 연결
   → 환경 변수 `BLOB_READ_WRITE_TOKEN`이 자동으로 생깁니다.
4. 관리자 키 설정: `npx vercel env add ADMIN_KEY production` (추측하기 어려운 긴 문자열)
5. `npx vercel --prod`

## 확인
- 검사 한 번 완료 → `/admin`에서 키 입력 → 1건이 보이면 정상입니다.
- 저장소가 연결되지 않으면 검사 화면은 그대로 동작하지만 응답이 저장되지 않습니다(`/admin`에 오류 안내 표시).

## 참고
- 같은 브라우저의 같은 세션은 한 건으로 덮어씁니다. '처음부터 다시 해보기'를 누르면 새 세션이 됩니다.
- 이름·소속·IP는 저장하지 않습니다. 자유서술 칸에 응답자가 직접 적은 내용은 그대로 저장됩니다.
- 응답 전송을 끄려면 `public/index.html`의 `SUBMIT_URL`을 빈 문자열로 바꿉니다.
