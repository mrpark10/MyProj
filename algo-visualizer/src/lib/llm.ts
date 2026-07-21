/**
 * LLM 응답 파서 & 활용사례 로더 (CLAUDE.md 규칙 3, 5 대응)
 *
 * - 규칙 3: LLM 응답에 마크다운 코드블록/설명 텍스트가 섞여도 순수 JSON 만 추출하는
 *   정규식 기반 Sanitizer 를 거친 뒤 Zod 로 검증한다.
 * - 규칙 5: API 키 미설정·네트워크 오류·검증 실패 시 화면이 죽지 않도록
 *   내장 Mock 데이터(각 알고리즘의 기본 활용사례)로 즉시 Fallback 한다.
 */
import { z } from 'zod';
import { useCaseSchema, type AlgorithmMeta, type UseCase } from '@/types/algorithm';

export const useCaseListSchema = z.array(useCaseSchema).min(1);

/**
 * LLM 텍스트 응답에서 순수 JSON 문자열만 추출한다.
 * ```json ... ``` 코드블록, 앞뒤 설명 문장을 모두 제거한다.
 */
export function sanitizeJsonText(raw: string): string {
  let text = raw.trim();

  // 1) 마크다운 코드펜스 제거 (```json ... ``` 또는 ``` ... ```)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    text = fenced[1].trim();
  }

  // 2) 앞뒤에 설명 문장이 남아 있으면 첫 '{'/'[' 부터 마지막 '}'/']' 까지만 취한다
  const firstBrace = text.search(/[[{]/);
  if (firstBrace > 0) text = text.slice(firstBrace);

  const lastCurly = text.lastIndexOf('}');
  const lastSquare = text.lastIndexOf(']');
  const lastIdx = Math.max(lastCurly, lastSquare);
  if (lastIdx >= 0 && lastIdx < text.length - 1) text = text.slice(0, lastIdx + 1);

  return text.trim();
}

export interface ParseResult {
  ok: boolean;
  data: UseCase[] | null;
  /** 검증 실패 시 LLM 자가 수정 재요청에 사용할 에러 메시지 */
  error: string | null;
}

/** Sanitizer → JSON.parse → Zod 검증까지 한 번에 수행한다. 예외를 던지지 않는다. */
export function parseUseCases(raw: string): ParseResult {
  try {
    const cleaned = sanitizeJsonText(raw);
    const json: unknown = JSON.parse(cleaned);
    const result = useCaseListSchema.safeParse(json);
    if (!result.success) {
      return { ok: false, data: null, error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ') };
    }
    return { ok: true, data: result.data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, data: null, error: `JSON 파싱 실패: ${message}` };
  }
}

/* ===================== 활용사례 로더 (API 키 설정 지점) ===================== */

/**
 * .env 파일에서 읽어오는 LLM 설정.
 * 값이 없으면 자동으로 내장 데이터를 사용하므로, 설정하지 않아도 앱은 정상 동작한다.
 *
 * ⚠️ VITE_ 접두사 환경변수는 빌드 결과물에 그대로 포함되어 브라우저에 노출된다.
 *    실제 서비스에서는 반드시 서버 프록시를 두고 키를 서버에만 보관해야 한다.
 */
const LLM_ENDPOINT: string = import.meta.env.VITE_LLM_ENDPOINT ?? '';
const LLM_API_KEY: string = import.meta.env.VITE_LLM_API_KEY ?? '';

export function isLlmConfigured(): boolean {
  return LLM_ENDPOINT.length > 0 && LLM_API_KEY.length > 0;
}

export interface UseCaseLoadResult {
  useCases: UseCase[];
  /** 'llm' = AI 생성, 'builtin' = 내장 데이터 Fallback */
  source: 'llm' | 'builtin';
}

/**
 * 알고리즘의 실무 활용사례를 불러온다.
 * LLM 설정이 없거나 호출/검증에 실패하면 내장 데이터로 즉시 Fallback 한다.
 */
export async function loadUseCases(meta: AlgorithmMeta): Promise<UseCaseLoadResult> {
  if (!isLlmConfigured()) {
    return { useCases: meta.useCases, source: 'builtin' };
  }

  try {
    const response = await fetch(LLM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LLM_API_KEY}` },
      body: JSON.stringify({
        algorithm: meta.name,
        // CoT: 먼저 <thought> 로 분석한 뒤 JSON 만 출력하도록 지시 (CLAUDE.md 요구사항)
        prompt: `<thought>${meta.name}이 실제 현업 시스템(백엔드, 게임, DB, AI 등)에서 쓰이는 사례를 검증하라.</thought>\n검증 후 [{"title":"...","detail":"..."}] 형식의 JSON 배열만 출력하라.`,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const parsed = parseUseCases(text);
    if (!parsed.ok || !parsed.data) throw new Error(parsed.error ?? '검증 실패');

    return { useCases: parsed.data, source: 'llm' };
  } catch (err) {
    // Fallback: 화면이 비지 않도록 내장 데이터를 즉시 반환
    console.warn('[LLM] 활용사례 로드 실패 → 내장 데이터로 대체합니다.', err);
    return { useCases: meta.useCases, source: 'builtin' };
  }
}
