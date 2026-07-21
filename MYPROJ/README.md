# AlgoVisualizer

알고리즘의 동작 과정을 **인터랙티브하게 시각화**하고, **복잡도(Big-O)** 와 **실무 활용 사례**를 함께 보여주는 학습 플랫폼.
SW 마이스터고 학생 및 CS/알고리즘 입문자를 위한 프로젝트입니다.

## 기술 스택
React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · Zod · Lucide-react
**3D**: Three.js · React Three Fiber · **자체 구현 물리 엔진** (외부 물리 라이브러리 미사용)

## 🧪 자체 구현 물리 엔진
`src/physics/engine.ts` — Three.js에 의존하지 않는 **순수 TypeScript 물리 엔진**을 직접 구현했습니다.

| 구현 요소 | 설명 |
|---|---|
| 반암시적 오일러 적분 | `v += a·dt`, `p += v·dt` |
| 중력 | body별 `gravityScale`로 on/off (그래프 노드는 무중력) |
| 스프링-댐퍼 | 훅의 법칙 `F = -k·x - c·v` 로 목표 위치에 부드럽게 수렴 |
| 바닥 충돌 + 반발 | 반발계수(restitution) 기반 튕김, 관통 방지 |
| 마찰 / 공기저항 | 바닥 마찰 + linear damping |
| 충격량 | `Δv = J / m` — 질량에 반비례하는 속도 변화 |
| 슬리핑 | 미세 진동 시 적분 중단으로 성능 확보 |
| 고정 timestep | 누산기로 프레임레이트와 무관한 **결정적 시뮬레이션** (죽음의 나선 방지) |

**시각화 연동**: 정렬 시 막대는 스프링으로 제자리에 붙잡혀 있다가, 비교/교환 순간 위쪽 충격량을 받아
튀어오르고 중력·반발로 착지합니다. 값이 바뀌면 목표 높이가 바뀌어 스프링이 새 높이로 끌어당깁니다.
그래프 노드는 무중력 상태로 스프링에 고정되어 있다가 방문 시 반동합니다.

물리 엔진은 렌더러 비의존 순수 모듈이라 **Node 환경에서 21개 단위 테스트로 검증**됩니다
(자유낙하 ½gt² 근사, 반발 에너지 손실, 스프링 수렴, Δv=J/m, 슬리핑, 결정성 등).

## 실행 방법
```bash
npm install     # 패키지 설치
npm run dev     # 개발 서버 → http://localhost:5173
```
Claude Code에서는 루트 `.claude/launch.json` 설정으로 실행(▶) 버튼을 눌러 바로 미리보기할 수 있습니다.

## ❗ 화면에 아무것도 안 보일 때
1. **반드시 개발 서버 주소로 접속하세요.** `index.html` 파일을 더블클릭해 열면 동작하지 않습니다.
   → `cd MYPROJ` → `npm install` → `npm run dev` → 터미널에 표시된 주소로 접속
2. **폴더를 확인하세요.** `npm run dev` 는 `D:\MyProj\MYPROJ` 안에서 실행해야 합니다 (상위 폴더 아님).
3. **포트 충돌**: 5173이 이미 사용 중이면 Vite가 5174 등 다른 포트로 뜹니다. 터미널에 찍힌 주소를 그대로 쓰세요.
4. 그래도 안 보이면 브라우저 콘솔(F12)을 확인하세요. 이제는 백지 대신 원인을 안내하는 화면이 표시됩니다.

> 백지 방지 장치가 들어가 있습니다: JS 로딩 실패 시 안내 문구, 렌더링 예외 시 에러 바운더리,
> WebGL 미지원 환경에서는 3D 대신 자동으로 2D로 전환됩니다.

## 검증 명령어 (하네스)
```bash
npx tsc --noEmit   # 타입 검사
npm run lint       # ESLint
npm test           # Vitest 단위 테스트
npm run build      # 프로덕션 빌드
```

## 지원 알고리즘 (10종)
| 분류 | 알고리즘 |
|---|---|
| 정렬 (7) | 버블 · 선택 · 삽입 · 병합 · 퀵 · **힙** · **트리** |
| 탐색 (2) | 선형 탐색 · 이진 탐색 |
| 그래프 (2) | BFS · DFS |
| DP (1) | 피보나치 DP |

각 알고리즘마다 **최선/평균/최악 시간 복잡도 + 공간 복잡도**를 배지로, 정렬은 **안정성(Stable) 여부**까지 표기합니다.

## 주요 기능
- **3D / 2D 전환**: 3D는 물리 엔진 기반(드래그 회전·휠 확대), 2D는 Canvas/SVG 경량 렌더링
- **동적 시각화**: 배열 계열은 막대, 그래프 계열은 노드/간선으로 단계별 렌더링
- **재생 컨트롤**: 재생/일시정지, 단계 이동, 슬라이더 탐색, 속도 조절(0.5x~4x), 새 데이터 생성
- **단계별 설명**: 매 스텝마다 "무슨 일이 일어나는지" 한국어 설명 표시
- **실무 활용 사례**: 학술 설명이 아닌 실제 시스템 적용처 제시
  (예: 퀵 정렬 → DB의 ORDER BY 인메모리 정렬 / 이진 탐색 → B-Tree 인덱스 조회 / BFS → SNS n촌 친구 추천)

## 프로젝트 구조
CLAUDE.md의 모듈 경계 분리 원칙을 따릅니다.
```
src/
  types/algorithm.ts        # 도메인 타입 + Zod 스키마 (단일 진실 공급원)
  algorithms/               # 알고리즘 실행 로직 & 스텝 데이터 생성기 (UI 비의존)
    sorting.ts  searching.ts  graph.ts  dp.ts
    index.ts                #   레지스트리: 메타데이터(복잡도·활용처) + 실행기
    __tests__/              #   단위 테스트
  physics/                  # 자체 구현 물리 엔진 (렌더러 비의존 · 순수 TS)
    engine.ts               #   적분·중력·스프링·충돌·마찰·슬리핑·고정 timestep
    layout.ts               #   스텝 상태 → 3D 좌표/충격량 변환 (순수 함수)
    __tests__/              #   물리 단위 테스트 21개
  components/
    visualization/
      Scene3D.tsx           #   3D 씬 (카메라·조명·바닥·OrbitControls)
      ArrayBars3D.tsx       #   물리 구동 3D 막대
      GraphScene3D.tsx      #   물리 구동 3D 그래프
      ArrayCanvas.tsx  GraphCanvas.tsx   # 2D 렌더링
    ControlPanel  ComplexityPanel  UseCasePanel  AlgorithmSidebar
  hooks/useStepPlayer.ts    # 재생 컨트롤 (타이머 useRef + cleanup)
  lib/
    llm.ts                  # LLM 응답 Sanitizer + Zod 검증 + Fallback
    sampleData.ts           # 샘플 입력 & 카탈로그 검증
```

## API 키 설정 (선택)
활용 사례를 LLM으로 동적 생성하려면 `.env.example`을 복사해 `.env`를 만들고 키를 넣으세요.

```bash
cp .env.example .env    # Windows: copy .env.example .env
```
```env
VITE_LLM_ENDPOINT=http://localhost:8787/api/usecases
VITE_LLM_API_KEY=여기에_발급받은_키
```

값을 비워두면 **내장 활용사례 데이터로 자동 Fallback** 되므로, 키 없이도 앱은 완전히 동작합니다.

> ⚠️ **보안 주의**: `VITE_` 접두사 환경변수는 빌드 결과물에 포함되어 브라우저에 노출됩니다.
> 학습/로컬 실험용으로만 사용하고, 실제 배포 시에는 키를 서버에만 두고 프록시를 경유하세요.
> `.env`는 `.gitignore`에 등록되어 커밋되지 않습니다.
