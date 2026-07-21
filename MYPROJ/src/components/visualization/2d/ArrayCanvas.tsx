/**
 * 배열(정렬·탐색·DP) 시각화 — Canvas API 기반 막대 그래프.
 *
 * CLAUDE.md 규칙 2 대응: 캔버스 참조는 useRef 로 관리하고,
 * 렌더링은 useEffect 안에서만 수행해 DOM 참조 오류를 방지한다.
 */
import { useEffect, useRef } from 'react';
import type { ArrayStepState } from '@/types/algorithm';

interface ArrayCanvasProps {
  step: ArrayStepState;
  /** DP 처럼 값 자체가 중요한 경우 막대 위에 값을 항상 표시 */
  showValues?: boolean;
}

const COLORS = {
  bar: '#3b4a7a',
  comparing: '#f59e0b',
  swapping: '#ef4444',
  settled: '#22c55e',
  pointer: '#a78bfa',
  text: '#e2e8f0',
} as const;

function pickColor(index: number, step: ArrayStepState): string {
  if (step.swapping.includes(index)) return COLORS.swapping;
  if (step.comparing.includes(index)) return COLORS.comparing;
  if (step.settled.includes(index)) return COLORS.settled;
  if (step.pointer === index) return COLORS.pointer;
  return COLORS.bar;
}

export function ArrayCanvas({ step, showValues = false }: ArrayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // 고해상도 디스플레이 대응
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    context.clearRect(0, 0, width, height);

    const values = step.array;
    if (values.length === 0) return;

    const maxValue = Math.max(...values, 1);
    const gap = values.length > 30 ? 2 : 6;
    const barWidth = Math.max((width - gap * (values.length - 1)) / values.length, 1);
    const labelSpace = 22;

    values.forEach((value, index) => {
      const barHeight = Math.max((value / maxValue) * (height - labelSpace - 8), 2);
      const x = index * (barWidth + gap);
      const y = height - labelSpace - barHeight;

      context.fillStyle = pickColor(index, step);
      context.beginPath();
      context.roundRect(x, y, barWidth, barHeight, 4);
      context.fill();

      // 막대가 충분히 넓을 때만 값 라벨을 그린다
      if (showValues || barWidth >= 22) {
        context.fillStyle = COLORS.text;
        context.font = '11px ui-sans-serif, system-ui, sans-serif';
        context.textAlign = 'center';
        context.fillText(String(value), x + barWidth / 2, height - 7);
      }
    });
  }, [step, showValues]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      role="img"
      aria-label={`배열 시각화: ${step.description}`}
    />
  );
}
