# AlgoVisualizer

알고리즘 동작 과정을 **인터랙티브하게 시각화**하고, 각 알고리즘의 **시간/공간 복잡도**와 **실무 활용 사례**를 함께 제공하는 학습 앱입니다.

## 프로젝트 개요

- React + TypeScript + Vite 기반 애플리케이션
- 배열 정렬, 탐색, 그래프 알고리즘, DP를 단계별로 시각화
- 3D 물리 엔진 기반 시각화와 2D Canvas/SVG 렌더링을 모두 지원
- LLM 활용 사례를 자동 검증/Fallback 처리하는 구조 포함

## 주요 기능

- **알고리즘 단계 시각화**: 정렬은 막대, 그래프는 노드/간선 형태로 표현
- **복잡도 표시**: 최선/평균/최악 시간 복잡도 및 공간 복잡도 배지 표시
- **실무 활용 사례**: 알고리즘이 실제 시스템에서 어떻게 쓰이는지 예시 제공
- **재생 컨트롤**: 재생/일시정지, 단계 이동, 슬라이더 탐색, 속도 조절
- **3D/2D 전환**: 3D는 Three.js 기반, 2D는 Canvas/SVG 경량 렌더링
- **애플리케이션 보호**: 로딩 실패 시 백지 방지 UI 및 렌더링 예외 처리를 포함

## 기술 스택

- React 18
- Vite 5
- TypeScript
- Tailwind CSS 3
- Zod
- Lucide-react
- Three.js / @react-three/fiber / @react-three/drei

## 폴더 구조

```
algo-visualizer/
├─ public/ (없음)               # Vite 앱의 정적 리소스 폴더가 없으면 기본 사용
├─ src/
│  ├─ algorithms/               # 알고리즘 실행 로직 및 단계 데이터 생성기
│  │  ├─ sorting.ts
│  │  ├─ searching.ts
│  │  ├─ graph.ts
│  │  ├─ dp.ts
│  │  ├─ index.ts              # 알고리즘 레지스트리 및 메타데이터
│  │  └─ __tests__/             # 알고리즘 단위 테스트
│  ├─ components/               # UI 컴포넌트
│  │  ├─ AlgorithmSidebar.tsx
│  │  ├─ ControlPanel.tsx
│  │  ├─ ComplexityPanel.tsx
│  │  ├─ UseCasePanel.tsx
│  │  └─ visualization/
│  │     ├─ ArrayBars3D.tsx
│  │     ├─ ArrayCanvas.tsx
│  │     ├─ GraphCanvas.tsx
│  │     ├─ GraphScene3D.tsx
│  │     └─ Scene3D.tsx
│  ├─ physics/                  # 자체 물리 엔진 및 레이아웃 변환
│  │  ├─ engine.ts
│  │  ├─ layout.ts
│  │  └─ __tests__/
│  ├─ lib/                      # LLM 및 샘플 데이터 헬퍼
│  │  ├─ llm.ts
│  │  └─ sampleData.ts
│  ├─ hooks/
│  │  └─ useStepPlayer.ts
│  ├─ harness/
│  │  └─ dagValidator.ts
│  ├─ types/
│  │  └─ algorithm.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ postcss.config.js
├─ tailwind.config.js
└─ .env.example
```

## 실행 방법

```bash
cd algo-visualizer
npm install
npm run dev
```

개발 서버가 실행되면 터미널에 표시된 로컬 주소로 웹 앱을 엽니다.

## 검증 명령어

```bash
cd algo-visualizer
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## 지원 알고리즘

- 정렬: 버블, 선택, 삽입, 병합, 퀵, 힙, 트리
- 탐색: 선형 탐색, 이진 탐색
- 그래프: BFS, DFS
- DP: 피보나치 DP

## 유의사항

- `index.html` 파일을 직접 더블클릭해서 열면 Vite 개발 서버가 제공하는 모듈 로딩이 동작하지 않습니다.
- 항상 `algo-visualizer` 폴더 안에서 `npm run dev`를 실행하세요.
- LLM API 키를 사용할 경우 `.env.example`를 복사해 `.env`로 저장하고 `VITE_LLM_API_KEY`를 설정하세요.
