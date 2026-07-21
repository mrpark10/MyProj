/**
 * 복잡도(Big-O) 계산 및 표기 Helper.
 * UI 레이어(ComplexityPanel)와 데이터 레이어(algorithms) 사이의 순수 유틸 함수만 둔다.
 */
import type { ComplexityInfo } from '@/types/algorithm';

export type ComplexityTier = 'constant' | 'log' | 'linearithmic' | 'quadratic' | 'other';

const TIER_PATTERN: Array<[ComplexityTier, RegExp]> = [
  ['constant', /O\(1\)/],
  ['log', /O\(log n\)/],
  ['linearithmic', /O\(n log n\)/],
  ['quadratic', /O\(n²\)|O\(2ⁿ\)/],
];

/** 복잡도 문자열을 등급으로 분류한다. (색상·정렬 등 UI 판단에 사용) */
export function classifyComplexity(value: string): ComplexityTier {
  for (const [tier, pattern] of TIER_PATTERN) {
    if (pattern.test(value)) return tier;
  }
  return 'other';
}

/** 등급별 배지 Tailwind 클래스. */
export const TIER_BADGE_CLASS: Record<ComplexityTier, string> = {
  constant: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  log: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  linearithmic: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  quadratic: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  other: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

/** 복잡도 문자열에 대응하는 배지 클래스를 바로 반환한다. */
export function complexityBadgeClass(value: string): string {
  return TIER_BADGE_CLASS[classifyComplexity(value)];
}

/** 등급의 상대적 비용 순위 (낮을수록 빠름) — 정렬·비교에 사용. */
const TIER_RANK: Record<ComplexityTier, number> = {
  constant: 0,
  log: 1,
  linearithmic: 2,
  other: 3,
  quadratic: 4,
};

/** 두 복잡도 문자열을 비교한다 (오름차순 정렬용 비교 함수). */
export function compareComplexity(a: string, b: string): number {
  return TIER_RANK[classifyComplexity(a)] - TIER_RANK[classifyComplexity(b)];
}

/** ComplexityInfo 가 최선~최악 구간에서 실제로 나빠지는 방향인지 검증한다. */
export function isMonotonicComplexity(info: ComplexityInfo): boolean {
  return (
    compareComplexity(info.best, info.average) <= 0 &&
    compareComplexity(info.average, info.worst) <= 0
  );
}
