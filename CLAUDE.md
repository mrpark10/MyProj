# 🤖 CLAUDE.md - 알고리즘 시각화 & 복잡도 분석 플랫폼 개발 지침 (Master Protocol)

<<<<<<< HEAD
본 문서는 Claude Code 에이전트가 React(Vite) 기반 알고리즘 시각화 및 복잡도 분석 플랫폼 프로젝트(`MYPROJ`)를 개발할 때 반드시 준수해야 하는 **하네스 엔지니어링(Harness Engineering)**, **프롬프트 엔지니어링**, 그리고 **상세 오류 대응 및 준수 사항** 지침이다.
=======
본 문서는 Claude Code 에이전트가 React(Vite) 기반 알고리즘 시각화 및 복잡도 분석 플랫폼 프로젝트(`algo-visualizer`)를 개발할 때 반드시 준수해야 하는 **하네스 엔지니어링(Harness Engineering)**, **프롬프트 엔지니어링**, 그리고 **상세 오류 대응 및 준수 사항** 지침이다.
>>>>>>> 8f10ced (fe)

---

## 🎯 1. 프로젝트 정체성 & 도메인 맥락

* **프로젝트명**: AlgoVisualizer AI (알고리즘 시각화 및 복잡도 분석 플랫폼)
* **기술 스택**: React (Vite), TypeScript, Tailwind CSS, Zod, Lucide-react, Canvas API / SVG (또는 D3.js)
* **핵심 기능**:
  1. **알고리즘 동적 시각화**: 정렬, 탐색, 그래프, DP 등 세상에 존재하는 다양한 알고리즘의 동작 과정을 인터랙티브하게 시각화
  2. **복잡도 분석**: 알고리즘별 최선/평균/최악 시간 복잡도(Big-O) 및 공간 복잡도 명시
  3. **실무 활용 사례 (Use Cases)**: 각 알고리즘이 실제 현업 시스템, 게임, 데이터베이스, AI 등 어디에 적용되는지 명확한 예시 제시
* **타깃 사용자**: SW 마이스터고 학생, CS/알고리즘을 학습하는 입문자 및 개발자
* **에이전트 역할**: 컴퓨터 과학(CS) 리드 엔지니어이자 알고리즘 전문 멘토

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

/src/types 디렉터리 내의 interface/type 정의(예: AlgorithmNode, ComplexityInfo, StepState 등)를 수정하거나, 타입 가드(Type Guard) 및 Zod 스키마 추론(z.infer<typeof schema>)을 활용하여 올바른 타입을 재정의하라.

2) React Hooks & 애니메이션 Render / Canvas 오류
발생 상황: 시각화 렌더링 중 Rendered more hooks than during the previous render, Infinite Re-render, setInterval/requestAnimationFrame 타이머 누수 또는 DOM/Canvas 참조 오류 발생 시.

대응 지침:

시각화 루프 컨트롤(재생, 일시정지, 속도 조절 등) 시 useRef와 useEffect 클린업 함수를 명확히 작성하여 메모리 누수를 방지하라.

Hook의 조건부 호출을 제거하고 최상단 레벨로 이동시켜라.

3) LLM API JSON 파싱 및 Zod 검증 에러 (알고리즘 상세/활용사례 데이터)
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

애플리케이션 화면이 다운되거나 하얗게 뜨지 않도록 try-catch 블록 내에서 미리 준비된 기본 Mock 알고리즘 데이터(기본 정렬/탐색 시각화 데이터 및 복잡도 정보)를 즉시 반환하는 Fallback 로직을 가동하라.

📌 4. 개발 시 필수 준수 사항 (Strict Do's & Don'ts)
✅ 필수 준수 사항 (Do's)
하네스 루프 준수: 코드 수정 ➡️ npx tsc --noEmit 실행 ➡️ 에러 발생 시 자가 수정 (최대 3회) ➡️ 검증 성공 시에만 완료 보고.

시각화 모듈과 데이터 레이어 분리:

시각화 UI/캔버스(src/components/visualization), 알고리즘 실행 로직/스텝 데이터 생성기(src/algorithms), LLM 활용사례 파서/타입 (src/lib, src/types) 간의 경계를 엄격히 분리하라.

CoT (Chain-of-Thought) 적용: 알고리즘 설명 및 실무 활용처 생성 프롬프트 작성 시 <thought> 분석 태그를 포함하여 정확성을 선검증한 후 JSON을 출력하도록 구성하라.

명확한 시간/공간 복잡도 및 실무 활용처 표기:

각 알고리즘별로 Best, Average, Worst 시간 복잡도와 공간 복잡도를 표/배지로 시각화하라.

단순 학술 설명이 아닌 "Quick Sort: 대용량 메모리 내 정렬 엔진", "Dijkstra: 네비게이션 최단 경로 탐색" 등 실제 시스템 활용처를 반드시 포함하라.

❌ 엄격 금지 사항 (Don'ts)
🚫 검증 없는 완료 보고 금지: 타입 체크 및 테스트를 통과하지 않은 코드를 두고 "작업을 완수했습니다"라고 답변하는 것을 금지한다.

🚫 any 타입 및 임시 주석 사용 금지: any 타입 지정 금지, ts-ignore 주석 사용 금지.

🚫 비동기 예외 처리 및 렌더링 성능 방치 금지: API 호출 및 데이터 파싱 구문에서 try-catch 생략 금지, 대규모 배열 시각화 시 UI가 프리즈(Freeze)되지 않도록 비동기 스텝 분할 기법 적용.

🚫 파괴적 작업 직행 금지: .env 파일 삭제, git reset --hard 등 위험한 작업은 실행 전 사용자의 동의를 얻어라.

🔄 5. 하네스 에이전트 실행 파이프라인 (Execution Flow)
Plaintext
[요청 수신] ➡️ [1. 계획 수립 (Thought)] ➡️ [2. React/Vite 코드 작성 (Action)]
                        ⬆️                                     │
                        │                                      ▼
               [4. 자가 수정 (Retry)] ⬅️ (실패) ⬅️ [3. 타입/빌드 검증 (Validation)]
                                                               │
                                                            (성공)
                                                               ▼
                                                      [5. 작업 완료 보고]