# 🚀 DevPath AI - SW 마이스터고 학생 맞춤형 로드맵 & 커리어 에이전트

> **하네스 엔지니어링(Harness Engineering)** 및 **프롬프트 엔지니어링(Prompt Engineering)** 기법을 활용하여 SW 마이스터고 학생들에게 실무 중심 학습 로드맵과 1:1 커리어 피드백을 제공하는 AI 에이전트 서비스입니다.

---

## 📌 주요 기능 (Key Features)

- 🎯 **맞춤형 직무 로드맵 생성**: 백엔드, 프론트엔드, AI, Cloud/DevOps 등 희망 직무 및 현재 기술 스택 기반 로드맵 제안
- 💡 **실무 중심 프로젝트 추천**: 대학 이론 대신 고교생 포트폴리오/캡스톤 디자인에 바로 적용 가능한 토이 프로젝트 아이디어 추천
- 🛡️ **하네스 자가 수정 파이프라인**: Zod Schema 검증 및 자가 수정(Self-Correction) 루프를 통한 높은 데이터 신뢰도 보장
- 💬 **대화형 AI 멘토 챗봇**: Chain-of-Thought(CoT) 기법으로 학생의 상황을 분석 후 최적의 커리어 피드백 제공

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend & UI
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide-react

### AI & Harness Layer
- **Engine**: OpenAI API / Claude API
- **Validation**: Zod (Schema Enforcement)
- **Prompt Engineering**: Persona Prompting, Few-Shot, Chain-of-Thought (CoT)
- **Harness Control**: Self-Correction Loop (Max 3 Retries), Fallback Mechanism

---

## 🏗️ 시스템 아키텍처 (Architecture)

```text
[User Input] ➡️ [Prompt Assembly (CoT + Few-Shot)] ➡️ [LLM Call]
                                                             │
                                                             ▼
                                                    [Zod Schema Validation]
                                                             │
                                           ┌─────────────────┴─────────────────┐
                                       (Validation Pass)               (Validation Fail)
                                           │                                   │
                                           ▼                                   ▼
                                  [Structured Output] ⬅️ Retry ⬅️ [Self-Correction Loop]
                                                                        │ (3회 실패 시)
                                                                        ▼
                                                                [Fallback Data]
