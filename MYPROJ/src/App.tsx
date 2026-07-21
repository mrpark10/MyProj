/**
 * AlgoVisualizer AI — 메인 화면
 * 알고리즘 선택 → 동적 시각화 → 복잡도 분석 → 실무 활용 사례
 */
import { useEffect, useMemo, useState } from 'react';
import { Activity, Box, Info, Square } from 'lucide-react';
import { ALGORITHMS } from '@/algorithms';
import { AlgorithmSidebar } from '@/components/AlgorithmSidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { isWebGLAvailable } from '@/lib/capabilities';
import { ComplexityPanel } from '@/components/ComplexityPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { UseCasePanel } from '@/components/UseCasePanel';
import { ArrayCanvas } from '@/components/visualization/ArrayCanvas';
import { GraphCanvas } from '@/components/visualization/GraphCanvas';
import { ArrayBars3D } from '@/components/visualization/ArrayBars3D';
import { GraphScene3D } from '@/components/visualization/GraphScene3D';
import { Scene3D } from '@/components/visualization/Scene3D';
import { useStepPlayer } from '@/hooks/useStepPlayer';
import { createRandomArray, SAMPLE_GRAPH, validateAlgorithms } from '@/lib/sampleData';
import { isArrayAlgorithm, isArrayStep, isGraphStep, type StepState } from '@/types/algorithm';

/** 메타데이터가 스키마를 통과한 알고리즘만 사용한다. */
const CATALOG = validateAlgorithms(ALGORITHMS);

const LEGEND = [
  { color: '#3b4a7a', label: '대기' },
  { color: '#f59e0b', label: '비교 중' },
  { color: '#ef4444', label: '교환/갱신' },
  { color: '#22c55e', label: '확정' },
  { color: '#a78bfa', label: '현재 위치' },
] as const;

type ViewMode = '3d' | '2d';

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(CATALOG[0]?.meta.id ?? '');
  const [array, setArray] = useState<number[]>(() => createRandomArray());
  // WebGL 을 못 쓰는 환경이면 처음부터 2D 로 시작한다 (백지 방지).
  const [viewMode, setViewMode] = useState<ViewMode>(() => (isWebGLAvailable() ? '3d' : '2d'));
  const [webglFailed, setWebglFailed] = useState(false);

  // 3D 렌더링이 실패하면 자동으로 2D 로 되돌린다.
  useEffect(() => {
    if (webglFailed) setViewMode('2d');
  }, [webglFailed]);

  const algorithm = useMemo(
    () => CATALOG.find((item) => item.meta.id === selectedId) ?? CATALOG[0],
    [selectedId],
  );

  // 알고리즘/입력이 바뀔 때만 스텝을 재생성한다 (비용이 큰 연산이므로 메모이제이션).
  const steps = useMemo<StepState[]>(() => {
    if (!algorithm) return [];
    try {
      return isArrayAlgorithm(algorithm)
        ? algorithm.run(array)
        : algorithm.run(SAMPLE_GRAPH, SAMPLE_GRAPH.nodes[0].id);
    } catch (error) {
      console.error('[AlgoVisualizer] 스텝 생성 실패', error);
      return [];
    }
  }, [algorithm, array]);

  const player = useStepPlayer(steps.length);
  const current: StepState | undefined = steps[Math.min(player.index, steps.length - 1)];

  if (!algorithm) {
    return <div className="p-8 text-slate-300">사용 가능한 알고리즘이 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-slate-100">
      {/* 헤더 */}
      <header className="border-b border-line bg-panel/70 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Activity className="h-6 w-6 text-indigo-400" />
          <div>
            <h1 className="text-lg font-extrabold leading-tight">AlgoVisualizer AI</h1>
            <p className="text-xs text-slate-400">알고리즘 시각화 &amp; 복잡도 분석 플랫폼</p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-5 lg:flex-row">
        {/* 사이드바 */}
        <aside className="shrink-0 rounded-xl border border-line bg-panel p-4 lg:w-60">
          <AlgorithmSidebar algorithms={CATALOG} selectedId={algorithm.meta.id} onSelect={setSelectedId} />
        </aside>

        {/* 본문 */}
        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <section className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-panel p-4">
            <div>
              <h2 className="text-base font-bold text-white">{algorithm.meta.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{algorithm.meta.summary}</p>
            </div>

            {/* 2D / 3D 전환 */}
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-surface p-1">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === '3d' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="h-3.5 w-3.5" />
                3D 물리
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  viewMode === '2d' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Square className="h-3.5 w-3.5" />
                2D
              </button>
            </div>
          </section>

          {/* 시각화 영역 */}
          <section className="rounded-xl border border-line bg-panel p-4">
            <div className={`w-full ${viewMode === '3d' ? 'h-[440px]' : 'h-[320px]'}`}>
              {!current && (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  표시할 단계가 없습니다.
                </div>
              )}

              {current && viewMode === '3d' && (
                <ErrorBoundary
                  resetKey={algorithm.meta.id}
                  onError={() => setWebglFailed(true)}
                  fallback={
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <p className="text-sm font-semibold text-amber-300">3D 렌더링을 사용할 수 없습니다.</p>
                      <p className="text-xs text-slate-400">2D 모드로 자동 전환합니다.</p>
                    </div>
                  }
                >
                  <Scene3D showGround={isArrayStep(current)}>
                    {isArrayStep(current) && <ArrayBars3D step={current} />}
                    {isGraphStep(current) && <GraphScene3D graph={SAMPLE_GRAPH} step={current} />}
                  </Scene3D>
                </ErrorBoundary>
              )}

              {current && viewMode === '2d' && isArrayStep(current) && (
                <ArrayCanvas step={current} showValues={algorithm.meta.category === 'dp'} />
              )}
              {current && viewMode === '2d' && isGraphStep(current) && (
                <GraphCanvas graph={SAMPLE_GRAPH} step={current} />
              )}
            </div>

            {viewMode === '3d' && (
              <p className="mt-2 text-[11px] text-slate-500">
                🖱️ 드래그로 회전 · 휠로 확대/축소 — 막대는 자체 구현 물리 엔진(중력·스프링·반발)으로 움직입니다.
              </p>
            )}

            {/* 현재 단계 설명 */}
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-surface p-3 text-sm text-slate-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
              {current?.description ?? '—'}
            </p>

            {/* 범례 */}
            <div className="mt-3 flex flex-wrap gap-3">
              {LEGEND.map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </section>

          <ControlPanel player={player} onShuffle={() => setArray(createRandomArray())} />

          {/* 동작 원리 */}
          <section className="rounded-xl border border-line bg-panel p-4">
            <h2 className="mb-2 text-sm font-bold text-slate-200">동작 원리</h2>
            <p className="text-sm leading-relaxed text-slate-400">{algorithm.meta.howItWorks}</p>
          </section>
        </main>

        {/* 우측 분석 패널 */}
        <aside className="flex shrink-0 flex-col gap-4 lg:w-80">
          <ComplexityPanel meta={algorithm.meta} />
          <UseCasePanel meta={algorithm.meta} />
        </aside>
      </div>
    </div>
  );
}
