# AlgoVisualizer

알고리즘 동작을 3D/2D로 시각화하고, **시간·공간 복잡도**와 **실무 활용처**를 함께 보여주는 학습 플랫폼.

🔗 **배포 주소**: https://algovisualizer-eight.vercel.app

## 실행

```bash
npm install
npm run dev
```

터미널에 뜬 주소(기본 http://localhost:5173)로 접속하세요.
⚠️ VSCode Live Server로 열면 동작하지 않습니다 (정적 서버는 TypeScript를 실행할 수 없음). 반드시 `npm run dev`로 실행하세요.

## 기술 스택

React 18 · TypeScript · Vite · Tailwind CSS · Zod · Three.js(@react-three/fiber) · 자체 구현 물리 엔진 · Vitest

## 지원 알고리즘 (12종)

- **정렬**: 버블 · 선택 · 삽입 · 병합 · 퀵 · 힙 · 트리
- **탐색**: 선형 · 이진
- **그래프**: BFS · DFS
- **DP**: 피보나치

각 알고리즘은 최선/평균/최악 시간복잡도, 공간복잡도, 실무 활용처(예: 퀵 정렬 → `std::sort`,
이진 탐색 → DB 인덱스 조회, BFS → SNS 친구 추천)를 함께 제공합니다.

## Python 실습 (브라우저 내 컴파일러)

각 알고리즘의 실무 활용처 아래에 Python 참고 구현이 있고, 코드를 직접 고쳐서 **실행** 버튼으로
브라우저에서 바로 돌려볼 수 있습니다. 서버 없이 Pyodide(WASM CPython)가 Web Worker에서 실행되므로
안전하고, 무한 루프를 작성해도 UI가 멈추지 않습니다(15초 타임아웃 후 자동 중단).

## 3D 시각화 & 물리 엔진

`src/physics/engine.ts`에 외부 라이브러리 없이 직접 구현한 물리 엔진(중력·스프링·충돌·반발·마찰)이
3D 모드의 막대/노드 움직임을 구동합니다. WebGL 미지원 환경에서는 2D(Canvas/SVG)로 자동 전환됩니다.

## 프로젝트 구조

```
src/
  types/       # 도메인 타입 + Zod 스키마
  algorithms/  # sorting/ searching/ graph/ dp/ — 카테고리별 로직 + 테스트
  components/  # UI, visualization/2d, visualization/3d
  physics/     # 자체 물리 엔진
  utils/       # 복잡도 계산, LLM 연동, 샘플 데이터
  hooks/       # useStepPlayer, usePythonRunner
public/
  pyodideWorker.js  # Python 실행 Web Worker
```

## 검증 & 배포

```bash
npx tsc --noEmit   # 타입 검사
npm run lint       # ESLint
npm test           # Vitest (94개)
npm run build      # 프로덕션 빌드
npm run deploy     # GitHub Pages 배포
```

Vercel: GitHub 저장소를 import 할 때 **Root Directory를 `MYPROJ`로 지정**하면 `vercel.json`이
자동으로 나머지(Framework: Vite, Output: dist)를 설정합니다.

## LLM 연동 (선택)

`.env.example`을 `.env`로 복사하고 `VITE_LLM_API_KEY`를 채우면 실무 활용처를 AI가 동적으로 생성합니다.
비워두면 내장 데이터로 자동 대체되므로 키 없이도 정상 동작합니다.
