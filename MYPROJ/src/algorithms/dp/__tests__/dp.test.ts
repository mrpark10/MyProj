/**
 * 동적 계획법(피보나치 DP) 단위 테스트.
 */
import { fibonacciDP } from '@/algorithms/dp/dp';

describe('동적 계획법', () => {
  it('피보나치 DP 테이블을 올바르게 채운다', () => {
    const steps = fibonacciDP(new Array(8).fill(0));
    const last = steps[steps.length - 1];
    expect(last.array).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
  });
});
