/**
 * AlgoVisualizer AI — 핵심 도메인 타입 정의
 *
 * CLAUDE.md 규칙에 따라 모든 타입은 Zod 스키마에서 추론(z.infer)하거나
 * 명시적 interface 로 정의한다. any 타입은 사용하지 않는다.
 */
import { z } from 'zod';

/* ===================== 복잡도 / 활용사례 ===================== */

export const complexitySchema = z.object({
  /** 최선 시간 복잡도 (예: "O(n)") */
  best: z.string().min(1),
  /** 평균 시간 복잡도 */
  average: z.string().min(1),
  /** 최악 시간 복잡도 */
  worst: z.string().min(1),
  /** 공간 복잡도 */
  space: z.string().min(1),
});
export type ComplexityInfo = z.infer<typeof complexitySchema>;

export const useCaseSchema = z.object({
  /** 실무 활용처 제목 (예: "네비게이션 최단 경로 탐색") */
  title: z.string().min(1),
  /** 어떤 시스템에서 왜 쓰이는지에 대한 구체적 설명 */
  detail: z.string().min(1),
});
export type UseCase = z.infer<typeof useCaseSchema>;

export const algorithmCategorySchema = z.enum(['sorting', 'searching', 'graph', 'dp']);
export type AlgorithmCategory = z.infer<typeof algorithmCategorySchema>;

export const algorithmMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: algorithmCategorySchema,
  /** 한 줄 요약 */
  summary: z.string().min(1),
  /** 동작 원리 설명 */
  howItWorks: z.string().min(1),
  complexity: complexitySchema,
  /** 실무 활용 사례 (최소 1개 필수 — CLAUDE.md 요구사항) */
  useCases: z.array(useCaseSchema).min(1),
  /** 정렬 알고리즘의 안정성 여부 (해당 없으면 생략) */
  stable: z.boolean().optional(),
  /** 참고용 Python 구현 (실무 활용 사례 아래 코드 패널에 표시) */
  pythonCode: z.string().min(1),
});
export type AlgorithmMeta = z.infer<typeof algorithmMetaSchema>;

/* ===================== 시각화 스텝 상태 ===================== */

/** 배열 기반(정렬·탐색·DP) 알고리즘의 한 스텝 */
export interface ArrayStepState {
  kind: 'array';
  /** 현재 배열(또는 DP 테이블) 스냅샷 */
  array: number[];
  /** 비교 중인 인덱스 */
  comparing: number[];
  /** 교환(또는 값 갱신) 중인 인덱스 */
  swapping: number[];
  /** 위치가 확정된 인덱스 */
  settled: number[];
  /** 현재 포커스 인덱스 (없으면 null) */
  pointer: number | null;
  /** 이 스텝에서 무슨 일이 일어나는지에 대한 설명 */
  description: string;
}

/** 그래프 기반 알고리즘의 한 스텝 */
export interface GraphStepState {
  kind: 'graph';
  /** 방문 완료한 노드 id */
  visited: string[];
  /** 큐/스택에 담긴(방문 예정) 노드 id */
  frontier: string[];
  /** 현재 처리 중인 노드 id */
  current: string | null;
  /** 지금까지 지나온 간선 */
  traversedEdges: Array<[string, string]>;
  description: string;
}

export type StepState = ArrayStepState | GraphStepState;

/** StepState 타입 가드 (조건부 렌더링 시 사용) */
export function isArrayStep(step: StepState): step is ArrayStepState {
  return step.kind === 'array';
}
export function isGraphStep(step: StepState): step is GraphStepState {
  return step.kind === 'graph';
}

/* ===================== 그래프 데이터 ===================== */

export interface GraphNodeShape {
  id: string;
  /** SVG 좌표 (0~100 정규화) */
  x: number;
  y: number;
}

export interface GraphData {
  nodes: GraphNodeShape[];
  edges: Array<[string, string]>;
}

/* ===================== 알고리즘 정의(레지스트리) ===================== */

export interface ArrayAlgorithm {
  meta: AlgorithmMeta;
  inputKind: 'array';
  /**
   * 배열(및 탐색 대상값)을 받아 시각화 스텝 배열을 생성한다.
   * 부작용 없이 입력 배열을 복사해 사용해야 한다.
   */
  run(input: number[], target?: number): ArrayStepState[];
}

export interface GraphAlgorithm {
  meta: AlgorithmMeta;
  inputKind: 'graph';
  run(graph: GraphData, start: string): GraphStepState[];
}

export type AlgorithmDef = ArrayAlgorithm | GraphAlgorithm;

export function isArrayAlgorithm(def: AlgorithmDef): def is ArrayAlgorithm {
  return def.inputKind === 'array';
}
