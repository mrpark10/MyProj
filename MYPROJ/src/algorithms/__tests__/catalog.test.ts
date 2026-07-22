/**
 * 알고리즘 카탈로그(레지스트리) 메타데이터 무결성 테스트.
 * 개별 알고리즘 로직 검증은 각 카테고리 폴더(sorting/searching/graph/dp)의 __tests__ 에 있다.
 */
import { ALGORITHMS } from '@/algorithms';
import { algorithmMetaSchema } from '@/types/algorithm';

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

  it('모든 알고리즘이 Python 참고 구현을 가진다', () => {
    for (const algorithm of ALGORITHMS) {
      expect(algorithm.meta.pythonCode).toContain('def ');
    }
  });
});
