/**
 * Python 실습 코드 패널 — 참고 구현을 자유롭게 고쳐서 브라우저에서 바로 실행해볼 수 있다.
 * 실행은 Web Worker 위의 Pyodide(WASM CPython)가 담당해 메인 스레드를 막지 않는다.
 */
import { useState } from 'react';
import { AlertTriangle, Check, Code2, Copy, Loader2, Play, RotateCcw } from 'lucide-react';
import { usePythonRunner } from '@/hooks/usePythonRunner';

interface PythonCodePanelProps {
  code: string;
}

export function PythonCodePanel({ code: originalCode }: PythonCodePanelProps) {
  const [code, setCode] = useState(originalCode);
  const [copied, setCopied] = useState(false);
  const { status, output, errorMessage, run } = usePythonRunner();

  const isRunning = status === 'running';
  const isEdited = code !== originalCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없는 환경 — 조용히 무시
    }
  };

  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Code2 className="h-4 w-4 text-indigo-400" />
          Python 실습
        </h2>
        <div className="flex items-center gap-1.5">
          {isEdited && (
            <button
              type="button"
              onClick={() => setCode(originalCode)}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-slate-400 transition hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              원본으로
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-slate-400 transition hover:text-white"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        rows={12}
        className="w-full resize-y rounded-lg border border-line bg-surface p-3 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:border-accent"
      />

      <button
        type="button"
        onClick={() => run(code)}
        disabled={isRunning}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {isRunning ? '실행 중… (처음 실행은 Python 환경 로딩으로 몇 초 걸려요)' : '실행'}
      </button>

      {status !== 'idle' && status !== 'running' && (
        <div className="mt-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            {status === 'success' && <span className="text-emerald-400">출력</span>}
            {(status === 'error' || status === 'timeout') && (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertTriangle className="h-3 w-3" />
                오류
              </span>
            )}
          </div>
          <pre className="max-h-52 overflow-auto rounded-lg border border-line bg-surface p-3 font-mono text-xs leading-relaxed text-slate-200">
            <code>
              {output}
              {errorMessage && (status === 'error' || status === 'timeout') && (
                <span className="text-rose-400">{output ? '\n' : ''}{errorMessage}</span>
              )}
              {status === 'success' && !output && '(출력 없음)'}
            </code>
          </pre>
        </div>
      )}
    </section>
  );
}
