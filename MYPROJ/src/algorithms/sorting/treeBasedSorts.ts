/**
 * 트리 기반 정렬 알고리즘 스텝 생성기 — 힙 정렬 / 트리 정렬.
 * 두 알고리즘 모두 트리 자료구조를 이용하지만 접근 방식이 다르다.
 *  - 힙 정렬: 배열을 그대로 완전이진트리(힙)로 보고 제자리에서 정렬
 *  - 트리 정렬: 이진탐색트리(BST)에 삽입 후 중위 순회로 정렬된 순서를 얻음
 */
import type { ArrayStepState } from '@/types/algorithm';

type StepInput = Omit<ArrayStepState, 'kind' | 'array'>;

function createRecorder(arr: number[]) {
  const steps: ArrayStepState[] = [];
  const push = (input: StepInput): void => {
    steps.push({ kind: 'array', array: [...arr], ...input });
  };
  return { steps, push };
}

const allIndices = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/**
 * 힙 정렬 — 배열을 최대 힙으로 만든 뒤, 루트(최댓값)를 맨 뒤로 보내는 것을 반복한다.
 * 추가 메모리 없이 제자리에서 동작하며 최악에도 O(n log n) 을 보장한다.
 */
export function heapSort(input: number[]): ArrayStepState[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, push } = createRecorder(arr);
  const settled: number[] = [];

  push({
    comparing: [],
    swapping: [],
    settled: [],
    pointer: null,
    description: '힙 정렬 시작: 배열을 완전이진트리로 보고 최대 힙을 만듭니다.',
  });

  /** heapSize 범위 안에서 index 를 아래로 내려보내며 힙 성질을 복구한다. */
  const siftDown = (index: number, heapSize: number): void => {
    let root = index;

    for (;;) {
      const left = 2 * root + 1;
      const right = 2 * root + 2;
      let largest = root;

      if (left < heapSize) {
        push({
          comparing: [largest, left],
          swapping: [],
          settled: [...settled],
          pointer: root,
          description: `부모 ${arr[largest]} 와 왼쪽 자식 ${arr[left]} 을 비교합니다.`,
        });
        if (arr[left] > arr[largest]) largest = left;
      }

      if (right < heapSize) {
        push({
          comparing: [largest, right],
          swapping: [],
          settled: [...settled],
          pointer: root,
          description: `부모 ${arr[largest]} 와 오른쪽 자식 ${arr[right]} 을 비교합니다.`,
        });
        if (arr[right] > arr[largest]) largest = right;
      }

      if (largest === root) break;

      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      push({
        comparing: [],
        swapping: [root, largest],
        settled: [...settled],
        pointer: largest,
        description: `자식이 더 크므로 교환해 큰 값을 위로 올립니다.`,
      });
      root = largest;
    }
  };

  // 1) 최대 힙 구성 — 마지막 부모 노드부터 거꾸로 sift down
  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
    siftDown(i, n);
  }
  push({
    comparing: [],
    swapping: [],
    settled: [],
    pointer: null,
    description: `최대 힙 완성! 루트 ${arr[0]} 이 전체 최댓값입니다.`,
  });

  // 2) 루트를 맨 뒤로 보내고 힙 크기를 줄이며 반복
  for (let end = n - 1; end > 0; end -= 1) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    settled.unshift(end);
    push({
      comparing: [],
      swapping: [0, end],
      settled: [...settled],
      pointer: end,
      description: `최댓값 ${arr[end]} 을 정렬 구간의 맨 앞(${end}번)으로 확정합니다.`,
    });
    siftDown(0, end);
  }

  push({
    comparing: [],
    swapping: [],
    settled: allIndices(n),
    pointer: null,
    description: '정렬 완료!',
  });
  return steps;
}

interface BstNode {
  value: number;
  left: BstNode | null;
  right: BstNode | null;
}

/**
 * 트리 정렬 — 이진탐색트리에 모든 값을 삽입한 뒤, 중위 순회(왼쪽 → 루트 → 오른쪽)로
 * 정렬된 순서를 얻어 배열에 되쓴다.
 */
export function treeSort(input: number[]): ArrayStepState[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, push } = createRecorder(arr);

  push({
    comparing: [],
    swapping: [],
    settled: [],
    pointer: null,
    description: '트리 정렬 시작: 모든 값을 이진탐색트리(BST)에 삽입합니다.',
  });

  // --- 1) BST 삽입 단계 ---
  let root: BstNode | null = null;

  const insert = (value: number, sourceIndex: number): void => {
    const node: BstNode = { value, left: null, right: null };

    if (!root) {
      root = node;
      push({
        comparing: [],
        swapping: [sourceIndex],
        settled: [],
        pointer: sourceIndex,
        description: `${value} 를 트리의 루트로 삽입했습니다.`,
      });
      return;
    }

    let currentNode: BstNode = root;
    let depth = 0;

    for (;;) {
      depth += 1;
      if (value < currentNode.value) {
        if (!currentNode.left) {
          currentNode.left = node;
          push({
            comparing: [],
            swapping: [sourceIndex],
            settled: [],
            pointer: sourceIndex,
            description: `${value} < ${currentNode.value} → 왼쪽 자식으로 삽입 (깊이 ${depth}).`,
          });
          return;
        }
        currentNode = currentNode.left;
      } else {
        if (!currentNode.right) {
          currentNode.right = node;
          push({
            comparing: [],
            swapping: [sourceIndex],
            settled: [],
            pointer: sourceIndex,
            description: `${value} ≥ ${currentNode.value} → 오른쪽 자식으로 삽입 (깊이 ${depth}).`,
          });
          return;
        }
        currentNode = currentNode.right;
      }
    }
  };

  for (let i = 0; i < n; i += 1) {
    push({
      comparing: [i],
      swapping: [],
      settled: [],
      pointer: i,
      description: `${arr[i]} 를 트리에 삽입할 위치를 찾습니다.`,
    });
    insert(arr[i], i);
  }

  // --- 2) 중위 순회로 정렬된 순서 수집 ---
  push({
    comparing: [],
    swapping: [],
    settled: [],
    pointer: null,
    description: 'BST 완성! 이제 중위 순회(왼쪽 → 루트 → 오른쪽)로 값을 꺼냅니다.',
  });

  const ordered: number[] = [];
  const collect = (node: BstNode | null): void => {
    if (!node) return;
    collect(node.left);
    ordered.push(node.value);
    collect(node.right);
  };
  collect(root);

  // --- 3) 순회 결과를 배열에 되쓰기 ---
  for (let i = 0; i < ordered.length; i += 1) {
    arr[i] = ordered[i];
    push({
      comparing: [],
      swapping: [i],
      settled: allIndices(i + 1),
      pointer: i,
      description: `중위 순회 ${i + 1}번째 값 ${ordered[i]} 를 ${i}번 자리에 씁니다.`,
    });
  }

  push({
    comparing: [],
    swapping: [],
    settled: allIndices(n),
    pointer: null,
    description: '정렬 완료! 중위 순회 결과가 곧 오름차순입니다.',
  });
  return steps;
}
