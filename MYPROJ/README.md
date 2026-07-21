# AlgoVisualizer — 기술 명세서

알고리즘의 동작 과정을 3D/2D로 시각화하고, **시간·공간 복잡도(Big-O)** 와 **실무 활용처**를
한 화면에서 분석하는 학습 플랫폼. SW 마이스터고 학생 및 CS 입문자를 대상으로 한다.

---

## 1. 개요

| 항목 | 내용 |
|---|---|
| 목적 | 알고리즘 시각화 · 시간/공간 복잡도 분석 · 실무 활용처 제시 |
| 대상 | SW 마이스터고 학생, CS/알고리즘 입문자 |
| 실행 | `npm install && npm run dev` → http://localhost:5173 |
| 배포 | GitHub Pages (`npm run deploy`) |

## 2. 기술 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | React 18 · TypeScript 5 (strict) |
| 빌드 도구 | Vite 5 |
| 스타일 | Tailwind CSS 3 |
| 데이터 검증 | Zod (Zod 스키마 → `z.infer` 타입 추론) |
| 아이콘 | Lucide-react |
| 3D 렌더링 | Three.js · @react-three/fiber · @react-three/drei |
| 물리 시뮬레이션 | **자체 구현 물리 엔진** (외부 물리 라이브러리 미사용) |
| 테스트 | Vitest |
| 배포 | gh-pages |

## 3. 알고리즘 시각화

### 3.1 지원 알고리즘 (12종)

| 분류 | 알고리즘 | 개수 |
|---|---|---|
| 정렬 | 버블 · 선택 · 삽입 · 병합 · 퀵 · 힙 · 트리 | 7 |
| 탐색 | 선형 탐색 · 이진 탐색 | 2 |
| 그래프 | BFS(너비 우선) · DFS(깊이 우선) | 2 |
| 동적 계획법 | 피보나치 DP | 1 |

### 3.2 렌더링 방식

- **3D 모드**: 자체 구현 물리 엔진이 막대/노드의 움직임을 구동 (중력·스프링·반발·충격량). 드래그 회전, 휠 확대/축소 지원.
- **2D 모드**: Canvas API(배열) / SVG(그래프) 기반 경량 렌더링.
- 두 모드는 언제든 토글 가능하며, WebGL을 지원하지 않는 환경에서는 2D로 자동 전환된다.

### 3.3 스텝 기반 상태 모델

모든 알고리즘은 실행 로직과 시각화를 분리하기 위해, 매 연산 단계를 `StepState` 스냅샷 배열로 미리 생성한다.

```ts
// 배열 계열 (정렬·탐색·DP)
interface ArrayStepState {
  kind: 'array';
  array: number[];
  comparing: number[];   // 비교 중인 인덱스
  swapping: number[];    // 교환/갱신 중인 인덱스
  settled: number[];     // 위치 확정된 인덱스
  pointer: number | null;
  description: string;   // 이 단계에서 일어나는 일 (한국어 설명)
}

// 그래프 계열 (BFS·DFS)
interface GraphStepState {
  kind: 'graph';
  visited: string[];
  frontier: string[];    // 큐/스택 대기 중인 노드
  current: string | null;
  traversedEdges: Array<[string, string]>;
  description: string;
}
```

재생 컨트롤(`useStepPlayer`)은 이 배열의 인덱스를 이동시키는 것만으로 재생/일시정지/속도조절/구간이동을 구현한다.

## 4. 시간·공간 복잡도 분석

### 4.1 표기 기준

각 알고리즘 메타데이터(`AlgorithmMeta`)는 다음을 **필수로** 포함하며 Zod 스키마로 런타임 검증한다.

```ts
interface ComplexityInfo {
  best: string;     // 최선의 경우 (예: "O(n)")
  average: string;  // 평균의 경우
  worst: string;    // 최악의 경우
  space: string;    // 공간 복잡도
}
```

UI(`ComplexityPanel`)는 Best / Average / Worst 3열 배지와 공간 복잡도, 정렬 알고리즘의 경우
**안정성(Stable) 여부**까지 함께 표시한다.

### 4.2 등급 분류 (`src/utils/complexity.ts`)

복잡도 문자열을 5단계 등급(`constant` < `log` < `linearithmic` < `other` < `quadratic`)으로 분류해
배지 색상과 상대적 우열을 계산한다. 색상 매핑, 등급 비교(`compareComplexity`), 단조성 검증
(`isMonotonicComplexity`: best ≤ average ≤ worst)을 순수 함수로 제공한다.

### 4.3 알고리즘별 복잡도 요약

| 알고리즘 | Best | Average | Worst | Space |
|---|---|---|---|---|
| 버블 정렬 | O(n) | O(n²) | O(n²) | O(1) |
| 선택 정렬 | O(n²) | O(n²) | O(n²) | O(1) |
| 삽입 정렬 | O(n) | O(n²) | O(n²) | O(1) |
| 병합 정렬 | O(n log n) | O(n log n) | O(n log n) | O(n) |
| 퀵 정렬 | O(n log n) | O(n log n) | O(n²) | O(log n) |
| 힙 정렬 | O(n log n) | O(n log n) | O(n log n) | O(1) |
| 트리 정렬 | O(n log n) | O(n log n) | O(n²) | O(n) |
| 선형 탐색 | O(1) | O(n) | O(n) | O(1) |
| 이진 탐색 | O(1) | O(log n) | O(log n) | O(1) |
| BFS / DFS | O(V+E) | O(V+E) | O(V+E) | O(V) |
| 피보나치 DP | O(n) | O(n) | O(n) | O(n) |

## 5. 실무 활용처

CLAUDE.md 지침에 따라 학술적 설명에 그치지 않고, 각 알고리즘이 실제 시스템 어디에 쓰이는지
2개 이상의 구체적 사례(`UseCase[]`)를 필수로 제시한다.

| 알고리즘 | 실무 활용처 예시 |
|---|---|
| 퀵 정렬 | C++ `std::sort`의 IntroSort, RDBMS `ORDER BY` 인메모리 정렬 |
| 병합 정렬 | 대용량 로그 파일 External Merge Sort, Java/Python 표준 정렬(TimSort) |
| 힙 정렬 | OS 프로세스 스케줄러의 우선순위 큐, 메모리 상한이 중요한 임베디드 시스템 |
| 트리 정렬 | DB 인덱스(B-Tree/Red-Black Tree) 구축, 실시간 랭킹 시스템 |
| 이진 탐색 | RDBMS B-Tree 인덱스 조회, 파라메트릭 서치(오토스케일링 임계치 계산) |
| BFS | SNS n촌 친구 추천, 가중치 없는 그래프의 최단 경로 |
| DFS | 빌드 의존성 해석(위상 정렬), 절차적 미로 생성 |
| 피보나치 DP | 자원 배분 최적화, Git diff의 편집 거리(Edit Distance) 계산 |

LLM 연동 시(§8) 활용처를 AI가 동적으로 생성할 수 있으며, 실패 시 위 내장 데이터로 즉시 대체된다.

## 6. 자체 구현 물리 엔진

`src/physics/engine.ts` — 렌더러(Three.js)에 의존하지 않는 순수 TypeScript 물리 엔진.

| 구현 요소 | 설명 |
|---|---|
| 반암시적 오일러 적분 | `v += a·dt`, `p += v·dt` |
| 중력 | body별 `gravityScale`로 on/off (그래프 노드는 무중력) |
| 스프링-댐퍼 | 훅의 법칙 `F = -k·x - c·v`로 목표 위치에 수렴 |
| 바닥 충돌 + 반발 | 반발계수(restitution) 기반 튕김, 관통 방지 |
| 마찰 / 공기저항 | 바닥 마찰 + linear damping |
| 충격량 | `Δv = J / m` |
| 슬리핑 | 미세 진동 시 적분 중단 |
| 고정 timestep | 누산기 기반 결정적 시뮬레이션 |

렌더러 비의존 모듈이라 Node 환경에서 21개 단위 테스트로 검증한다(자유낙하 근사, 반발 에너지
손실, 스프링 수렴, Δv=J/m, 슬리핑, 결정성 등).

## 7. 프로젝트 구조

CLAUDE.md 모듈 경계 분리 원칙에 따라 4계층으로 구성한다.

```
src/
  types/                     # 도메인 타입 + Zod 스키마 (단일 진실 공급원)
    algorithm.ts             #   AlgorithmMeta, ComplexityInfo, StepState 등

  algorithms/                # 정렬·탐색·그래프·DP 시각화 스텝 로직 (UI 비의존)
    sorting.ts                 버블·선택·삽입·병합·퀵
    treeSorting.ts              힙·트리
    searching.ts                선형·이진 탐색
    graph.ts                    BFS·DFS
    dp.ts                       피보나치 DP
    index.ts                  # 레지스트리: 메타데이터(복잡도·활용처) + 실행기
    __tests__/                # 알고리즘 단위 테스트

  utils/                     # 컴플렉서티 계산 & Helper 함수
    complexity.ts             # Big-O 등급 분류, 배지 색상, 비교 함수
    llm.ts                    # LLM 응답 Sanitizer + Zod 검증 + Fallback
    sampleData.ts              # 샘플 입력 생성, 카탈로그 검증
    capabilities.ts            # WebGL 지원 여부 탐지
    __tests__/                 # 유틸 단위 테스트

  components/                # UI 컴포넌트
    visualization/
      Scene3D.tsx              3D 씬 (카메라·조명·바닥·OrbitControls)
      ArrayBars3D.tsx          물리 구동 3D 막대
      GraphScene3D.tsx         물리 구동 3D 그래프
      ArrayCanvas.tsx / GraphCanvas.tsx   2D 렌더링
    ControlPanel.tsx           재생 컨트롤
    ComplexityPanel.tsx        복잡도 배지 패널
    UseCasePanel.tsx           실무 활용처 패널
    AlgorithmSidebar.tsx       알고리즘 선택 사이드바
    ErrorBoundary.tsx          렌더링 예외 방어

  physics/                   # 자체 구현 물리 엔진 (렌더러 비의존)
    engine.ts  layout.ts  __tests__/

  hooks/
    useStepPlayer.ts           재생 컨트롤 훅 (타이머 useRef + cleanup)
```

## 8. LLM 연동 (선택)

활용처를 LLM으로 동적 생성하려면 `.env.example`을 복사해 `.env`를 만들고 키를 넣는다.

```bash
cp .env.example .env
```
```env
VITE_LLM_ENDPOINT=http://localhost:8787/api/usecases
VITE_LLM_API_KEY=여기에_발급받은_키
```

값을 비워두면 §5의 내장 데이터로 자동 Fallback되므로 키 없이도 앱은 완전히 동작한다.

> ⚠️ `VITE_` 접두사 환경변수는 빌드 결과물에 포함되어 브라우저에 노출된다. 학습/로컬 실험용으로만
> 사용하고, 실제 배포 시에는 키를 서버에만 두고 프록시를 경유해야 한다. `.env`는 `.gitignore`에
> 등록되어 커밋되지 않는다.

## 9. 검증 & 배포 명령어

```bash
# 하네스 검증
npx tsc --noEmit   # 타입 검사
npm run lint       # ESLint
npm test           # Vitest 단위 테스트
npm run build      # 프로덕션 빌드 (상대 경로 base)

# GitHub Pages 배포
npm run deploy      # build:gh-pages → gh-pages -d dist
```

`vite.config.ts`의 `base`는 일반 빌드 시 `'./'`(상대 경로, 어디에 배포해도 안전)를 쓰고,
`--mode gh-pages`로 빌드하면 GitHub Pages 프로젝트 경로(`/MyProj/`)에 맞춰진다.

## 10. 트러블슈팅

1. **화면이 비어 보임**: `index.html`을 더블클릭해 열면 동작하지 않는다. 반드시
   `npm run dev` 실행 후 터미널에 표시된 주소로 접속해야 한다.
2. **폴더 위치**: `npm run dev`는 `MYPROJ` 디렉터리 안에서 실행해야 한다.
3. **포트 충돌**: 5173이 사용 중이면 Vite가 다른 포트로 뜬다. 터미널에 찍힌 주소를 사용한다.
4. 백지 방지 장치 내장: JS 로딩 실패 시 안내 문구(`index.html`), 렌더링 예외 시 에러
   바운더리(`ErrorBoundary`), WebGL 미지원 시 3D→2D 자동 전환(`capabilities.ts`).
