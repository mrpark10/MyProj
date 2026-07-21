/**
 * 시각화 입력용 샘플 데이터 생성기.
 */
import { algorithmMetaSchema, type AlgorithmDef, type GraphData } from '@/types/algorithm';

/** 무작위 배열 생성 (시각화하기 좋은 범위) */
export function createRandomArray(size = 12, min = 5, max = 99): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

/** 데모용 무방향 그래프 (SVG 좌표는 0~100 정규화) */
export const SAMPLE_GRAPH: GraphData = {
  nodes: [
    { id: 'A', x: 50, y: 12 },
    { id: 'B', x: 22, y: 36 },
    { id: 'C', x: 78, y: 36 },
    { id: 'D', x: 10, y: 68 },
    { id: 'E', x: 40, y: 68 },
    { id: 'F', x: 68, y: 68 },
    { id: 'G', x: 90, y: 68 },
    { id: 'H', x: 50, y: 92 },
  ],
  edges: [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'D'],
    ['B', 'E'],
    ['C', 'F'],
    ['C', 'G'],
    ['E', 'H'],
    ['F', 'H'],
  ],
};

/**
 * 레지스트리의 메타데이터를 Zod 로 검증한다.
 * 잘못된 항목은 제외하고 경고를 남겨, 데이터 오류가 화면 전체를 깨뜨리지 않게 한다.
 */
export function validateAlgorithms(list: AlgorithmDef[]): AlgorithmDef[] {
  return list.filter((algorithm) => {
    const result = algorithmMetaSchema.safeParse(algorithm.meta);
    if (!result.success) {
      console.warn(`[catalog] 메타데이터 검증 실패로 제외됨: ${algorithm.meta.id}`, result.error.issues);
    }
    return result.success;
  });
}
