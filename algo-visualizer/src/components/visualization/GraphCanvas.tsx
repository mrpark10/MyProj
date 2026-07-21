/**
 * 그래프(BFS·DFS) 시각화 — SVG 기반.
 * 좌표는 0~100 정규화 값이므로 viewBox 로 반응형 대응한다.
 */
import type { GraphData, GraphStepState } from '@/types/algorithm';

interface GraphCanvasProps {
  graph: GraphData;
  step: GraphStepState;
}

const NODE_RADIUS = 6;

function edgeKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

export function GraphCanvas({ graph, step }: GraphCanvasProps) {
  const traversed = new Set(step.traversedEdges.map(([a, b]) => edgeKey(a, b)));
  const visited = new Set(step.visited);
  const frontier = new Set(step.frontier);

  const positionOf = (id: string) => graph.nodes.find((node) => node.id === id);

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`그래프 시각화: ${step.description}`}>
      {/* 간선 */}
      {graph.edges.map(([a, b]) => {
        const from = positionOf(a);
        const to = positionOf(b);
        if (!from || !to) return null;
        const isTraversed = traversed.has(edgeKey(a, b));
        return (
          <line
            key={edgeKey(a, b)}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={isTraversed ? '#22c55e' : '#334166'}
            strokeWidth={isTraversed ? 1.1 : 0.6}
          />
        );
      })}

      {/* 노드 */}
      {graph.nodes.map((node) => {
        const isCurrent = step.current === node.id;
        const isVisited = visited.has(node.id);
        const isFrontier = frontier.has(node.id);

        let fill = '#3b4a7a';
        if (isVisited) fill = '#22c55e';
        if (isFrontier) fill = '#f59e0b';
        if (isCurrent) fill = '#ef4444';

        return (
          <g key={node.id}>
            {isCurrent && <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 2.5} fill="none" stroke="#ef4444" strokeWidth={0.7} />}
            <circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill={fill} />
            <text
              x={node.x}
              y={node.y + 1.6}
              textAnchor="middle"
              fontSize={5}
              fontWeight={700}
              fill="#0b1020"
            >
              {node.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
