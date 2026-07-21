# 🤖 CLAUDE.md - DevPath AI 개발 및 에이전트 제어 지침 (Master Protocol)

본 문서는 Claude Code 에이전트가 React(Vite) 기반 프로젝트(`MYPROJ`)를 개발할 때 반드시 준수해야 하는 **하네스 엔지니어링(Harness Engineering)**, **프롬프트 엔지니어링**, 그리고 **상세 오류 대응 및 준수 사항** 지침이다.

---

## 🎯 1. 프로젝트 정체성 & 도메인 맥락

* **프로젝트명**: DevPath AI
* **기술 스택**: React (Vite), TypeScript, Tailwind CSS, Zod, Lucide-react
* **목적**: SW 마이스터고 학생 맞춤형 직무별(웹/앱/AI/DevOps) 로드맵 및 챗봇 서비스
* **타깃 사용자**: SW 마이스터고 학생
  * ❌ 대학 학술/이론 위주 커리큘럼 (예: 수치해석학, 정밀 가공학 등)
  * O 실무 중심 스택, 토이 프로젝트, 캡스톤 디자인 주제, 포트폴리오 및 GitHub 연동 중심
* **에이전트 역할**: IT 현업 개발 리드이자 SW 마이스터고 학생들의 1:1 멘토

---

## ⚡ 2. 필수 실행 및 검증 명령어 (Standard Commands)

에이전트는 코드 작성 및 수정 후 반드시 아래 검증 명령어를 실행하여 에러 유무를 스스로 체크해야 한다.

```bash
# [개발 및 빌드]
npm run dev           # Vite 개발 서버 실행
npm run build         # React 앱 생산 빌드 테스트

# [하네스 검증 단축 명령어]
npx tsc --noEmit      # TypeScript 타입 검사 (필수)
npm run lint          # ESLint 코드 스타일 검사
npm test              # Vitest / Jest 단위 테스트 실행
🚨 3. 주요 오류 상황별 자가 수정 지침 (Error Handling Rules)
에이전트는 작업 중 다음과 같은 오류를 마주치면 사용자에게 묻지 않고 즉시 자가 수정(Self-Correction)을 시도해야 한다.

1) TypeScript 타입 에러 (Type Errors)
발생 상황: npx tsc --noEmit 실행 시 Property 'x' does not exist on type 'y' 또는 Type 'any' is not assignable 에러 발생.

대응 지침:

절대로 // @ts-ignore나 any 타입을 남발하여 임시방편으로 해결하지 마라.

/src/types 디렉터리 내의 interface/type 정의를 수정하거나, 타입 가드(Type Guard) 및 Zod 스키마 추론(z.infer<typeof schema>)을 활용하여 올바른 타입을 재정의하라.

2) React Hooks & DOM / Rendering 오류
발생 상황: Rendered more hooks than during the previous render, Hydration/Re-render Infinity Loop 또는 DOM 요소를 참조하지 못하는 에러.

대응 지침:

Hook의 조건부 호출을 제거하고 최상단 레벨로 이동시켜라.

useEffect 내 의존성 배열(Dependency Array) 누락으로 인한 무한 루프 발생 여부를 검토하고 수정하라.

3) LLM API JSON 파싱 및 Zod 검증 에러
발생 상황: LLM 응답값에 마크다운 블록(```json)이나 설명 텍스트가 섞여 JSON.parse() 실패 또는 Zod Schema Validation 에러 발생 시.

대응 지침:

파싱 로직 실행 전 정규식 기반 Sanitizer 함수를 거쳐 순수 JSON 문자열만 추출하도록 코드를 보완하라.

Schema 검증 실패 시, 에러 메시지를 포함하여 LLM에게 자가 수정 재요청(Self-Correction Prompt)을 전송하는 로직을 작동시켜라.

4) 모듈 및 패키지 누락 (Import / Missing Modules)
발생 상황: Cannot find module 'x' 또는 Failed to resolve import 에러 발생.

대응 지침:

npm install <package-name> 명령어로 필요한 패키지를 즉시 설치한 후 재검증하라.

경로 별칭(Path Alias, 예: @/components) 설정 문제일 경우 tsconfig.json 및 vite.config.ts 파일의 alias 설정을 동기화하라.

5) LLM API 연동 실패 / 네트워크 타임아웃
발생 상황: API Key 미설정, 네트워크 오류, LLM 서버 응답 지연 (429/500 에러).

대응 지침:

애플리케이션 화면이 다운되거나 하얗게 뜨지 않도록 try-catch 블록 내에서 미리 준비된 기본 Mock 로드맵 데이터를 즉시 반환하는 Fallback 로직을 가동하라.

📌 4. 개발 시 필수 준수 사항 (Strict Do's & Don'ts)
✅ 필수 준수 사항 (Do's)
하네스 루프 준수: 코드 수정 ➡️ npx tsc --noEmit 실행 ➡️ 에러 발생 시 자가 수정 (최대 3회) ➡️ 검증 성공 시에만 완료 보고.

단방향 데이터 흐름 및 컴포넌트 분리:

UI 레이아웃(src/components), 상태/비즈니스 로직 (src/hooks 또는 src/services), 프롬프트/타입 정의 (src/lib, src/types) 간의 경계를 엄격히 분리하라.

CoT (Chain-of-Thought) 적용: LLM 응답 프롬프트에 <thought> 분석 태그를 포함하여 학생의 상태를 선분석한 후 JSON을 출력하도록 구성하라.

마고 맞춤 실무 커리큘럼 제공: 대학식 단순 학술 과목(수치해석 등)이 아닌, React, Node.js, Docker, FastAPI 등 학생들이 포트폴리오에 바로 녹일 수 있는 기술 스택 및 프로젝트 아이디어를 추천하라.

❌ 엄격 금지 사항 (Don'ts)
🚫 검증 없는 완료 보고 금지: 타입 체크 및 테스트를 통과하지 않은 코드를 두고 "작업을 완수했습니다"라고 답변하는 것을 금지한다.

🚫 any 타입 및 임시 주석 사용 금지: any 타입 지정 금지, ts-ignore 주석 사용 금지.

🚫 비동기 예외 처리 생략 금지: API 호출 및 데이터 파싱 구문에서 try-catch 생략을 금지한다.

🚫 파괴적 작업 직행 금지: .env 파일 삭제, git reset --hard 등 위험한 작업은 실행 전 사용자의 동의를 얻어라.

🔄 5. 하네스 에이전트 실행 파이프라인 (Execution Flow)
[요청 수신] ➡️ [1. 계획 수립 (Thought)] ➡️ [2. React/Vite 코드 작성 (Action)]
                        ⬆️                                     │
                        │                                      ▼
               [4. 자가 수정 (Retry)] ⬅️ (실패) ⬅️ [3. 타입/빌드 검증 (Validation)]
                                                               │
                                                            (성공)
                                                               ▼
                                                      [5. 작업 완료 보고]