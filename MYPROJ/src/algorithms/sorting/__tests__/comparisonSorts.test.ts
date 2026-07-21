/**
 * 비교 기반 정렬(버블·선택·삽입·병합·퀵) 단위 테스트.
 * 시각화 스텝의 마지막 상태가 실제 정답과 일치하는지 검증한다.
 */
import { bubbleSort, insertionSort, mergeSort, quickSort, selectionSort } from '@/algorithms/sorting/comparisonSorts';

const SORTERS = { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort };
const CASES: number[][] = [
  [5, 3, 8, 1, 9, 2],
  [1, 2, 3, 4, 5], // 이미 정렬됨
  [5, 4, 3, 2, 1], // 역순
  [7, 7, 3, 3, 1], // 중복 값
  [42], // 단일 원소
];

describe('비교 기반 정렬', () => {
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
