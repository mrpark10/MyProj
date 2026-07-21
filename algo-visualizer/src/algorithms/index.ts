/**
 * 알고리즘 레지스트리 — 메타데이터(복잡도·실무 활용처)와 스텝 생성기를 한 곳에 모은다.
 * UI 레이어는 이 레지스트리만 참조하고, 알고리즘 구현 세부는 알지 못한다.
 */
import type { AlgorithmDef } from '@/types/algorithm';
import { bubbleSort, insertionSort, mergeSort, quickSort, selectionSort } from './sorting';
import { heapSort, treeSort } from './treeSorting';
import { binarySearch, linearSearch } from './searching';
import { bfs, dfs } from './graph';
import { fibonacciDP } from './dp';

export const ALGORITHMS: AlgorithmDef[] = [
  {
    inputKind: 'array',
    run: bubbleSort,
    meta: {
      id: 'bubble-sort',
      name: '버블 정렬 (Bubble Sort)',
      category: 'sorting',
      summary: '인접한 두 원소를 비교·교환하며 큰 값을 뒤로 밀어내는 가장 기본적인 정렬.',
      howItWorks: '배열을 왼쪽부터 훑으며 인접한 두 원소를 비교해 순서가 잘못되면 교환합니다. 한 번 순회할 때마다 가장 큰 값이 맨 뒤에 확정됩니다. 교환이 한 번도 없으면 이미 정렬된 것이므로 조기 종료할 수 있습니다.',
      complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
      stable: true,
      useCases: [
        { title: '교육용 정렬 개념 학습', detail: '구현이 가장 단순해 정렬의 비교·교환 개념을 처음 배울 때 표준 예제로 쓰입니다.' },
        { title: '거의 정렬된 소규모 데이터 점검', detail: '조기 종료 최적화 덕분에 이미 정렬된 데이터 검증(예: 센서 값이 순서대로 들어왔는지 확인)에 O(n) 으로 동작합니다.' },
      ],
    },
  },
  {
    inputKind: 'array',
    run: selectionSort,
    meta: {
      id: 'selection-sort',
      name: '선택 정렬 (Selection Sort)',
      category: 'sorting',
      summary: '남은 구간에서 최솟값을 찾아 앞으로 보내는 정렬. 교환 횟수가 최소.',
      howItWorks: '정렬되지 않은 구간 전체를 훑어 최솟값의 위치를 찾은 뒤, 그 값을 구간의 맨 앞과 한 번만 교환합니다. 비교는 많지만 실제 교환(쓰기)은 최대 n-1번뿐입니다.',
      complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
      stable: false,
      useCases: [
        { title: '쓰기 비용이 비싼 저장장치', detail: 'EEPROM·플래시 메모리처럼 쓰기 횟수가 수명에 직결되는 임베디드 저장장치에서, 교환 횟수가 최소인 특성이 유리합니다.' },
        { title: '메모리가 극히 제한된 환경', detail: '추가 메모리 없이(O(1)) 제자리 정렬이 가능해 소형 MCU 펌웨어에서 작은 배열을 정렬할 때 쓰입니다.' },
      ],
    },
  },
  {
    inputKind: 'array',
    run: insertionSort,
    meta: {
      id: 'insertion-sort',
      name: '삽입 정렬 (Insertion Sort)',
      category: 'sorting',
      summary: '앞쪽의 정렬된 구간에 새 원소를 알맞은 자리에 끼워 넣는 정렬.',
      howItWorks: '배열의 앞부분을 이미 정렬된 구간으로 보고, 다음 원소를 꺼내 뒤에서부터 비교하며 자리를 만들어 삽입합니다. 데이터가 거의 정렬되어 있으면 비교가 거의 일어나지 않아 매우 빠릅니다.',
      complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
      stable: true,
      useCases: [
        { title: '하이브리드 정렬의 내부 엔진', detail: 'V8·JDK 등 실제 표준 라이브러리의 정렬(TimSort/IntroSort)은 작은 부분 배열(보통 16개 이하)에서 삽입 정렬로 전환해 성능을 끌어올립니다.' },
        { title: '실시간 스트리밍 데이터 삽입', detail: '이미 정렬된 리더보드나 랭킹 목록에 새 점수가 하나씩 들어올 때, 전체 재정렬 없이 알맞은 위치에 O(n) 으로 끼워 넣습니다.' },
      ],
    },
  },
  {
    inputKind: 'array',
    run: mergeSort,
    meta: {
      id: 'merge-sort',
      name: '병합 정렬 (Merge Sort)',
      category: 'sorting',
      summary: '분할 정복으로 절반씩 나눠 정렬한 뒤 합치는, 최악에도 O(n log n) 인 안정 정렬.',
      howItWorks: '배열을 절반으로 계속 쪼개 크기가 1이 될 때까지 나눈 뒤, 두 정렬된 구간을 앞에서부터 비교하며 하나로 합칩니다. 입력 분포와 무관하게 항상 O(n log n) 을 보장합니다.',
      complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
      stable: true,
      useCases: [
        { title: '외부 정렬 (대용량 파일)', detail: '메모리에 다 올릴 수 없는 수십 GB 로그 파일을 조각내 정렬한 뒤 순차적으로 병합하는 External Merge Sort 의 핵심입니다. 순차 읽기만 하므로 디스크에 최적입니다.' },
        { title: '안정 정렬이 필요한 다중 기준 정렬', detail: '"부서별 → 이름순"처럼 여러 번 정렬할 때 이전 정렬 순서가 보존되어야 합니다. Java Collections.sort 와 Python sorted 가 이 방식(TimSort)을 씁니다.' },
      ],
    },
  },
  {
    inputKind: 'array',
    run: quickSort,
    meta: {
      id: 'quick-sort',
      name: '퀵 정렬 (Quick Sort)',
      category: 'sorting',
      summary: '피벗 기준으로 좌우를 나누는 분할 정복 정렬. 실무에서 가장 빠른 범용 정렬.',
      howItWorks: '피벗을 하나 고르고 피벗보다 작은 값은 왼쪽, 큰 값은 오른쪽으로 재배치(분할)합니다. 이때 피벗의 최종 위치가 확정되며, 좌우 구간에 대해 같은 과정을 재귀적으로 반복합니다.',
      complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
      stable: false,
      useCases: [
        { title: '대용량 메모리 내 정렬 엔진', detail: 'C++ std::sort 의 IntroSort 기반으로, 캐시 지역성이 좋아 실제 하드웨어에서 같은 O(n log n) 알고리즘보다 빠릅니다. 데이터베이스의 ORDER BY 인메모리 정렬에 쓰입니다.' },
        { title: 'K번째 원소 찾기 (QuickSelect)', detail: '분할 아이디어를 그대로 활용해 전체를 정렬하지 않고 상위 K개·중앙값을 평균 O(n) 에 찾습니다. 추천 시스템의 Top-K 랭킹 추출에 활용됩니다.' },
      ],
    },
  },
  {
    inputKind: 'array',
    run: heapSort,
    meta: {
      id: 'heap-sort',
      name: '힙 정렬 (Heap Sort)',
      category: 'sorting',
      summary: '배열을 최대 힙으로 만든 뒤 루트(최댓값)를 뒤로 보내길 반복하는 제자리 정렬.',
      howItWorks:
        '배열을 완전이진트리로 간주해 부모가 자식보다 큰 "최대 힙"을 만듭니다. 그러면 루트가 전체 최댓값이므로, 루트와 맨 뒤 원소를 교환해 최댓값을 확정하고 힙 크기를 하나 줄인 뒤 다시 힙 성질을 복구(sift down)합니다. 이를 반복하면 정렬이 끝납니다.',
      complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
      stable: false,
      useCases: [
        {
          title: '우선순위 큐 (스케줄러)',
          detail: '힙 자료구조 자체가 OS 프로세스 스케줄러와 작업 큐의 핵심입니다. 가장 우선순위 높은 작업을 O(log n) 에 꺼낼 수 있어 실시간 시스템에 쓰입니다.',
        },
        {
          title: '최악의 경우가 보장되어야 하는 시스템',
          detail: '퀵 정렬과 달리 최악에도 O(n log n) 이고 추가 메모리가 O(1) 이라, 리눅스 커널과 임베디드처럼 메모리와 응답시간 상한이 중요한 환경에서 선택됩니다.',
        },
      ],
    },
  },
  {
    inputKind: 'array',
    run: treeSort,
    meta: {
      id: 'tree-sort',
      name: '트리 정렬 (Tree Sort)',
      category: 'sorting',
      summary: '이진탐색트리에 값을 삽입한 뒤 중위 순회로 정렬된 순서를 얻는 정렬.',
      howItWorks:
        '모든 값을 이진탐색트리(BST)에 삽입합니다. BST 는 왼쪽 < 부모 ≤ 오른쪽 성질을 가지므로, 중위 순회(왼쪽 → 루트 → 오른쪽)로 방문하면 자동으로 오름차순이 됩니다. 다만 이미 정렬된 입력이 들어오면 트리가 한쪽으로 치우쳐 O(n²) 로 나빠집니다.',
      complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(n)' },
      stable: true,
      useCases: [
        {
          title: '데이터베이스 인덱스 구축',
          detail: 'BST 를 균형 트리(B-Tree, Red-Black Tree)로 확장한 구조가 DB 인덱스입니다. 삽입하면서 정렬 상태를 유지하므로 범위 검색(BETWEEN, ORDER BY)에 그대로 활용됩니다.',
        },
        {
          title: '실시간 삽입되는 데이터의 정렬 유지',
          detail: '데이터가 계속 추가되는 랭킹·로그 시스템에서, 전체를 다시 정렬하지 않고 삽입 시점마다 O(log n) 으로 정렬 상태를 유지할 수 있습니다.',
        },
      ],
    },
  },
  {
    inputKind: 'array',
    run: linearSearch,
    meta: {
      id: 'linear-search',
      name: '선형 탐색 (Linear Search)',
      category: 'searching',
      summary: '처음부터 끝까지 하나씩 확인하는 가장 단순한 탐색.',
      howItWorks: '배열의 0번 인덱스부터 순서대로 목표값과 비교합니다. 정렬이 필요 없고 어떤 자료구조에서도 동작하지만, 데이터가 커질수록 느려집니다.',
      complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
      useCases: [
        { title: '정렬되지 않은 소규모 데이터 조회', detail: '설정값 목록이나 게임의 인벤토리처럼 항목이 수십 개 수준이면 인덱스를 만드는 비용이 더 크므로 선형 탐색이 실용적입니다.' },
        { title: '연결 리스트 순회 탐색', detail: '임의 접근이 불가능한 연결 리스트·스트림 데이터에서는 이진 탐색을 쓸 수 없어 선형 탐색이 유일한 선택입니다.' },
      ],
    },
  },
  {
    inputKind: 'array',
    run: binarySearch,
    meta: {
      id: 'binary-search',
      name: '이진 탐색 (Binary Search)',
      category: 'searching',
      summary: '정렬된 배열에서 탐색 범위를 절반씩 줄여가는 로그 시간 탐색.',
      howItWorks: '정렬된 배열의 중앙값과 목표값을 비교해, 목표가 더 크면 오른쪽 절반만, 작으면 왼쪽 절반만 남깁니다. 한 번 비교할 때마다 후보가 절반으로 줄어 100만 개도 20번이면 찾습니다.',
      complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
      useCases: [
        { title: '데이터베이스 인덱스 조회', detail: 'RDBMS 의 B-Tree 인덱스는 이진 탐색을 다진 트리로 확장한 구조입니다. 수억 건의 레코드에서 특정 키를 몇 번의 디스크 접근만으로 찾아냅니다.' },
        { title: '파라메트릭 서치 (최적값 찾기)', detail: '"조건을 만족하는 최소 용량"처럼 답이 단조적인 최적화 문제에서, 답 자체를 이분 탐색해 O(log n) 에 찾습니다. 서버 오토스케일링 임계치 계산 등에 쓰입니다.' },
      ],
    },
  },
  {
    inputKind: 'graph',
    run: bfs,
    meta: {
      id: 'bfs',
      name: '너비 우선 탐색 (BFS)',
      category: 'graph',
      summary: '큐를 이용해 시작점에서 가까운 노드부터 넓게 퍼져나가는 탐색.',
      howItWorks: '시작 노드를 큐에 넣고, 큐에서 꺼낸 노드의 이웃을 모두 큐에 추가합니다. 거리가 가까운 노드부터 방문하므로, 가중치가 없는 그래프에서 최단 경로를 보장합니다.',
      complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
      useCases: [
        { title: 'SNS 친구 추천 (n촌 관계)', detail: '페이스북·링크드인의 "2촌 친구" 추천은 내 노드에서 BFS 를 2단계까지 수행해 찾습니다. 가까운 관계부터 탐색하는 특성이 그대로 쓰입니다.' },
        { title: '게임 길찾기 · 최단 경로', detail: '격자 맵에서 가중치가 동일할 때 BFS 는 최소 이동 칸 수를 보장합니다. 퍼즐 게임의 최소 이동 횟수 계산에 표준으로 쓰입니다.' },
      ],
    },
  },
  {
    inputKind: 'graph',
    run: dfs,
    meta: {
      id: 'dfs',
      name: '깊이 우선 탐색 (DFS)',
      category: 'graph',
      summary: '스택을 이용해 한 방향으로 끝까지 파고든 뒤 되돌아오는 탐색.',
      howItWorks: '한 노드에서 갈 수 있는 곳까지 최대한 깊이 들어간 뒤, 더 갈 곳이 없으면 이전 갈림길로 되돌아와(백트래킹) 다른 경로를 탐색합니다.',
      complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
      useCases: [
        { title: '빌드 의존성 해석 (위상 정렬)', detail: 'npm·Gradle 이 패키지 의존성 순서를 정하고 순환 참조를 탐지할 때 DFS 기반 위상 정렬을 사용합니다.' },
        { title: '미로 생성 및 백트래킹 탐색', detail: '게임의 절차적 미로 생성, 스도쿠 풀이처럼 "가능한 경로를 끝까지 시도하고 실패하면 되돌아가는" 문제의 기본 골격입니다.' },
      ],
    },
  },
  {
    inputKind: 'array',
    run: fibonacciDP,
    meta: {
      id: 'fibonacci-dp',
      name: '피보나치 DP (Dynamic Programming)',
      category: 'dp',
      summary: '이전 계산 결과를 표에 저장해 재사용하는 동적 계획법의 대표 예제.',
      howItWorks: '단순 재귀는 같은 값을 지수적으로 중복 계산하지만, DP 는 dp[i] = dp[i-1] + dp[i-2] 결과를 테이블에 저장해 각 값을 딱 한 번만 계산합니다. O(2ⁿ) 이 O(n) 으로 줄어듭니다.',
      complexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', space: 'O(n)' },
      useCases: [
        { title: '자원 배분 최적화 (배낭 문제)', detail: '한정된 서버 자원에 작업을 배치해 처리량을 최대화하는 스케줄링이 대표적인 DP 응용입니다. 부분 문제의 최적해를 재사용합니다.' },
        { title: '문자열 유사도 · diff 알고리즘', detail: 'Git 의 diff, 맞춤법 검사기의 편집 거리(Edit Distance)는 DP 테이블로 두 문자열의 최소 편집 횟수를 계산합니다.' },
      ],
    },
  },
];

/** id 로 알고리즘 정의를 찾는다. */
export function findAlgorithm(id: string): AlgorithmDef | undefined {
  return ALGORITHMS.find((algorithm) => algorithm.meta.id === id);
}
