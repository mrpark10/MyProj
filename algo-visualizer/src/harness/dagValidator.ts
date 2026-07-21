/**
 * dagValidator — 로드맵 위계성(선이수 관계) 검증기 (하네스 레이어)
 *
 * 로드맵은 방향 비순환 그래프(DAG, Directed Acyclic Graph)여야 한다.
 * 간선 source→target 은 "source 를 먼저, target 을 나중에 학습" 을 의미하므로,
 * 순환이 존재하면 학습 순서를 정할 수 없는 잘못된 로드맵이다.
 * (예: JavaScript → React → JavaScript 처럼 되돌아오면 위계성 오류)
 *
 * 본 모듈은 다음을 수행한다.
 *   1. 간선이 참조하는 노드가 실제로 존재하는지 검증(무결성 검사)
 *   2. Kahn 알고리즘으로 위상 정렬을 시도하여 순환 여부를 판정
 *   3. 정상이면 위상 정렬된 노드 순서를 담아 재반환
 *      순환이면 순환에 연루된 노드 목록과 함께 실패를 반환
 *
 * UI/에이전트가 결과를 기계적으로 처리할 수 있도록 규격화된 JSON 형태의
 * 판별 유니온(discriminated union) 결과를 반환한다.
 */

import type { Roadmap, RoadmapNode } from '@/types/roadmap';

/** 검증 실패 사유 코드 */
export type DagValidationErrorCode = 'CYCLE_DETECTED' | 'UNKNOWN_NODE_REFERENCE' | 'DUPLICATE_NODE_ID';

/** 개별 검증 오류 상세 */
export interface DagValidationError {
  code: DagValidationErrorCode;
  message: string;
  /** 오류에 연루된 노드 id 목록 (순환 경로 또는 문제 노드) */
  nodeIds: string[];
}

/**
 * 검증 결과 (판별 유니온).
 * - valid=true  : `sortedNodes` 에 위상 정렬된 학습 순서가 담긴다.
 * - valid=false : `errors` 에 실패 원인이 담기며, 정렬 가능한 부분까지의
 *                 `sortedNodes` 는 비어 있다(순환 시 순서 보장 불가).
 */
export type DagValidationResult =
  | { valid: true; sortedNodes: RoadmapNode[]; errors: [] }
  | { valid: false; sortedNodes: RoadmapNode[]; errors: DagValidationError[] };

/**
 * 로드맵의 위계성을 검증하고, 정상일 경우 위상 정렬된 로드맵 노드를 반환한다.
 *
 * @param roadmap 검증 대상 로드맵(노드 + 선이수 간선)
 * @returns 규격화된 검증 결과
 */
export function validateRoadmapDag(roadmap: Roadmap): DagValidationResult {
  const errors: DagValidationError[] = [];

  // --- 1) 노드 인덱싱 및 중복 id 검사 -------------------------------------
  const nodeById = new Map<string, RoadmapNode>();
  const duplicateIds: string[] = [];
  for (const node of roadmap.nodes) {
    if (nodeById.has(node.id)) {
      duplicateIds.push(node.id);
      continue;
    }
    nodeById.set(node.id, node);
  }
  if (duplicateIds.length > 0) {
    errors.push({
      code: 'DUPLICATE_NODE_ID',
      message: `중복된 노드 id 가 존재합니다: ${[...new Set(duplicateIds)].join(', ')}`,
      nodeIds: [...new Set(duplicateIds)],
    });
  }

  // --- 2) 간선 무결성 검사 (참조 노드 존재 여부) ---------------------------
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  for (const id of nodeById.keys()) {
    indegree.set(id, 0);
    adjacency.set(id, []);
  }

  const unknownRefs = new Set<string>();
  for (const edge of roadmap.edges) {
    if (!nodeById.has(edge.source)) unknownRefs.add(edge.source);
    if (!nodeById.has(edge.target)) unknownRefs.add(edge.target);
    // 참조가 유효한 간선만 그래프에 반영한다.
    if (nodeById.has(edge.source) && nodeById.has(edge.target)) {
      adjacency.get(edge.source)!.push(edge.target);
      indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
    }
  }
  if (unknownRefs.size > 0) {
    errors.push({
      code: 'UNKNOWN_NODE_REFERENCE',
      message: `존재하지 않는 노드를 참조하는 간선이 있습니다: ${[...unknownRefs].join(', ')}`,
      nodeIds: [...unknownRefs],
    });
  }

  // --- 3) Kahn 알고리즘 위상 정렬 (순환 탐지) -----------------------------
  // 진입 차수 0 인 노드를 큐에 넣고 반복적으로 제거한다.
  // 결정적(deterministic) 결과를 위해 노드는 선언 순서를 유지한다.
  const queue: string[] = [];
  for (const node of roadmap.nodes) {
    if (nodeById.get(node.id) === node && (indegree.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
    }
  }

  const sortedIds: string[] = [];
  let head = 0;
  while (head < queue.length) {
    const currentId = queue[head++];
    sortedIds.push(currentId);
    for (const nextId of adjacency.get(currentId) ?? []) {
      const remaining = (indegree.get(nextId) ?? 0) - 1;
      indegree.set(nextId, remaining);
      if (remaining === 0) queue.push(nextId);
    }
  }

  // 정렬된 노드 수가 전체 노드 수보다 적으면 순환이 존재한다.
  if (sortedIds.length < nodeById.size) {
    const cycleNodeIds = [...nodeById.keys()].filter((id) => !sortedIds.includes(id));
    errors.push({
      code: 'CYCLE_DETECTED',
      message: `선이수 관계에 순환이 존재하여 학습 순서를 정할 수 없습니다. 연루 노드: ${cycleNodeIds.join(', ')}`,
      nodeIds: cycleNodeIds,
    });
  }

  if (errors.length > 0) {
    return { valid: false, sortedNodes: [], errors };
  }

  // 정상: 위상 정렬된 노드 배열을 재구성하여 반환한다.
  const sortedNodes = sortedIds.map((id) => nodeById.get(id)!);
  return { valid: true, sortedNodes, errors: [] };
}

/**
 * 편의 함수 — 검증 후 정렬된 로드맵을 반환한다.
 * 순환/오류가 있으면 원본 노드 순서를 유지한 채 오류 정보를 함께 돌려준다.
 *
 * @returns 검증 결과와, 정렬되었거나(정상) 원본 그대로인(오류) 로드맵
 */
export function sortRoadmap(roadmap: Roadmap): {
  result: DagValidationResult;
  roadmap: Roadmap;
} {
  const result = validateRoadmapDag(roadmap);
  if (result.valid) {
    return { result, roadmap: { ...roadmap, nodes: result.sortedNodes } };
  }
  return { result, roadmap };
}
