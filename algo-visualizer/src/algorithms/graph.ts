/**
 * 그래프 순회 알고리즘 스텝 생성기 (BFS / DFS).
 */
import type { GraphData, GraphStepState } from '@/types/algorithm';

type StepInput = Omit<GraphStepState, 'kind'>;

function createRecorder() {
  const steps: GraphStepState[] = [];
  const push = (input: StepInput): void => {
    steps.push({ kind: 'graph', ...input });
  };
  return { steps, push };
}

/** 인접 리스트 생성 (무방향 그래프) */
function buildAdjacency(graph: GraphData): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) adj.set(node.id, []);
  for (const [a, b] of graph.edges) {
    adj.get(a)?.push(b);
    adj.get(b)?.push(a);
  }
  // 결정적 순회를 위해 정렬
  for (const [, list] of adj) list.sort();
  return adj;
}

/** 너비 우선 탐색 — 큐를 사용해 가까운 노드부터 방문한다. */
export function bfs(graph: GraphData, start: string): GraphStepState[] {
  const adj = buildAdjacency(graph);
  const { steps, push } = createRecorder();
  const visited: string[] = [];
  const traversedEdges: Array<[string, string]> = [];
  const queue: string[] = [start];
  const enqueued = new Set<string>([start]);

  push({ visited: [], frontier: [...queue], current: null, traversedEdges: [], description: `BFS 시작: ${start} 를 큐에 넣습니다.` });

  while (queue.length > 0) {
    const current = queue.shift() as string;
    visited.push(current);
    push({ visited: [...visited], frontier: [...queue], current, traversedEdges: [...traversedEdges], description: `큐에서 ${current} 를 꺼내 방문합니다.` });

    for (const next of adj.get(current) ?? []) {
      if (!enqueued.has(next)) {
        enqueued.add(next);
        queue.push(next);
        traversedEdges.push([current, next]);
        push({ visited: [...visited], frontier: [...queue], current, traversedEdges: [...traversedEdges], description: `이웃 ${next} 를 큐에 추가합니다.` });
      }
    }
  }

  push({ visited: [...visited], frontier: [], current: null, traversedEdges: [...traversedEdges], description: `BFS 완료! 방문 순서: ${visited.join(' → ')}` });
  return steps;
}

/** 깊이 우선 탐색 — 스택을 사용해 한 방향으로 끝까지 파고든다. */
export function dfs(graph: GraphData, start: string): GraphStepState[] {
  const adj = buildAdjacency(graph);
  const { steps, push } = createRecorder();
  const visited: string[] = [];
  const traversedEdges: Array<[string, string]> = [];
  const stack: string[] = [start];
  const seen = new Set<string>();

  push({ visited: [], frontier: [...stack], current: null, traversedEdges: [], description: `DFS 시작: ${start} 를 스택에 넣습니다.` });

  while (stack.length > 0) {
    const current = stack.pop() as string;
    if (seen.has(current)) continue;
    seen.add(current);
    visited.push(current);
    push({ visited: [...visited], frontier: [...stack], current, traversedEdges: [...traversedEdges], description: `스택에서 ${current} 를 꺼내 방문합니다.` });

    const neighbors = [...(adj.get(current) ?? [])].reverse();
    for (const next of neighbors) {
      if (!seen.has(next)) {
        stack.push(next);
        traversedEdges.push([current, next]);
        push({ visited: [...visited], frontier: [...stack], current, traversedEdges: [...traversedEdges], description: `아직 방문하지 않은 ${next} 를 스택에 쌓습니다.` });
      }
    }
  }

  push({ visited: [...visited], frontier: [], current: null, traversedEdges: [...traversedEdges], description: `DFS 완료! 방문 순서: ${visited.join(' → ')}` });
  return steps;
}
