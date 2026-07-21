/**
 * 3D 그래프 시각화 (BFS·DFS) — 물리 엔진이 노드의 반동을 구동한다.
 *
 * 물리 동작:
 *  - 노드는 무중력(gravityScale 0) 상태로 스프링에 의해 제자리에 고정된다.
 *  - 방문/탐색 대상이 되는 순간 충격량을 받아 튀었다가 스프링으로 되돌아온다.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Mesh } from 'three';
import type { GraphData, GraphStepState } from '@/types/algorithm';
import { PhysicsWorld, vec3 } from '@/physics/engine';
import { graphToWorld } from '@/physics/layout';

interface GraphScene3DProps {
  graph: GraphData;
  step: GraphStepState;
}

const NODE_RADIUS = 0.55;

type NodeRole = 'idle' | 'frontier' | 'visited' | 'current';

const NODE_COLOR: Record<NodeRole, string> = {
  idle: '#3b4a7a',
  frontier: '#f59e0b',
  visited: '#22c55e',
  current: '#ef4444',
};

export function GraphScene3D({ graph, step }: GraphScene3DProps) {
  const meshRefs = useRef<Map<string, Mesh>>(new Map());
  const worldRef = useRef<PhysicsWorld>(new PhysicsWorld({ gravity: 0 }));

  /** 노드 id → 월드 좌표 */
  const positions = useMemo(() => {
    const map = new Map<string, ReturnType<typeof graphToWorld>>();
    for (const node of graph.nodes) map.set(node.id, graphToWorld(node.x, node.y));
    return map;
  }, [graph]);

  const roles = useMemo<Map<string, NodeRole>>(() => {
    const visited = new Set(step.visited);
    const frontier = new Set(step.frontier);
    const map = new Map<string, NodeRole>();
    for (const node of graph.nodes) {
      let role: NodeRole = 'idle';
      if (visited.has(node.id)) role = 'visited';
      if (frontier.has(node.id)) role = 'frontier';
      if (step.current === node.id) role = 'current';
      map.set(node.id, role);
    }
    return map;
  }, [graph, step]);

  // --- 물리 body 초기화 (무중력 + 스프링 고정) ---
  useEffect(() => {
    const world = worldRef.current;
    world.clear();
    for (const node of graph.nodes) {
      const target = positions.get(node.id);
      if (!target) continue;
      world.addBody({
        id: node.id,
        position: { ...target },
        target,
        halfExtent: NODE_RADIUS,
        gravityScale: 0,
      });
    }
  }, [graph, positions]);

  // --- 현재 노드/프론티어에 충격량을 줘서 튀게 한다 ---
  useEffect(() => {
    const world = worldRef.current;
    if (step.current) {
      world.applyImpulse(step.current, vec3(0, 5.5, 1.5));
    }
    for (const id of step.frontier) {
      world.applyImpulse(id, vec3(0, 2.2, 0));
    }
  }, [step]);

  useFrame((_state, delta) => {
    const world = worldRef.current;
    world.update(delta);

    for (const [id, mesh] of meshRefs.current) {
      const body = world.getBody(id);
      if (!body) continue;
      mesh.position.set(body.position.x, body.position.y, body.position.z);
    }
  });

  const traversed = useMemo(
    () => new Set(step.traversedEdges.map(([a, b]) => [a, b].sort().join('-'))),
    [step],
  );

  return (
    <group>
      {/* 간선 */}
      {graph.edges.map(([a, b]) => {
        const from = positions.get(a);
        const to = positions.get(b);
        if (!from || !to) return null;
        const key = [a, b].sort().join('-');
        const active = traversed.has(key);
        return (
          <Line
            key={key}
            points={[
              [from.x, from.y, from.z],
              [to.x, to.y, to.z],
            ]}
            color={active ? '#22c55e' : '#334166'}
            lineWidth={active ? 3 : 1.5}
          />
        );
      })}

      {/* 노드 */}
      {graph.nodes.map((node) => {
        const role = roles.get(node.id) ?? 'idle';
        const position = positions.get(node.id);
        if (!position) return null;
        return (
          <mesh
            key={node.id}
            ref={(mesh) => {
              if (mesh) meshRefs.current.set(node.id, mesh);
              else meshRefs.current.delete(node.id);
            }}
            position={[position.x, position.y, position.z]}
            castShadow
          >
            <sphereGeometry args={[NODE_RADIUS, 32, 32]} />
            <meshStandardMaterial
              color={NODE_COLOR[role]}
              emissive={NODE_COLOR[role]}
              emissiveIntensity={role === 'idle' ? 0.08 : 0.45}
              metalness={0.3}
              roughness={0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}
