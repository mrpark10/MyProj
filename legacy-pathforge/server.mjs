// PathForge 서버 — 정적 파일 + Claude 멀티턴 대화 프록시 (의존성 0, Node 내장 모듈만 사용)
// 실행: node server.mjs  → http://localhost:5173
//
// 자유 대화형 챗봇:
//   - 환경변수 ANTHROPIC_API_KEY 가 있으면 Claude(claude-opus-4-8)가 대화 맥락을 유지하며 자유롭게 답한다.
//     학습 로드맵이 필요한 순간에는 응답에 roadmap 을 함께 채워 카드로 보여준다.
//   - 키가 없거나 API 오류면 { source: 'local' } 을 반환해 클라이언트가 내장 로드맵/기본 응답으로 폴백한다.
//   - API 키는 서버에만 두어 브라우저에 노출되지 않는다.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 5173;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-opus-4-8'; // 가장 똑똑한 Opus급 모델

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const MAJOR_ENUM = ['fe', 'be', 'devops', 'em', 'flutter', 'ios', 'android', 'ai', 'uiux', 'game', 'security'];

const ROADMAP_OBJECT = {
  type: 'object',
  additionalProperties: false,
  required: ['major', 'title', 'intro', 'steps'],
  properties: {
    major: { type: 'string', enum: MAJOR_ENUM },
    title: { type: 'string' },
    intro: { type: 'string' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'category', 'difficulty', 'estimatedHours', 'description', 'topics'],
        properties: {
          label: { type: 'string' },
          category: { type: 'string', enum: ['concept', 'practice', 'project'] },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          estimatedHours: { type: 'integer' },
          description: { type: 'string' },
          topics: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

// 대화 응답 스키마: reply(자유 대화 텍스트) + roadmap(필요 시 채움, 아니면 null)
const CHAT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'roadmap'],
  properties: {
    reply: { type: 'string' },
    roadmap: { anyOf: [{ type: 'null' }, ROADMAP_OBJECT] },
  },
};

const SYSTEM_PROMPT = `너는 소프트웨어마이스터고 학생들의 1:1 멘토이자 IT 현업 개발 리드인 "PathForge AI"다.
학생과 편하게 자유 대화를 나누며 진로·학습·기술에 대한 질문에 친절하고 실용적으로 답한다.

대화 규칙:
- 항상 한국어로, 따뜻하고 격려하는 말투로 대화한다. 이전 대화 맥락을 기억하고 이어서 답한다.
- 진로 고민, 기술 개념 질문, 공부 방법, 잡담 등 무엇이든 자연스럽게 답한다.
- 대상은 대학생이 아니라 소프트웨어마이스터고 학생이다. 학술/이론(수치해석 등)이 아니라 실무 스택·토이 프로젝트·포트폴리오·캡스톤 중심으로 조언한다.

로드맵(roadmap) 필드 규칙:
- 학생이 특정 분야의 "학습 로드맵/커리큘럼/뭐부터 공부해야 하는지"를 원할 때만 roadmap 을 채운다. 그 외 일반 대화·개념 질문·잡담에는 roadmap 을 null 로 둔다.
- roadmap 을 채울 때 major 는 다음 중 가장 알맞은 하나로 매핑한다: fe(프론트엔드), be(백엔드), devops(DevOps/인프라/배포), em(임베디드/펌웨어/하드웨어), flutter, ios, android, ai(AI/머신러닝), uiux(UI/UX 디자인), game(게임), security(보안).
- roadmap.steps 는 선이수 순서대로 8~12단계로 상세하게 구성한다. 각 step 은 category(concept/practice/project), difficulty(beginner/intermediate/advanced), estimatedHours(정수), description(한두 문장), topics(핵심 세부 주제 3~5개)를 갖는다.
- roadmap 을 채운 경우, reply 에는 로드맵을 소개하는 짧은 한두 문장만 쓴다(로드맵 카드가 따로 표시되므로 단계를 텍스트로 나열하지 않는다).
- 분야가 애매하면 roadmap 을 null 로 두고, reply 로 어떤 분야가 궁금한지 되물어본다.

반드시 정해진 JSON 스키마 형식만 출력한다.`;

/** 대화 히스토리를 Claude 형식으로 정리(user/assistant 교대, 첫 메시지는 user). */
function sanitizeMessages(raw) {
  const out = [];
  for (const m of raw) {
    if (!m || typeof m.content !== 'string' || !m.content.trim()) continue;
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    out.push({ role, content: m.content.slice(0, 4000) });
  }
  // 첫 메시지는 user 여야 한다
  while (out.length && out[0].role !== 'user') out.shift();
  return out.slice(-20); // 최근 20턴만
}

/** Claude 멀티턴 대화. 성공 시 { reply, roadmap|null }, 실패 시 null. */
async function chatWithClaude(messages) {
  if (!API_KEY) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages,
        output_config: { format: { type: 'json_schema', schema: CHAT_SCHEMA } },
      }),
    });

    if (!res.ok) {
      console.error(`[Claude] HTTP ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    if (data.stop_reason === 'refusal') {
      console.error('[Claude] refusal');
      return null;
    }
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    if (!textBlock) return null;
    const parsed = JSON.parse(textBlock.text);
    if (typeof parsed.reply !== 'string') return null;
    return parsed;
  } catch (err) {
    console.error('[Claude] error:', err.message);
    return null;
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on('end', () => resolve(body));
    req.on('error', () => resolve(''));
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const server = createServer(async (req, res) => {
  // --- API: 멀티턴 대화 ---
  if (req.method === 'POST' && (req.url || '').split('?')[0] === '/api/chat') {
    const body = await readBody(req);
    let messages = [];
    try { messages = sanitizeMessages(JSON.parse(body || '{}').messages || []); } catch { /* ignore */ }
    if (!messages.length) return sendJson(res, 400, { error: 'empty messages' });

    const result = await chatWithClaude(messages);
    if (result) return sendJson(res, 200, { source: 'ai', reply: result.reply, roadmap: result.roadmap || null });
    // 키 없음 / 실패 → 클라이언트 로컬 폴백
    return sendJson(res, 200, { source: 'local' });
  }

  // --- 정적 파일 ---
  try {
    let pathname = decodeURIComponent((req.url || '/').split('?')[0]);
    if (pathname === '/') pathname = '/index.html';
    const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = join(ROOT, safe);
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`PathForge 서버 실행 중: http://localhost:${PORT}`);
  console.log(API_KEY
    ? `AI 자유 대화 활성화 (모델: ${MODEL})`
    : 'ANTHROPIC_API_KEY 미설정 → 내장 로드맵 + 기본 응답으로 동작 (자유 대화를 켜려면 키를 설정하세요)');
});
