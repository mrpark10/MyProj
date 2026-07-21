/**
 * 동적 계획법(DP) 스텝 생성기.
 * DP 테이블이 채워지는 과정을 배열 시각화로 보여준다.
 */
import type { ArrayStepState } from '@/types/algorithm';

type StepInput = Omit<ArrayStepState, 'kind' | 'array'>;

const MIN_N = 3;
const MAX_N = 14;

/**
 * 피보나치 DP — 입력 배열의 길이를 n 으로 삼아 dp 테이블을 채운다.
 * dp[i] = dp[i-1] + dp[i-2]
 */
export function fibonacciDP(input: number[]): ArrayStepState[] {
  const n = Math.min(Math.max(input.length, MIN_N), MAX_N);
  const dp = new Array<number>(n).fill(0);
  const steps: ArrayStepState[] = [];
  const push = (stepInput: StepInput): void => {
    steps.push({ kind: 'array', array: [...dp], ...stepInput });
  };

  push({ comparing: [], swapping: [], settled: [], pointer: null, description: `피보나치 DP 시작: 길이 ${n} 의 테이블을 0 으로 초기화합니다.` });

  dp[0] = 0;
  push({ comparing: [], swapping: [0], settled: [0], pointer: 0, description: '기저 조건: dp[0] = 0' });

  if (n > 1) {
    dp[1] = 1;
    push({ comparing: [], swapping: [1], settled: [0, 1], pointer: 1, description: '기저 조건: dp[1] = 1' });
  }

  for (let i = 2; i < n; i += 1) {
    const settled = Array.from({ length: i }, (_, k) => k);
    push({ comparing: [i - 1, i - 2], swapping: [], settled, pointer: i, description: `dp[${i}] = dp[${i - 1}](${dp[i - 1]}) + dp[${i - 2}](${dp[i - 2]}) 를 계산합니다.` });
    dp[i] = dp[i - 1] + dp[i - 2];
    push({ comparing: [], swapping: [i], settled: [...settled, i], pointer: i, description: `dp[${i}] = ${dp[i]} 로 저장했습니다. (이전 결과를 재사용하므로 중복 계산이 없습니다)` });
  }

  push({
    comparing: [],
    swapping: [],
    settled: Array.from({ length: n }, (_, k) => k),
    pointer: null,
    description: `완료! 피보나치 수열 ${n} 개를 O(n) 에 계산했습니다.`,
  });
  return steps;
}
