/**
 * 탐색 알고리즘(선형 · 이진) 단위 테스트.
 */
import { binarySearch, linearSearch } from '@/algorithms/searching/searching';

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
