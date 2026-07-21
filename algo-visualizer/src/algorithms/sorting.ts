/**
 * 정렬 알고리즘 스텝 생성기.
 * 각 함수는 입력 배열을 복사해 사용하며(부작용 없음), 시각화용 ArrayStepState 배열을 반환한다.
 */
import type { ArrayStepState } from '@/types/algorithm';

type StepInput = Omit<ArrayStepState, 'kind' | 'array'>;

/** 스텝 누적기 — 매 스텝마다 배열 스냅샷을 복사해 저장한다. */
function createRecorder(arr: number[]) {
  const steps: ArrayStepState[] = [];
  const push = (input: StepInput): void => {
    steps.push({ kind: 'array', array: [...arr], ...input });
  };
  return { steps, push };
}

const allIndices = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

export function bubbleSort(input: number[]): ArrayStepState[] {
  const arr = [...input];
  const { steps, push } = createRecorder(arr);
  const settled: number[] = [];

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: '버블 정렬 시작: 인접한 두 원소를 비교하며 큰 값을 뒤로 보냅니다.' });

  for (let i = 0; i < arr.length - 1; i += 1) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j += 1) {
      push({ comparing: [j, j + 1], swapping: [], settled: [...settled], pointer: j, description: `${arr[j]} 와 ${arr[j + 1]} 을 비교합니다.` });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        push({ comparing: [], swapping: [j, j + 1], settled: [...settled], pointer: j, description: `${arr[j + 1]} > ${arr[j]} 이므로 두 값을 교환합니다.` });
      }
    }
    settled.unshift(arr.length - 1 - i);
    push({ comparing: [], swapping: [], settled: [...settled], pointer: null, description: `${arr.length - i} 번째 자리에 최댓값이 확정되었습니다.` });
    if (!swapped) break; // 이미 정렬된 경우 조기 종료 → 최선 O(n)
  }

  push({ comparing: [], swapping: [], settled: allIndices(arr.length), pointer: null, description: '정렬 완료!' });
  return steps;
}

export function selectionSort(input: number[]): ArrayStepState[] {
  const arr = [...input];
  const { steps, push } = createRecorder(arr);
  const settled: number[] = [];

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: '선택 정렬 시작: 남은 구간에서 최솟값을 찾아 앞으로 보냅니다.' });

  for (let i = 0; i < arr.length - 1; i += 1) {
    let minIdx = i;
    push({ comparing: [], swapping: [], settled: [...settled], pointer: i, description: `${i} 번 인덱스부터 최솟값을 찾습니다.` });
    for (let j = i + 1; j < arr.length; j += 1) {
      push({ comparing: [minIdx, j], swapping: [], settled: [...settled], pointer: i, description: `현재 최솟값 ${arr[minIdx]} 와 ${arr[j]} 를 비교합니다.` });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        push({ comparing: [minIdx], swapping: [], settled: [...settled], pointer: i, description: `새로운 최솟값 ${arr[minIdx]} 을 발견했습니다.` });
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      push({ comparing: [], swapping: [i, minIdx], settled: [...settled], pointer: i, description: `최솟값 ${arr[i]} 을 ${i} 번 자리로 옮깁니다.` });
    }
    settled.push(i);
  }

  push({ comparing: [], swapping: [], settled: allIndices(arr.length), pointer: null, description: '정렬 완료!' });
  return steps;
}

export function insertionSort(input: number[]): ArrayStepState[] {
  const arr = [...input];
  const { steps, push } = createRecorder(arr);

  push({ comparing: [], swapping: [], settled: [0], pointer: null, description: '삽입 정렬 시작: 앞쪽 정렬된 구간에 원소를 하나씩 끼워 넣습니다.' });

  for (let i = 1; i < arr.length; i += 1) {
    const key = arr[i];
    let j = i - 1;
    push({ comparing: [], swapping: [], settled: allIndices(i), pointer: i, description: `${key} 를 정렬된 구간의 알맞은 위치에 삽입합니다.` });

    while (j >= 0 && arr[j] > key) {
      push({ comparing: [j, j + 1], swapping: [], settled: allIndices(i), pointer: i, description: `${arr[j]} > ${key} 이므로 한 칸 뒤로 밉니다.` });
      arr[j + 1] = arr[j];
      j -= 1;
      push({ comparing: [], swapping: [j + 2], settled: allIndices(i), pointer: i, description: '원소를 오른쪽으로 이동했습니다.' });
    }
    arr[j + 1] = key;
    push({ comparing: [], swapping: [j + 1], settled: allIndices(i + 1), pointer: null, description: `${key} 를 ${j + 1} 번 자리에 삽입했습니다.` });
  }

  push({ comparing: [], swapping: [], settled: allIndices(arr.length), pointer: null, description: '정렬 완료!' });
  return steps;
}

export function mergeSort(input: number[]): ArrayStepState[] {
  const arr = [...input];
  const { steps, push } = createRecorder(arr);

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: '병합 정렬 시작: 배열을 절반씩 나눈 뒤 정렬하며 합칩니다.' });

  const merge = (lo: number, mid: number, hi: number): void => {
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    let k = lo;

    while (i < left.length && j < right.length) {
      push({ comparing: [lo + i, mid + 1 + j], swapping: [], settled: [], pointer: k, description: `${left[i]} 와 ${right[j]} 중 작은 값을 선택합니다.` });
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i += 1;
      } else {
        arr[k] = right[j];
        j += 1;
      }
      push({ comparing: [], swapping: [k], settled: [], pointer: k, description: `${k} 번 자리에 ${arr[k]} 을 배치합니다.` });
      k += 1;
    }
    while (i < left.length) {
      arr[k] = left[i];
      i += 1;
      push({ comparing: [], swapping: [k], settled: [], pointer: k, description: `왼쪽에 남은 ${arr[k]} 을 배치합니다.` });
      k += 1;
    }
    while (j < right.length) {
      arr[k] = right[j];
      j += 1;
      push({ comparing: [], swapping: [k], settled: [], pointer: k, description: `오른쪽에 남은 ${arr[k]} 을 배치합니다.` });
      k += 1;
    }
    push({ comparing: [], swapping: [], settled: [], pointer: null, description: `구간 [${lo}, ${hi}] 병합이 끝났습니다.` });
  };

  const sort = (lo: number, hi: number): void => {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };

  sort(0, arr.length - 1);
  push({ comparing: [], swapping: [], settled: allIndices(arr.length), pointer: null, description: '정렬 완료!' });
  return steps;
}

export function quickSort(input: number[]): ArrayStepState[] {
  const arr = [...input];
  const { steps, push } = createRecorder(arr);
  const settled: number[] = [];

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: '퀵 정렬 시작: 피벗을 기준으로 작은 값과 큰 값을 나눕니다.' });

  const partition = (lo: number, hi: number): number => {
    const pivot = arr[hi];
    push({ comparing: [], swapping: [], settled: [...settled], pointer: hi, description: `피벗으로 ${pivot} (인덱스 ${hi}) 을 선택했습니다.` });
    let i = lo - 1;

    for (let j = lo; j < hi; j += 1) {
      push({ comparing: [j, hi], swapping: [], settled: [...settled], pointer: hi, description: `${arr[j]} 와 피벗 ${pivot} 을 비교합니다.` });
      if (arr[j] < pivot) {
        i += 1;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          push({ comparing: [], swapping: [i, j], settled: [...settled], pointer: hi, description: `${arr[i]} 가 피벗보다 작으므로 왼쪽 구역으로 보냅니다.` });
        }
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    push({ comparing: [], swapping: [i + 1, hi], settled: [...settled], pointer: i + 1, description: `피벗 ${pivot} 을 최종 위치 ${i + 1} 로 옮깁니다.` });
    return i + 1;
  };

  const sort = (lo: number, hi: number): void => {
    if (lo > hi) return;
    if (lo === hi) {
      settled.push(lo);
      return;
    }
    const p = partition(lo, hi);
    settled.push(p);
    push({ comparing: [], swapping: [], settled: [...settled], pointer: null, description: `인덱스 ${p} 의 값이 확정되었습니다.` });
    sort(lo, p - 1);
    sort(p + 1, hi);
  };

  sort(0, arr.length - 1);
  push({ comparing: [], swapping: [], settled: allIndices(arr.length), pointer: null, description: '정렬 완료!' });
  return steps;
}
