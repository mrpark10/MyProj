/** 시간/공간 복잡도 배지 표 (CLAUDE.md 요구사항: Best/Average/Worst + 공간 복잡도 명시) */
import { Clock, HardDrive, ShieldCheck } from 'lucide-react';
import type { AlgorithmMeta } from '@/types/algorithm';

interface ComplexityPanelProps {
  meta: AlgorithmMeta;
}

/** 복잡도 문자열에 따라 배지 색을 달리해 한눈에 좋고 나쁨을 구분한다. */
function toneOf(value: string): string {
  if (/O\(1\)/.test(value)) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (/O\(log n\)/.test(value)) return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
  if (/O\(n log n\)/.test(value)) return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  if (/O\(n²\)|O\(2ⁿ\)/.test(value)) return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <span className={`rounded-lg border px-2.5 py-1 text-center font-mono text-sm font-bold ${toneOf(value)}`}>
        {value}
      </span>
    </div>
  );
}

export function ComplexityPanel({ meta }: ComplexityPanelProps) {
  const { complexity, stable } = meta;

  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
        <Clock className="h-4 w-4 text-indigo-400" />
        복잡도 분석
      </h2>

      <div className="grid grid-cols-3 gap-2">
        <Badge label="최선 (Best)" value={complexity.best} />
        <Badge label="평균 (Average)" value={complexity.average} />
        <Badge label="최악 (Worst)" value={complexity.worst} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
          공간 복잡도
          <span className={`rounded-md border px-2 py-0.5 font-mono font-bold ${toneOf(complexity.space)}`}>
            {complexity.space}
          </span>
        </div>

        {stable !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            안정 정렬
            <span className={`rounded-md border px-2 py-0.5 font-semibold ${
              stable
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/15 text-rose-300'
            }`}>
              {stable ? 'Stable' : 'Unstable'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
