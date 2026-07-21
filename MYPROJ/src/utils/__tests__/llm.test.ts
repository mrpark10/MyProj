/**
 * LLM 응답 Sanitizer / Zod 검증 단위 테스트 (CLAUDE.md 규칙 3 검증).
 */
import { parseUseCases, sanitizeJsonText } from '@/utils/llm';

describe('sanitizeJsonText', () => {
  it('마크다운 코드펜스를 제거한다', () => {
    const raw = '```json\n[{"title":"A","detail":"B"}]\n```';
    expect(sanitizeJsonText(raw)).toBe('[{"title":"A","detail":"B"}]');
  });

  it('언어 표기 없는 코드펜스도 처리한다', () => {
    const raw = '```\n{"a":1}\n```';
    expect(sanitizeJsonText(raw)).toBe('{"a":1}');
  });

  it('앞뒤 설명 문장을 제거한다', () => {
    const raw = '분석 결과입니다:\n[{"title":"A","detail":"B"}]\n도움이 되셨길 바랍니다.';
    expect(sanitizeJsonText(raw)).toBe('[{"title":"A","detail":"B"}]');
  });

  it('이미 순수 JSON 이면 그대로 둔다', () => {
    const raw = '[{"title":"A","detail":"B"}]';
    expect(sanitizeJsonText(raw)).toBe(raw);
  });
});

describe('parseUseCases', () => {
  it('코드펜스가 섞인 정상 응답을 파싱한다', () => {
    const raw = '```json\n[{"title":"DB 인덱스","detail":"B-Tree 조회에 사용"}]\n```';
    const result = parseUseCases(raw);

    expect(result.ok).toBe(true);
    expect(result.data).toEqual([{ title: 'DB 인덱스', detail: 'B-Tree 조회에 사용' }]);
    expect(result.error).toBeNull();
  });

  it('깨진 JSON 은 예외를 던지지 않고 실패를 반환한다', () => {
    const result = parseUseCases('{ 이건 JSON 이 아닙니다');

    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('스키마에 맞지 않으면 검증 에러 메시지를 반환한다', () => {
    // detail 필드 누락
    const result = parseUseCases('[{"title":"제목만 있음"}]');

    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toContain('detail');
  });

  it('빈 배열은 거부한다 (최소 1개 필요)', () => {
    const result = parseUseCases('[]');
    expect(result.ok).toBe(false);
  });
});
