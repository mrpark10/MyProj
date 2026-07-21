/**
 * 실무 활용 사례 패널 (CLAUDE.md 요구사항: 단순 학술 설명이 아닌 실제 시스템 활용처 제시)
 * LLM 설정이 있으면 AI 생성 결과를, 없으면 내장 데이터를 표시한다.
 */
import { useEffect, useState } from 'react';
import { Briefcase, Sparkles } from 'lucide-react';
import type { AlgorithmMeta, UseCase } from '@/types/algorithm';
import { loadUseCases } from '@/lib/llm';

interface UseCasePanelProps {
  meta: AlgorithmMeta;
}

export function UseCasePanel({ meta }: UseCasePanelProps) {
  const [useCases, setUseCases] = useState<UseCase[]>(meta.useCases);
  const [source, setSource] = useState<'llm' | 'builtin'>('builtin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // 실패해도 loadUseCases 내부에서 내장 데이터로 Fallback 하므로 화면이 비지 않는다.
    loadUseCases(meta)
      .then((result) => {
        if (cancelled) return;
        setUseCases(result.useCases);
        setSource(result.source);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [meta]);

  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
        <Briefcase className="h-4 w-4 text-indigo-400" />
        실무 활용 사례
        {source === 'llm' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
            <Sparkles className="h-3 w-3" />
            AI 생성
          </span>
        )}
        {loading && <span className="text-[10px] font-normal text-slate-500">불러오는 중…</span>}
      </h2>

      <ul className="flex flex-col gap-3">
        {useCases.map((useCase) => (
          <li key={useCase.title} className="rounded-lg border border-line bg-surface p-3">
            <p className="text-sm font-semibold text-slate-100">{useCase.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{useCase.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
