/** 알고리즘 참고용 Python 구현 패널 (실무 활용 사례 패널 아래에 표시) */
import { useState } from 'react';
import { Check, Code2, Copy } from 'lucide-react';

interface PythonCodePanelProps {
  code: string;
}

export function PythonCodePanel({ code }: PythonCodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없는 환경 — 조용히 무시 (복사 버튼만 비활성 상태로 남음)
    }
  };

  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Code2 className="h-4 w-4 text-indigo-400" />
          Python 구현
        </h2>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-slate-400 transition hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-3 text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </section>
  );
}
