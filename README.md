<<<<<<< HEAD
# 🚀 PathForge AI - SW 마이스터고 학생 맞춤형 로드맵 & 커리어 에이전트(Team JPG)

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
- **Web language**: HTML & CSS
- **Language**: JavaScript & TypeScript

### AI
- **Engine**: Gemini API

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
=======
# AlgoVisualizer Workspace

이 워크스페이스는 `algo-visualizer/` 폴더 안에 React + TypeScript 기반의 알고리즘 시각화 앱을 포함하고 있습니다.

## 주요 내용

- `algo-visualizer/` : 실제 애플리케이션 소스 코드, 빌드 설정, 문서가 위치한 메인 프로젝트 폴더입니다.
- `CLAUDE.md` : 프로젝트 개발 지침 및 프롬프트 엔지니어링 노트입니다.
- `auth_manager.py`, `greeter.py` : 워크스페이스에 포함된 추가 유틸리티 파일로, 메인 앱 실행과는 별개입니다.

## 개발 시작

1. `cd algo-visualizer`
2. `npm install`
3. `npm run dev`
4. 브라우저에서 Vite가 표시하는 주소로 접속

> 핵심 앱 문서는 `algo-visualizer/README.md`에 있습니다. 이 파일은 `algo-visualizer` 내부 앱에 대한 설치, 실행, 폴더 구조, 기능 설명을 담고 있습니다.

## 워크스페이스 구조

```
.
├─ CLAUDE.md
├─ auth_manager.py
├─ greeter.py
└─ algo-visualizer/
   ├─ README.md
   ├─ index.html
   ├─ package.json
   ├─ tsconfig.json
   ├─ src/
   │  ├─ App.tsx
   │  ├─ main.tsx
   │  ├─ algorithms/
   │  ├─ components/
   │  ├─ lib/
   │  ├─ physics/
   │  ├─ types/
   │  └─ ...
   └─ ...
```

## 주의 사항

- `algo-visualizer` 폴더가 메인 앱입니다. 루트 폴더의 다른 파일은 앱 동작에 필수적이지 않습니다.
- `algo-visualizer/README.md`를 참고하여 실제 실행 방법과 앱 기능을 확인하세요.
>>>>>>> 8f10ced (fe)
