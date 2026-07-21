# PathForge

소프트웨어마이스터고 학생을 위한 **AI 진로·학습 멘토 챗봇**.
자유롭게 **멀티턴 대화**를 나누고, 특정 분야의 공부법을 물으면 전공별 **상세 학습 로드맵**을 만들어 줍니다.
순수 HTML/CSS/JS + Node 내장 모듈만 사용하며(외부 npm 의존성 0), UI는 토스(Toss) 디자인 스타일입니다.

## 지원 전공 (11개)
프론트엔드 · 백엔드 · DevOps · 임베디드(펌웨어/하드웨어) · Flutter · iOS · Android · AI · UI/UX · 게임 · 보안(Security)

각 전공은 선이수 순서대로 **8~9단계**로 구성되며, 단계마다 카테고리·난이도·예상 시간·설명·**핵심 세부 토픽**까지 상세히 제공합니다.

## 실행 방법
```bash
node server.mjs      # → http://localhost:5173
```
또는 Claude Code의 실행(▶) 버튼(루트 `.claude/launch.json`), 혹은 `index.html`을 브라우저로 직접 열기.

## 스마트 AI 연동 (선택)
서버(`server.mjs`)에 **`ANTHROPIC_API_KEY`** 환경변수를 설정하면, 실제 Claude 모델(`claude-opus-4-8`)이
**대화 맥락을 유지하며 자유롭게 답하고**, 학습 로드맵이 필요한 순간에 로드맵을 함께 생성합니다.
API 키는 서버에만 두어 브라우저에 노출되지 않습니다.

```bash
# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-..."; node server.mjs
# macOS/Linux
ANTHROPIC_API_KEY=sk-ant-... node server.mjs
```

키가 없으면 자동으로 **내장 상세 로드맵(11개 전공) + 기본 응답**으로 폴백하므로, 키 없이도 동작합니다.
(단, 진짜 자유 대화는 API 키가 있을 때 가능하고, 키가 없으면 로드맵 안내 위주로 응답합니다.)

## 파일 구조
```
index.html    # 채팅 UI 구조
styles.css    # 토스 디자인 스타일
roadmaps.js   # 11개 전공 상세 로드맵 데이터 + 전공 키워드 감지 (오프라인 폴백/렌더 공통)
app.js        # 멀티턴 챗봇 UI + 대화 히스토리 관리 + AI 우선 → 로컬 폴백 + 로드맵 렌더링
server.mjs    # 정적 서버 + Claude 멀티턴 대화 프록시 (의존성 0, Node 내장 모듈만)
```

## 멀티턴 대화 방식
1. 브라우저가 **대화 히스토리 전체**를 `POST /api/chat` 로 서버에 보냄 (`{ messages: [{role, content}, ...] }`)
2. 서버에 API 키가 있으면 Claude(`claude-opus-4-8`)가 맥락을 유지하며 `{ reply, roadmap|null }` 형식(structured output)으로 응답 → `{ source: 'ai', reply, roadmap }`
3. 키가 없거나 API 오류면 `{ source: 'local' }` 반환 → 브라우저가 로컬 로직(전공 감지 → 내장 로드맵, 그 외 기본 응답)으로 폴백
4. AI 로드맵과 내장 로드맵은 동일한 스키마라 같은 렌더러로 표시됨
