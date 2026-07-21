/**
 * 시각화 스텝 재생 컨트롤러.
 *
 * CLAUDE.md 규칙 2 대응:
 * - 타이머는 useRef 로 보관하고 useEffect 클린업에서 반드시 해제해 메모리 누수를 막는다.
 * - Hook 은 조건부 호출 없이 항상 최상단에서 호출된다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const BASE_DELAY_MS = 600;
const MIN_DELAY_MS = 30;

export interface StepPlayer {
  index: number;
  playing: boolean;
  speed: number;
  totalSteps: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  seek: (value: number) => void;
  setSpeed: (value: number) => void;
}

export function useStepPlayer(totalSteps: number): StepPlayer {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<number | null>(null);

  const lastIndex = Math.max(totalSteps - 1, 0);

  // 스텝 목록이 바뀌면(알고리즘/입력 변경) 처음으로 되돌린다.
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [totalSteps]);

  // 자동 재생 루프 — 매 렌더마다 타이머를 걸고 클린업에서 해제한다.
  useEffect(() => {
    if (!playing) return;

    if (index >= lastIndex) {
      setPlaying(false);
      return;
    }

    const delay = Math.max(MIN_DELAY_MS, BASE_DELAY_MS / speed);
    timerRef.current = window.setTimeout(() => {
      setIndex((prev) => Math.min(prev + 1, lastIndex));
    }, delay);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, index, lastIndex, speed]);

  // 언마운트 시 잔여 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const play = useCallback(() => {
    setIndex((prev) => (prev >= lastIndex ? 0 : prev));
    setPlaying(true);
  }, [lastIndex]);

  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((prev) => !prev), []);
  const next = useCallback(() => {
    setPlaying(false);
    setIndex((prev) => Math.min(prev + 1, lastIndex));
  }, [lastIndex]);
  const prev = useCallback(() => {
    setPlaying(false);
    setIndex((value) => Math.max(value - 1, 0));
  }, []);
  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);
  const seek = useCallback(
    (value: number) => {
      setPlaying(false);
      setIndex(Math.min(Math.max(value, 0), lastIndex));
    },
    [lastIndex],
  );

  return { index, playing, speed, totalSteps, play, pause, toggle, next, prev, reset, seek, setSpeed };
}
