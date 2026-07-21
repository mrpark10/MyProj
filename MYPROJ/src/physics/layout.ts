/**
 * 3D 시각화 레이아웃 계산 (순수 함수 — 렌더러 비의존, 테스트 가능)
 * 알고리즘 스텝 상태를 물리 월드의 좌표/충격량으로 변환한다.
 */
import type { ArrayStepState } from '@/types/algorithm';
import { vec3, type Vec3 } from './engine';

export const BAR_WIDTH = 0.7;
export const BAR_GAP = 0.22;
export const MIN_BAR_HEIGHT = 0.4;
export const MAX_BAR_HEIGHT = 5.5;

/** 막대 하나가 차지하는 x 간격 */
export const SLOT_SIZE = BAR_WIDTH + BAR_GAP;

/** 배열 전체가 원점 기준 가운데 정렬되도록 슬롯의 x 좌표를 계산한다. */
export function slotX(index: number, total: number): number {
  const totalWidth = (total - 1) * SLOT_SIZE;
  return index * SLOT_SIZE - totalWidth / 2;
}

/** 값에 비례한 막대 높이 (최소/최대 사이로 정규화) */
export function barHeight(value: number, maxValue: number): number {
  if (maxValue <= 0) return MIN_BAR_HEIGHT;
  const ratio = Math.max(value, 0) / maxValue;
  return MIN_BAR_HEIGHT + ratio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
}

/** 막대가 바닥에 놓였을 때 중심의 y 좌표 (박스 중심 기준) */
export function restY(height: number): number {
  return height / 2;
}

/** 슬롯의 목표 위치 */
export function slotTarget(index: number, total: number, value: number, maxValue: number): Vec3 {
  return vec3(slotX(index, total), restY(barHeight(value, maxValue)), 0);
}

export type SlotRole = 'idle' | 'comparing' | 'swapping' | 'settled' | 'pointer';

/** 해당 인덱스가 이번 스텝에서 어떤 역할인지 판정한다. (색상·충격량 결정에 사용) */
export function roleOf(index: number, step: ArrayStepState): SlotRole {
  if (step.swapping.includes(index)) return 'swapping';
  if (step.comparing.includes(index)) return 'comparing';
  if (step.settled.includes(index)) return 'settled';
  if (step.pointer === index) return 'pointer';
  return 'idle';
}

export const ROLE_COLOR: Record<SlotRole, string> = {
  idle: '#3b4a7a',
  comparing: '#f59e0b',
  swapping: '#ef4444',
  settled: '#22c55e',
  pointer: '#a78bfa',
};

/**
 * 역할에 따른 위쪽 충격량 세기.
 * 교환은 크게 튀어오르고, 비교는 살짝 들썩인다.
 */
export function impulseStrength(role: SlotRole): number {
  switch (role) {
    case 'swapping':
      return 7.5;
    case 'comparing':
      return 3.2;
    case 'pointer':
      return 2.2;
    default:
      return 0;
  }
}

/** 그래프 노드 좌표(0~100 정규화)를 3D 월드 좌표로 변환한다. */
export function graphToWorld(x: number, y: number, spread = 12, height = 8): Vec3 {
  return vec3((x / 100 - 0.5) * spread, (1 - y / 100) * height + 1.2, 0);
}
