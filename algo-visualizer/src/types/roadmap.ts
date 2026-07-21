/**
 * PathForge — 전공별 로드맵 / 퀴즈 / 실습 데이터 타입 정의
 *
 * 이 모듈은 에이전트 간 통신 및 데이터 저장에 사용되는 표준 데이터 구조를
 * 정의한다. 모든 구조는 JSON 직렬화가 가능해야 하며(순수 데이터, 함수/클래스 금지),
 * 하네스 레이어(dagValidator, codeEvaluator)와 UI 레이어(React Flow)가
 * 공통으로 참조하는 단일 진실 공급원(Single Source of Truth) 역할을 한다.
 *
 * 규격화된 출력(Structured Output) 규칙에 따라, 런타임 검증이 필요한 경우
 * 아래 정의된 JSON Schema 상수(`ROADMAP_JSON_SCHEMA` 등)를 사용한다.
 */

/** 소프트웨어마이스터고 전공 분류 */
export type Major = 'backend' | 'frontend' | 'devops' | 'embedded';

/** 학습 난이도 단계 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/** 로드맵 노드의 학습 유형 */
export type NodeCategory = 'concept' | 'practice' | 'project' | 'quiz';

/**
 * 실습/퀴즈 채점에 사용할 언어.
 * 1단계 codeEvaluator 는 JS/TS 만 지원한다.
 */
export type SupportedLanguage = 'javascript' | 'typescript';

/**
 * 로드맵을 구성하는 단일 학습 노드.
 * `id` 는 그래프 내에서 유일해야 하며, 간선(RoadmapEdge)의 참조 키가 된다.
 */
export interface RoadmapNode {
  /** 그래프 내 유일 식별자 (예: "js-basics") */
  id: string;
  /** 화면에 표시되는 노드 제목 (예: "JavaScript 기초") */
  label: string;
  /** 이 노드가 속한 전공 */
  major: Major;
  /** 학습 유형 */
  category: NodeCategory;
  /** 난이도 */
  difficulty: DifficultyLevel;
  /** 노드에 대한 상세 설명 (선택) */
  description?: string;
  /** 예상 학습 시간(시간 단위, 선택) */
  estimatedHours?: number;
  /** 이 노드에 연결된 퀴즈/실습 과제 목록 (선택) */
  tasks?: LearningTask[];
}

/**
 * 로드맵의 선이수(prerequisite) 관계를 나타내는 방향 간선.
 * `source` 를 먼저 학습한 뒤 `target` 을 학습할 수 있음을 의미한다.
 * (예: source=js-basics, target=react → JavaScript 이후 React)
 */
export interface RoadmapEdge {
  /** 선이수 노드 id (먼저 학습) */
  source: string;
  /** 후행 노드 id (나중에 학습) */
  target: string;
}

/**
 * 하나의 전공 로드맵 전체.
 * 노드 집합과 선이수 간선 집합으로 구성된 방향 그래프(DAG 이어야 함).
 */
export interface Roadmap {
  /** 로드맵 식별자 */
  id: string;
  /** 로드맵 대상 전공 */
  major: Major;
  /** 로드맵 제목 */
  title: string;
  /** 학습 노드 목록 */
  nodes: RoadmapNode[];
  /** 선이수 관계 간선 목록 */
  edges: RoadmapEdge[];
}

/** 퀴즈 문항 (객관식) */
export interface QuizTask {
  taskType: 'quiz';
  /** 과제 식별자 */
  id: string;
  /** 문제 지문 */
  prompt: string;
  /** 보기 목록 */
  choices: string[];
  /** 정답 보기의 0-기반 인덱스 */
  answerIndex: number;
}

/** 코드 실습 과제 (자동 채점 대상) */
export interface PracticeTask {
  taskType: 'practice';
  /** 과제 식별자 */
  id: string;
  /** 실습 지시문 */
  prompt: string;
  /** 채점 대상 언어 */
  language: SupportedLanguage;
  /** 참고용 시작 코드 (선택) */
  starterCode?: string;
  /** 코드에 반드시 포함되어야 하는 키워드(선택, 기초 채점용) */
  requiredKeywords?: string[];
}

/** 로드맵 노드에 부착되는 학습 과제 (퀴즈 또는 실습) */
export type LearningTask = QuizTask | PracticeTask;

/**
 * JSON Schema (Draft-07) — Roadmap 런타임 검증용.
 * 외부(에이전트/DB)에서 유입되는 로드맵 데이터를 신뢰하기 전에
 * 이 스키마로 형태를 확인한다.
 */
export const ROADMAP_JSON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://pathforge.dev/schemas/roadmap.json',
  type: 'object',
  required: ['id', 'major', 'title', 'nodes', 'edges'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    major: { type: 'string', enum: ['backend', 'frontend', 'devops', 'embedded'] },
    title: { type: 'string', minLength: 1 },
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'label', 'major', 'category', 'difficulty'],
        additionalProperties: false,
        properties: {
          id: { type: 'string', minLength: 1 },
          label: { type: 'string', minLength: 1 },
          major: { type: 'string', enum: ['backend', 'frontend', 'devops', 'embedded'] },
          category: { type: 'string', enum: ['concept', 'practice', 'project', 'quiz'] },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          description: { type: 'string' },
          estimatedHours: { type: 'number', minimum: 0 },
          tasks: { type: 'array' },
        },
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        required: ['source', 'target'],
        additionalProperties: false,
        properties: {
          source: { type: 'string', minLength: 1 },
          target: { type: 'string', minLength: 1 },
        },
      },
    },
  },
} as const;
