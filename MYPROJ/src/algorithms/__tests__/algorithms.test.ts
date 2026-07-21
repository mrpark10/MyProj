/**
 * 알고리즘 스텝 생성기 단위 테스트.
 * 시각화 스텝의 마지막 상태가 실제 정답과 일치하는지 검증한다.
 */
import { bubbleSort, insertionSort, mergeSort, quickSort, selectionSort } from '@/algorithms/sorting';
import { heapSort, treeSort } from '@/algorithms/treeSorting';
import { binarySearch, linearSearch } from '@/algorithms/searching';
import { bfs, dfs } from '@/algorithms/graph';
import { fibonacciDP } from '@/algorithms/dp';
import { ALGORITHMS } from '@/algorithms';
import { algorithmMetaSchema } from '@/types/algorithm';
import { SAMPLE_GRAPH } from '@/utils/sampleData';

const SORTERS = { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort, treeSort };
const CASES: number[][] = [
  [5, 3, 8, 1, 9, 2],
  [1, 2, 3, 4, 5], // 이미 정렬됨
  [5, 4, 3, 2, 1], // 역순
  [7, 7, 3, 3, 1], // 중복 값
  [42], // 단일 원소
];

describe('정렬 알고리즘', () => {
  for (const [name, sorter] of Object.entries(SORTERS)) {
    describe(name, () => {
      it.each(CASES)('입력 %j 를 오름차순으로 정렬한다', (...input: number[]) => {
        const steps = sorter(input);
        const expected = [...input].sort((a, b) => a - b);

        expect(steps.length).toBeGreaterThan(0);
        expect(steps[steps.length - 1].array).toEqual(expected);
      });

      it('원본 배열을 변경하지 않는다 (부작용 없음)', () => {
        const input = [4, 1, 3];
        const snapshot = [...input];
        sorter(input);
        expect(input).toEqual(snapshot);
      });

      it('마지막 스텝에서 모든 인덱스가 확정 상태다', () => {
        const input = [3, 1, 2];
        const steps = sorter(input);
        expect(steps[steps.length - 1].settled).toHaveLength(input.length);
      });
    });
  }
});

describe('트리 기반 정렬', () => {
  it('힙 정렬은 최대 힙 구성 후 최댓값을 뒤로 보낸다', () => {
    const steps = heapSort([3, 9, 1, 7]);
    const heapBuilt = steps.find((step) => step.description.includes('최대 힙 완성'));

    expect(heapBuilt).toBeDefined();
    // 최대 힙이므로 루트(0번)가 전체 최댓값이어야 한다
    expect(heapBuilt?.array[0]).toBe(9);
  });

  it('트리 정렬은 BST 삽입 후 중위 순회로 정렬한다', () => {
    const steps = treeSort([5, 2, 8]);

    expect(steps.some((step) => step.description.includes('루트로 삽입'))).toBe(true);
    expect(steps.some((step) => step.description.includes('중위 순회'))).toBe(true);
    expect(steps[steps.length - 1].array).toEqual([2, 5, 8]);
  });

  it('트리 정렬은 중복 값도 올바르게 처리한다', () => {
    const steps = treeSort([4, 4, 2, 4]);
    expect(steps[steps.length - 1].array).toEqual([2, 4, 4, 4]);
  });

  it('힙 정렬은 큰 배열도 정확히 정렬한다', () => {
    const input = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100));
    const steps = heapSort(input);
    expect(steps[steps.length - 1].array).toEqual([...input].sort((a, b) => a - b));
  });
});

describe('탐색 알고리즘', () => {
  it('선형 탐색은 목표값의 인덱스를 찾는다', () => {
    const steps = linearSearch([10, 20, 30, 40], 30);
    const last = steps[steps.length - 1];
    expect(last.settled).toEqual([2]);
  });

  it('선형 탐색은 없는 값을 찾지 못한다고 보고한다', () => {
    const steps = linearSearch([1, 2, 3], 99);
    expect(steps[steps.length - 1].settled).toEqual([]);
  });

  it('이진 탐색은 정렬 후 목표값을 찾는다', () => {
    const steps = binarySearch([40, 10, 30, 20], 30);
    const last = steps[steps.length - 1];
    // 정렬 결과 [10,20,30,40] 에서 30 은 인덱스 2
    expect(last.settled).toEqual([2]);
    expect(last.array).toEqual([10, 20, 30, 40]);
  });

  it('이진 탐색의 스텝 수는 선형 탐색보다 적다 (log n)', () => {
    const data = Array.from({ length: 64 }, (_, i) => i + 1);
    expect(binarySearch(data, 64).length).toBeLessThan(linearSearch(data, 64).length);
  });
});

describe('그래프 탐색', () => {
  it('BFS 는 모든 연결 노드를 방문한다', () => {
    const steps = bfs(SAMPLE_GRAPH, 'A');
    const last = steps[steps.length - 1];
    expect(last.visited).toHaveLength(SAMPLE_GRAPH.nodes.length);
    expect(last.visited[0]).toBe('A');
  });

  it('BFS 는 시작점에서 가까운 노드를 먼저 방문한다', () => {
    const last = bfs(SAMPLE_GRAPH, 'A').slice(-1)[0];
    // A 의 직접 이웃 B, C 가 그 다음 depth 노드들보다 먼저 나와야 한다
    expect(last.visited.indexOf('B')).toBeLessThan(last.visited.indexOf('D'));
    expect(last.visited.indexOf('C')).toBeLessThan(last.visited.indexOf('G'));
  });

  it('DFS 는 모든 연결 노드를 중복 없이 방문한다', () => {
    const last = dfs(SAMPLE_GRAPH, 'A').slice(-1)[0];
    expect(last.visited).toHaveLength(SAMPLE_GRAPH.nodes.length);
    expect(new Set(last.visited).size).toBe(last.visited.length);
  });
});

describe('동적 계획법', () => {
  it('피보나치 DP 테이블을 올바르게 채운다', () => {
    const steps = fibonacciDP(new Array(8).fill(0));
    const last = steps[steps.length - 1];
    expect(last.array).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
  });
});

describe('알고리즘 카탈로그 메타데이터', () => {
  it('모든 알고리즘이 Zod 스키마를 통과한다', () => {
    for (const algorithm of ALGORITHMS) {
      const result = algorithmMetaSchema.safeParse(algorithm.meta);
      expect(result.success, `${algorithm.meta.id} 검증 실패`).toBe(true);
    }
  });

  it('알고리즘 id 는 중복되지 않는다', () => {
    const ids = ALGORITHMS.map((algorithm) => algorithm.meta.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 알고리즘이 실무 활용 사례를 1개 이상 가진다', () => {
    for (const algorithm of ALGORITHMS) {
      expect(algorithm.meta.useCases.length).toBeGreaterThan(0);
    }
  });
});
