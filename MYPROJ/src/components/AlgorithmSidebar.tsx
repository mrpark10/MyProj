/** 알고리즘 선택 사이드바 — 카테고리별로 묶어 보여준다. */
import { ArrowUpDown, Binary, GitBranch, Layers } from 'lucide-react';
import type { AlgorithmCategory, AlgorithmDef } from '@/types/algorithm';

interface AlgorithmSidebarProps {
  algorithms: AlgorithmDef[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CATEGORY_LABEL: Record<AlgorithmCategory, string> = {
  sorting: '정렬',
  searching: '탐색',
  graph: '그래프',
  dp: '동적 계획법',
};

const CATEGORY_ORDER: AlgorithmCategory[] = ['sorting', 'searching', 'graph', 'dp'];

function CategoryIcon({ category }: { category: AlgorithmCategory }) {
  const className = 'h-3.5 w-3.5 text-indigo-400';
  if (category === 'sorting') return <ArrowUpDown className={className} />;
  if (category === 'searching') return <Binary className={className} />;
  if (category === 'graph') return <GitBranch className={className} />;
  return <Layers className={className} />;
}

export function AlgorithmSidebar({ algorithms, selectedId, onSelect }: AlgorithmSidebarProps) {
  return (
    <nav className="flex flex-col gap-4">
      {CATEGORY_ORDER.map((category) => {
        const items = algorithms.filter((algorithm) => algorithm.meta.category === category);
        if (items.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <CategoryIcon category={category} />
              {CATEGORY_LABEL[category]}
            </h3>
            <ul className="flex flex-col gap-1">
              {items.map(({ meta }) => {
                const active = meta.id === selectedId;
                return (
                  <li key={meta.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(meta.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        active
                          ? 'bg-accent font-semibold text-white'
                          : 'text-slate-300 hover:bg-line/60 hover:text-white'
                      }`}
                    >
                      {meta.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
