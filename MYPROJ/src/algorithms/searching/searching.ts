/**
 * 탐색 알고리즘 스텝 생성기.
 */
import type { ArrayStepState } from '@/types/algorithm';

type StepInput = Omit<ArrayStepState, 'kind' | 'array'>;

function createRecorder(getArray: () => number[]) {
  const steps: ArrayStepState[] = [];
  const push = (input: StepInput): void => {
    steps.push({ kind: 'array', array: [...getArray()], ...input });
  };
  return { steps, push };
}

/** 선형 탐색 — 앞에서부터 하나씩 비교한다. */
export function linearSearch(input: number[], target?: number): ArrayStepState[] {
  const arr = [...input];
  const key = target ?? arr[Math.floor(arr.length / 2)];
  const { steps, push } = createRecorder(() => arr);

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: `선형 탐색 시작: ${key} 를 찾기 위해 앞에서부터 하나씩 확인합니다.` });

  for (let i = 0; i < arr.length; i += 1) {
    push({ comparing: [i], swapping: [], settled: [], pointer: i, description: `${i} 번 인덱스의 ${arr[i]} 가 ${key} 인지 확인합니다.` });
    if (arr[i] === key) {
      push({ comparing: [], swapping: [], settled: [i], pointer: i, description: `찾았습니다! ${key} 는 ${i} 번 인덱스에 있습니다.` });
      return steps;
    }
  }

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: `${key} 를 찾지 못했습니다.` });
  return steps;
}

/**
 * 이진 탐색 — 정렬된 배열이 전제이므로, 먼저 정렬한 뒤 탐색한다.
 * 매 스텝마다 탐색 범위를 절반으로 줄인다.
 */
export function binarySearch(input: number[], target?: number): ArrayStepState[] {
  const arr = [...input].sort((a, b) => a - b);
  const key = target ?? arr[Math.floor(arr.length / 2)];
  const { steps, push } = createRecorder(() => arr);

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: '이진 탐색은 정렬된 배열이 필요하므로 먼저 오름차순 정렬했습니다.' });

  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const range = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    push({ comparing: range, swapping: [], settled: [], pointer: mid, description: `탐색 범위 [${lo}, ${hi}] 의 중앙값 ${arr[mid]} 와 ${key} 를 비교합니다.` });

    if (arr[mid] === key) {
      push({ comparing: [], swapping: [], settled: [mid], pointer: mid, description: `찾았습니다! ${key} 는 ${mid} 번 인덱스에 있습니다.` });
      return steps;
    }
    if (arr[mid] < key) {
      lo = mid + 1;
      push({ comparing: [], swapping: [], settled: [], pointer: mid, description: `${arr[mid]} < ${key} 이므로 오른쪽 절반만 탐색합니다.` });
    } else {
      hi = mid - 1;
      push({ comparing: [], swapping: [], settled: [], pointer: mid, description: `${arr[mid]} > ${key} 이므로 왼쪽 절반만 탐색합니다.` });
    }
  }

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: `${key} 를 찾지 못했습니다.` });
  return steps;
}
