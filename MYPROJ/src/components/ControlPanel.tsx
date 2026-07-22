/** 시각화 재생 컨트롤 (재생/일시정지/단계 이동/속도 조절) */
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import type { StepPlayer } from '@/hooks/useStepPlayer';

interface ControlPanelProps {
  player: StepPlayer;
  onShuffle: () => void;
}

const SPEEDS = [0.5, 1, 2, 4] as const;

export function ControlPanel({ player, onShuffle }: ControlPanelProps) {
  const { index, playing, speed, totalSteps } = player;
  const lastIndex = Math.max(totalSteps - 1, 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={playing ? player.pause : player.play}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? '일시정지' : '재생'}
        </button>

        <button type="button" onClick={player.prev} disabled={index === 0}
          className="rounded-lg border border-line bg-surface p-2 text-slate-300 transition hover:text-white disabled:opacity-40" aria-label="이전 단계">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={player.next} disabled={index >= lastIndex}
          className="rounded-lg border border-line bg-surface p-2 text-slate-300 transition hover:text-white disabled:opacity-40" aria-label="다음 단계">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={player.reset}
          className="rounded-lg border border-line bg-surface p-2 text-slate-300 transition hover:text-white" aria-label="처음으로">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" onClick={onShuffle}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-slate-300 transition hover:text-white">
          <Shuffle className="h-4 w-4" />
          새 데이터
        </button>

        <div className="ml-auto flex items-center gap-1">
          <span className="mr-1 text-xs text-slate-400">속도</span>
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => player.setSpeed(value)}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                speed === value ? 'bg-accent text-white' : 'bg-surface text-slate-400 hover:text-white'
              }`}
            >
              {value}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={lastIndex}
          value={index}
          onChange={(event) => player.seek(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-indigo-500"
          aria-label="단계 이동"
        />
        <span className="shrink-0 font-mono text-xs text-slate-400">
          {index + 1} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
