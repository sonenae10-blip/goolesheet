# Google Sheets 기반 TODO 웹앱

정적 프런트엔드(HTML/CSS/JS) + Google Apps Script(Web App) + Google 스프레드시트를 이용한 간단한 TODO 앱입니다. GitHub Pages로 정적 파일을 호스팅하고, Apps Script Web App URL로 통신합니다.

## 폴더 구조

- `google-sheets/index.html` – 앱 HTML
- `google-sheets/styles.css` – 스타일
- `google-sheets/app.js` – 클라이언트 로직(API 호출, 렌더링)
- `google-sheets/gas/Code.gs` – Google Apps Script 백엔드 코드

## 빠른 시작

1) 스프레드시트 생성
- Google Drive에서 스프레드시트를 새로 만들고 시트 탭 이름을 `Tasks`로 합니다(다르면 GAS의 `SHEET_NAME` 수정).
- URL에서 스프레드시트 ID를 복사합니다.
  - 예: `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit` 중간의 `THIS_IS_THE_ID`.

2) Apps Script 프로젝트 생성 및 코드 배치
- https://script.google.com 에서 새 프로젝트를 만듭니다(독립형).
- `google-sheets/gas/Code.gs` 파일 내용을 붙여넣습니다.
- 상단의 상수 `SPREADSHEET_ID` 값을 1)에서 복사한 ID로 교체합니다.
- 저장합니다.

3) 권한 승인(최초 1회)
- Apps Script 에디터에서 `listTasks_` 같은 함수를 실행 ▶️ 해봅니다.
- 권한 요청이 나오면 스프레드시트 접근을 허용합니다.

4) Web App 배포
- 상단 메뉴: 배포 → 배포 관리 → 새 배포 → 유형: "웹 앱" 선택.
- 실행 사용자: "나". 액세스 권한: "모든 사용자"(간단, 익명 허용) 또는 필요에 맞게 선택.
- 배포 후 표시되는 "웹 앱 URL"을 복사해 둡니다.

5) 프런트엔드 API 연결
- `google-sheets/app.js` 상단의 `API_BASE` 값을 4)에서 복사한 URL로 교체합니다.
- 로컬에서 `index.html`을 직접 열거나, GitHub Pages에 배포합니다.

6) GitHub Pages 배포(선택)
- 이 폴더의 3개 파일(`index.html`, `styles.css`, `app.js`)을 GitHub 리포지토리 루트(또는 `docs/`)에 푸시합니다.
- GitHub 리포지토리 → Settings → Pages → Branch를 기본 브랜치로 설정하고 폴더를 `/ (root)` 또는 `/docs`로 선택.
- 할당된 Pages URL에서 접속하여 동작을 확인합니다.

## API 규약

- 목록: `GET API_BASE?action=list`
- 추가: `POST action=add&text=...`
- 토글: `POST action=toggle&id=...`
- 삭제: `POST action=delete&id=...`

모든 응답은 `{ ok: boolean, data?, error? }` JSON입니다. 프리플라이트 없이 동작하도록 `application/x-www-form-urlencoded` POST를 사용합니다.

## 보안 참고

- "모든 사용자" 공개는 누구나 호출 가능합니다. 개인/소규모 용도에선 간단하지만 악의적 호출 가능성이 있습니다.
- 로그인 제한을 원하면 배포 접근 권한을 "Google 계정이 있는 사용자"로 두고, 프런트에서 인증 쿠키를 포함하도록 구현해야 합니다(구현 난이도 증가).
- 간단한 방어로는 서버에서 `?token=...` 파라미터를 검증하는 방법이 있으나 완전한 보안은 아닙니다.

## 시트 구조

첫 번째 행을 `['id','text','done','createdAt','updatedAt']` 헤더로 사용하며, 코드가 자동으로 채웁니다. 시트 이름/헤더를 변경하면 `SHEET_NAME`/`HEADERS`를 같이 수정하세요.

