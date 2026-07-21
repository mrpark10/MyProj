/**
 * 그래프 탐색(BFS · DFS) 단위 테스트.
 */
import { bfs, dfs } from '@/algorithms/graph/graph';
import { SAMPLE_GRAPH } from '@/utils/sampleData';

describe('그래프 탐색', () => {
  it('BFS 는 모든 연결 노드를 방문한다', () => {
    const steps = bfs(SAMPLE_GRAPH, 'A');
    const last = steps[steps.length - 1];
    expect(last.visited).toHaveLength(SAMPLE_GRAPH.nodes.length);
    expect(last.visited[0]).toBe('A');
  });

  it('BFS 는 시작점에서 가까운 노드를 먼저 방문한다', () => {
    const last = bfs(SAMPLE_GRAPH, 'A').slice(-1)[0];
    // A 의 직접 이웃 B, C 가 그 다음 depth 노드들보다 먼저 나와야 한다
    expect(last.visited.indexOf('B')).toBeLessThan(last.visited.indexOf('D'));
    expect(last.visited.indexOf('C')).toBeLessThan(last.visited.indexOf('G'));
  });

  it('DFS 는 모든 연결 노드를 중복 없이 방문한다', () => {
    const last = dfs(SAMPLE_GRAPH, 'A').slice(-1)[0];
    expect(last.visited).toHaveLength(SAMPLE_GRAPH.nodes.length);
    expect(new Set(last.visited).size).toBe(last.visited.length);
  });
});
