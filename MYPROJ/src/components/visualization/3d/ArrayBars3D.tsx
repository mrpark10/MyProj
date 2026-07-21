/**
 * 3D 배열 시각화 — 자체 물리 엔진이 막대의 움직임을 구동한다.
 *
 * 물리 동작:
 *  - 각 막대는 스프링으로 자기 슬롯 위치에 붙잡혀 있다.
 *  - 값이 바뀌면 목표 높이가 바뀌어 스프링이 새 높이로 끌어당긴다.
 *  - 비교/교환 시 위쪽 충격량을 받아 튀어오르고, 중력과 바닥 반발로 착지한다.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import type { ArrayStepState } from '@/types/algorithm';
import { PhysicsWorld, vec3 } from '@/physics/engine';
import {
  BAR_WIDTH,
  barHeight,
  impulseStrength,
  restY,
  roleOf,
  ROLE_COLOR,
  slotTarget,
  slotX,
  type SlotRole,
} from '@/physics/layout';

interface ArrayBars3DProps {
  step: ArrayStepState;
}

const bodyId = (index: number): string => `bar-${index}`;

export function ArrayBars3D({ step }: ArrayBars3DProps) {
  const meshRefs = useRef<Array<Mesh | null>>([]);
  const groupRef = useRef<Group | null>(null);
  // 물리 월드는 컴포넌트 생애주기 동안 유지된다 (리렌더마다 재생성 금지)
  const worldRef = useRef<PhysicsWorld>(new PhysicsWorld());

  const values = step.array;
  const total = values.length;
  const maxValue = useMemo(() => Math.max(...values, 1), [values]);

  // 각 인덱스의 역할 (색상 + 충격량 결정)
  const roles = useMemo<SlotRole[]>(
    () => values.map((_, index) => roleOf(index, step)),
    [values, step],
  );

  // --- 배열 크기가 바뀌면 물리 body 를 재구성 ---
  useEffect(() => {
    const world = worldRef.current;
    world.clear();
    values.forEach((value, index) => {
      const target = slotTarget(index, total, value, maxValue);
      world.addBody({
        id: bodyId(index),
        position: { ...target },
        target,
        mass: 1,
        halfExtent: restY(barHeight(value, maxValue)),
      });
    });
    // 배열 길이가 바뀔 때만 재구성 (값 변화는 아래 effect 에서 target 갱신)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // --- 스텝이 바뀌면 목표 높이 갱신 + 역할에 따른 충격량 인가 ---
  useEffect(() => {
    const world = worldRef.current;

    values.forEach((value, index) => {
      const id = bodyId(index);
      const body = world.getBody(id);
      if (!body) return;

      const height = barHeight(value, maxValue);
      body.halfExtent = restY(height);
      world.setTarget(id, slotTarget(index, total, value, maxValue));

      const strength = impulseStrength(roles[index]);
      if (strength > 0) {
        world.applyImpulse(id, vec3(0, strength, 0));
      }
    });
  }, [values, roles, total, maxValue]);

  // --- 매 프레임 물리 시뮬레이션 → Three.js 오브젝트에 반영 ---
  useFrame((_state, delta) => {
    const world = worldRef.current;
    world.update(delta);

    values.forEach((value, index) => {
      const mesh = meshRefs.current[index];
      const body = world.getBody(bodyId(index));
      if (!mesh || !body) return;

      const height = barHeight(value, maxValue);
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      mesh.scale.set(1, height, 1);
    });
  });

  return (
    <group ref={groupRef}>
      {values.map((value, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            meshRefs.current[index] = mesh;
          }}
          position={[slotX(index, total), restY(barHeight(value, maxValue)), 0]}
          castShadow
          receiveShadow
        >
          {/* 높이 1 인 단위 박스를 scale.y 로 늘려 값 높이를 표현한다 */}
          <boxGeometry args={[BAR_WIDTH, 1, BAR_WIDTH]} />
          <meshStandardMaterial
            color={ROLE_COLOR[roles[index]]}
            emissive={ROLE_COLOR[roles[index]]}
            emissiveIntensity={roles[index] === 'idle' ? 0.05 : 0.35}
            metalness={0.25}
            roughness={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}
