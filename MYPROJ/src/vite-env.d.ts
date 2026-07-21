/// <reference types="vite/client" />

/** .env 로 주입되는 환경변수 타입 (any 사용 없이 명시적으로 정의) */
interface ImportMetaEnv {
  /** LLM 프록시 엔드포인트 URL (예: http://localhost:8787/api/usecases) */
  readonly VITE_LLM_ENDPOINT?: string;
  /** LLM API 키 — 미설정 시 내장 데이터로 Fallback */
  readonly VITE_LLM_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
