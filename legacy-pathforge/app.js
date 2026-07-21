/* PathForge — AI 로드맵 챗봇 (토스 디자인, 순수 HTML/CSS/JS)
 *
 * 사용자가 되고 싶은 개발자 분야를 물어보면, 서버의 Claude API(claude-opus-4-8)가
 * 질문을 분석해 매우 상세한 학습 로드맵을 생성한다.
 * 서버에 API 키가 없거나 오프라인이면, 내장된 10개 전공 상세 로드맵으로 자동 폴백한다.
 */

const { MAJOR_META, CATEGORY_LABEL, DIFFICULTY_LABEL, MAJOR_KEYWORDS, ROADMAPS } = window.PATHFORGE_DATA;

/* ===================== 전공 추론(로컬 폴백용) ===================== */

function detectMajor(message) {
  const text = ' ' + message.toLowerCase() + ' ';
  let best = null;
  let bestScore = 0;
  for (const [major, keywords] of Object.entries(MAJOR_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) if (text.includes(kw)) score += 1;
    if (score > bestScore) { bestScore = score; best = major; }
  }
  return best;
}

/* ===================== 채팅 UI ===================== */

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const chipsEl = document.getElementById('chips');
const resetBtn = document.getElementById('resetBtn');

const SUGGESTIONS = [
  '프론트엔드 개발자가 되고 싶어요',
  'DevOps 로드맵 알려줘',
  '프론트랑 백엔드 중에 뭐가 나아요?',
  'Docker가 뭔지 쉽게 설명해줘',
];

function scrollToBottom() {
  const chat = document.querySelector('.chat');
  if (chat) chat.scrollTop = chat.scrollHeight;
}

function addUserMessage(text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg user';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  scrollToBottom();
}

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'msg ai';
  wrap.id = 'typing-indicator';
  wrap.innerHTML = `
    <div class="ai-row">
      <div class="ai-name"><span class="ai-avatar">🤖</span>PathForge AI</div>
      <div class="bubble typing"><span></span><span></span><span></span></div>
    </div>`;
  messagesEl.appendChild(wrap);
  scrollToBottom();
}

function removeTyping() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

/** AI 텍스트 말풍선(+선택지) */
function addAiMessage({ text, options, badge }) {
  const wrap = document.createElement('div');
  wrap.className = 'msg ai';

  const row = document.createElement('div');
  row.className = 'ai-row';
  const badgeHtml = badge ? `<span class="ai-badge">${badge}</span>` : '';
  row.innerHTML = `<div class="ai-name"><span class="ai-avatar">🤖</span>PathForge AI ${badgeHtml}</div>`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  row.appendChild(bubble);

  if (options) {
    const optWrap = document.createElement('div');
    optWrap.className = 'option-chips';
    for (const [major, meta] of Object.entries(MAJOR_META)) {
      const chip = document.createElement('button');
      chip.className = 'option-chip';
      chip.innerHTML = `${meta.emoji} ${meta.label}`;
      chip.addEventListener('click', () => handleUserInput(`${meta.label} 로드맵 알려줘`));
      optWrap.appendChild(chip);
    }
    row.appendChild(optWrap);
  }

  wrap.appendChild(row);
  messagesEl.appendChild(wrap);
  scrollToBottom();
}

/** 로드맵을 토스 스타일 상세 단계 카드로 렌더링 */
function addRoadmapCard(major, roadmap) {
  const meta = MAJOR_META[major] || { label: roadmap.title, emoji: '🧭', tint: '#eef2ff' };

  const wrap = document.createElement('div');
  wrap.className = 'msg ai';

  const card = document.createElement('div');
  card.className = 'roadmap-card';

  const totalHours = roadmap.steps.reduce((s, n) => s + (n.estimatedHours || 0), 0);

  const stepsHtml = roadmap.steps.map((n, i) => {
    const topicsHtml = (n.topics && n.topics.length)
      ? `<div class="topics">${n.topics.map((t) => `<span class="topic">${escapeHtml(t)}</span>`).join('')}</div>`
      : '';
    return `
    <div class="step">
      <div class="step-rail">
        <div class="step-num">${i + 1}</div>
        <div class="step-line"></div>
      </div>
      <div class="step-body">
        <div class="step-title">${escapeHtml(n.label)}</div>
        <div class="badges">
          <span class="badge">${CATEGORY_LABEL[n.category] || n.category}</span>
          <span class="badge dif-${n.difficulty}">${DIFFICULTY_LABEL[n.difficulty] || n.difficulty}</span>
          ${n.estimatedHours != null ? `<span class="badge">⏱ ${n.estimatedHours}시간</span>` : ''}
        </div>
        <p class="step-desc">${escapeHtml(n.description)}</p>
        ${topicsHtml}
      </div>
    </div>`;
  }).join('');

  card.innerHTML = `
    <div class="roadmap-card-head">
      <div class="rc-emoji" style="background:${meta.tint}">${meta.emoji}</div>
      <div>
        <h3 class="rc-title">${escapeHtml(roadmap.title)}</h3>
        <p class="rc-sub">${roadmap.steps.length}단계 · 총 예상 ${totalHours}시간</p>
      </div>
    </div>
    <div class="steps">${stepsHtml}</div>
    <div class="rc-footer">💡 각 단계마다 작은 토이 프로젝트로 복습하고, 결과물은 GitHub에 정리해 두면 포트폴리오가 돼요.</div>
  `;

  wrap.appendChild(card);
  messagesEl.appendChild(wrap);
  scrollToBottom();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ===================== 멀티턴 대화 처리 (AI 우선 → 로컬 폴백) ===================== */

let busy = false;
const history = []; // { role: 'user' | 'assistant', content: string } — 대화 맥락

/** AI 응답을 화면에 반영하고 히스토리에 저장 */
function applyAiTurn({ reply, roadmap, badge }) {
  addAiMessage({ text: reply, badge });
  if (roadmap && Array.isArray(roadmap.steps) && roadmap.steps.length) {
    addRoadmapCard(roadmap.major, roadmap);
  }
  history.push({ role: 'assistant', content: reply });
}

/** 로컬 폴백(키 없음/오프라인): 로드맵은 감지해서 제공, 그 외엔 기본 안내 */
function localReply(message) {
  const major = detectMajor(message);
  if (major) {
    const meta = MAJOR_META[major];
    return {
      reply: `${meta.emoji} ${meta.label} 분야군요! 소프트웨어마이스터고 학생에게 맞춰 실무·포트폴리오 중심으로 상세 로드맵을 정리했어요. 위에서부터 순서대로 밟아보세요.`,
      roadmap: ROADMAPS[major],
    };
  }
  const text = message.toLowerCase();
  if (/(고마|감사|thank)/.test(text)) return { reply: '천만에요! 더 궁금한 분야가 있으면 언제든 물어봐 주세요. 😊', options: true };
  if (/(안녕|하이|hi|hello|반가)/.test(text)) return { reply: '안녕하세요! 어떤 개발자가 되고 싶은지, 또는 궁금한 기술이 있으면 편하게 말해 주세요. 🧭', options: true };
  return {
    reply: '(현재 서버에 AI 키가 없어 자유 대화 대신 로드맵 안내로 도와드리고 있어요.)\n어떤 분야가 궁금하신가요? 아래에서 골라주시거나 "iOS 앱 배우고 싶어"처럼 말씀해 주세요!',
    options: true,
  };
}

async function respond(userText) {
  // 1) 서버의 Claude 멀티턴 대화 시도
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.source === 'ai' && typeof data.reply === 'string') {
        removeTyping();
        applyAiTurn({ reply: data.reply, roadmap: data.roadmap, badge: '🧠 AI' });
        return;
      }
      // source === 'local' → 아래 폴백
    }
  } catch {
    // 네트워크 실패 → 폴백
  }

  // 2) 로컬 폴백
  removeTyping();
  const fb = localReply(userText);
  addAiMessage({ text: fb.reply, options: fb.options });
  if (fb.roadmap) addRoadmapCard(fb.roadmap.major || detectMajor(userText), fb.roadmap);
  history.push({ role: 'assistant', content: fb.reply });
}

function handleUserInput(rawText) {
  const text = rawText.trim();
  if (!text || busy) return;

  busy = true;
  updateSendState();
  chipsEl.innerHTML = '';
  addUserMessage(text);
  history.push({ role: 'user', content: text });
  inputEl.value = '';
  autoResize();
  showTyping();

  respond(text).finally(() => {
    busy = false;
    updateSendState();
  });
}

/* ===================== 초기화 & 이벤트 ===================== */

function renderSuggestions() {
  chipsEl.innerHTML = '';
  for (const s of SUGGESTIONS) {
    const chip = document.createElement('button');
    chip.className = 'suggest-chip';
    chip.textContent = s;
    chip.addEventListener('click', () => handleUserInput(s));
    chipsEl.appendChild(chip);
  }
}

function greeting() {
  addAiMessage({
    text: '안녕하세요! 저는 소마고 학생들의 진로·학습 멘토 PathForge AI예요. 🧭\n진로 고민, 기술 개념, 공부 방법 등 무엇이든 편하게 대화해요. 특정 분야를 어떻게 공부할지 물어보면 단계별 상세 로드맵도 만들어 드려요.\n\n(로드맵 지원 분야: 프론트엔드 · 백엔드 · DevOps · 임베디드 · Flutter · iOS · Android · AI · UI/UX · 게임 · 보안)',
  });
}

function resetChat() {
  messagesEl.innerHTML = '';
  history.length = 0;
  greeting();
  renderSuggestions();
  inputEl.focus();
}

function updateSendState() {
  sendBtn.disabled = busy || inputEl.value.trim().length === 0;
}

function autoResize() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
}

sendBtn.addEventListener('click', () => handleUserInput(inputEl.value));
inputEl.addEventListener('input', () => { autoResize(); updateSendState(); });
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleUserInput(inputEl.value);
  }
});
resetBtn.addEventListener('click', resetChat);

resetChat();
updateSendState();
