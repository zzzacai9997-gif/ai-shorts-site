document.addEventListener("DOMContentLoaded", () => {
  injectBatchUI();
  injectSendToMakeButton();
});

// GitHub Pages 캐시/지연 대비용 (중요)
setTimeout(() => {
  injectBatchUI();
  injectSendToMakeButton();
}, 1000);
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/np7g2x9566v8tqg4w383m2f3jdhik3or";

// AI 쇼츠 · 롱폼 대본 생성기 (C: 주제 일괄 생성 자동화 포함)
// - HTML 수정 없이: JS가 "주제 일괄 입력칸 + 버튼"을 자동 삽입
// =========================

const $ = (id) => document.getElementById(id);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- 카테고리별 훅 ----
const HOOKS = {
  "힐링/감성": [
    "괜찮은 척했는데… 오늘은 좀 무너졌다.",
    "아무 일 없던 하루였는데, 마음이 왜 이러지.",
    "이 말, 나한테 해주고 싶어서 시작했어.",
    "오늘도 버텼다. 근데 그게 전부인 날.",
    "웃고 있었는데, 속은 조용히 무너지고 있었다."
  ],
  "생활꿀팁": [
    "이거 모르면 진짜 손해야.",
    "딱 10초만 하면 생활이 달라진다.",
    "오늘부터 바로 써먹는 꿀팁 하나.",
    "돈/시간 아끼는 방법, 핵심만 말할게.",
    "이거 하나 바꾸면 매일 편해진다."
  ],
  "공포/괴담": [
    "그날 밤, 절대 열면 안 되는 문이 열렸어.",
    "들리면 끝이야. 진짜로.",
    "복도 끝에서 누가… 계속 웃고 있었어.",
    "새벽 3시, 엘리베이터가 내 층에 멈췄다.",
    "문이 닫혔는데… 안에서 누가 두드렸어."
  ],
  "연애/관계": [
    "연락이 줄었다면… 이유는 생각보다 단순해.",
    "좋아하는데 힘들다면, 그건 신호야.",
    "상대가 변한 게 아니라, 내가 지친 걸 수도 있어.",
    "계속 서운하다면, 그 관계는 뭔가 어긋난 거야.",
    "말을 아끼는 순간, 마음도 멀어진다."
  ],
  "자기계발": [
    "의지가 약한 게 아니라, 방식이 틀린 거야.",
    "하루 10분만 바꾸면, 인생이 달라진다.",
    "요즘 나, 왜 이렇게 늘 제자리일까.",
    "꾸준함은 재능이 아니라 시스템이야.",
    "오늘부터 ‘이것’만 하면 된다."
  ],
  "복지/지원금": [
    "이거 신청 안 하면 그냥 못 받는다.",
    "지원금 링크 문자? 그거부터 의심해.",
    "우리 동네는 얼마까지 나오냐면…",
    "오늘 확인 안 하면, 기간 지나서 끝난다.",
    "사기 피하는 법까지 한 번에 정리할게."
  ]
};

// ---- 말투별 마무리 ----
const CTA = {
  "담백": [
    "필요하면 저장해두세요.",
    "여기까지. 저장해두면 나중에 도움 돼요.",
    "필요한 사람에게 공유해도 좋아요."
  ],
  "다정": [
    "오늘도 잘 버텼어요. 저장해두고, 필요할 때 다시 봐요.",
    "괜찮아. 천천히 해도 돼요. 저장해두자.",
    "지금 이 말이 위로가 됐다면 저장해두세요."
  ],
  "음습": [
    "오늘 밤… 이 영상이 자꾸 떠오를 거예요.",
    "혹시 방금, 뒤에서 소리 들린 거 아니죠?",
    "그 문… 오늘은 열지 마세요."
  ],
  "빠름": [
    "오케이, 저장하고 바로 써먹자!",
    "끝! 댓글로 다음 주제 던져줘!",
    "저장해두고 내일 바로 써봐!"
  ],
  "단호": [
    "결론: 지금 확인하고 처리하세요. 미루면 손해입니다.",
    "핵심만 기억하세요. 확인→신청→증빙. 끝.",
    "지금 바로 체크하고, 기간 놓치지 마세요."
  ]
};

// ---- 카테고리별 본문 포인트 ----
const POINTS = {
  "힐링/감성": ["숨을 한 번 길게", "오늘 나를 탓하지 않기", "딱 한 가지를 내려놓기", "10분만 쉬기", "따뜻한 물 한 컵"],
  "생활꿀팁": ["라벨링으로 정리", "타이머 5분 청소", "자주 쓰는 건 한 곳에", "중복 구매 리스트", "습관화 체크"],
  "공포/괴담": ["복도 센서등", "엘리베이터 거울", "문틈 바람", "새벽 발소리", "창문 두드림"],
  "연애/관계": ["기대치 조절", "경계선 세우기", "확인 질문", "말투 다듬기", "내 시간 지키기"],
  "자기계발": ["하루 10분", "기록", "환경 세팅", "작은 보상", "루틴 고정"],
  "복지/지원금": ["지자체 홈페이지", "주민센터 문의", "자격 조건 확인", "신청 기간", "사기 링크 차단"]
};

// ---- 쇼츠 1편 ----
function buildShort(topic, category, tone) {
  const hook = pick(HOOKS[category] || HOOKS["힐링/감성"]);
  const pts = shuffle(POINTS[category] || POINTS["힐링/감성"]).slice(0, 3);
  const cta = pick(CTA[tone] || CTA["담백"]);

  return [
    "[오프닝]",
    hook,
    "",
    "[본문]",
    `오늘은 딱 3가지만 기억해.`,
    `1) ${pts[0]}`,
    `2) ${pts[1]}`,
    `3) ${pts[2]}`,
    "",
    "[마무리]",
    cta
  ].join("\n");
}

// ---- 롱폼 1편 ----
function buildLong(topic, category, tone) {
  const hook = pick(HOOKS[category] || HOOKS["힐링/감성"]);
  const pts = shuffle(POINTS[category] || POINTS["힐링/감성"]).slice(0, 5);
  const cta = pick(CTA[tone] || CTA["담백"]);

  return [
    "[도입]",
    `${hook}`,
    `${topic} 이 주제로, 오늘은 조금 길게 이야기해볼게요.`,
    "",
    "[본론 1: 왜 이게 문제처럼 느껴질까]",
    `우리는 보통 ${category} 상황에서 마음이 먼저 흔들려요.`,
    `그때 제일 먼저 하는 실수는, 내 감정을 ‘별거 아닌 것’처럼 넘기는 거예요.`,
    "",
    "[본론 2: 실제로 해볼 3가지]",
    `첫째, ${pts[0]}.`,
    `둘째, ${pts[1]}.`,
    `셋째, ${pts[2]}.`,
    "",
    "[본론 3: 시청자 질문]",
    "여러분은 요즘 어떤 순간에 가장 흔들리나요?",
    "그 순간, 스스로에게 어떤 말을 해주고 있나요?",
    "오늘 한 가지만 바꿀 수 있다면, 뭘 바꾸고 싶나요?",
    "",
    "[마무리]",
    `정답은 없지만, 한 가지는 분명해요. ‘지금의 나’를 무시하지 않는 것.`,
    cta,
    "다음 영상에서는 이 주제의 ‘반대편 이야기’도 이어갈게요."
  ].join("\n");
}

// ---- 쇼츠 30개 ----
function buildShortBatch(topic, category, tone, n = 30) {
  let out = "===== 쇼츠 30개 =====\n";
  for (let i = 1; i <= n; i++) {
    out += `\n--- ${i} ---\n`;
    out += buildShort(topic, category, tone) + "\n";
  }
  return out.trim();
}

// ---- 한 주제에 대한 풀 출력 ----
function buildFullSet(topic, category, tone) {
  return [
    "===== 쇼츠 =====",
    buildShort(topic, category, tone),
    "",
    "===== 롱폼 =====",
    buildLong(topic, category, tone),
    "",
    buildShortBatch(topic, category, tone, 30)
  ].join("\n");
}

// ====================
// 기존 버튼용 함수(유지)
// ====================
window.makeScript = function () {
  const topic = $("topic").value || "오늘의 이야기";
  const category = $("category").value;
  const tone = $("tone").value;

  const one = ["===== 쇼츠 =====", buildShort(topic, category, tone)].join("\n\n");
  $("result").value = one;
};

window.runFullPipeline = function () {
  const topic = $("topic").value || "오늘의 이야기";
  const category = $("category").value;
  const tone = $("tone").value;

  $("result").value = buildFullSet(topic, category, tone);
};

// ====================
// C: "주제 일괄 생성" UI를 자동 삽입
// ====================
function injectBatchUI() {
  const topicInput = $("topic");
  if (!topicInput) return;

  // 이미 삽입됐으면 중복 방지
  if (document.getElementById("batchTopics")) return;

  // 주제 입력칸이 들어있는 카드 안에 넣기
  // (가장 가까운 .card 찾아서 아래에 삽입)
 const card = topicInput.closest(".card") || document.body;

  const wrap = document.createElement("div");
  wrap.style.marginTop = "12px";

  wrap.innerHTML = `
    <div style="margin-top:8px; font-size:13px; opacity:0.9;">주제 일괄 입력 (한 줄 = 한 주제)</div>
    <textarea id="batchTopics" placeholder="예)
지하철에서 멘탈 버티는 법
새벽 3시 엘리베이터 괴담
2026 설날 지원금 사기 피하기" style="min-height:140px;"></textarea>

    <div style="display:flex; gap:10px;">
      <button id="btnBatchRun">📦 주제 N개 일괄 생성</button>
      <button id="btnBatchDownload">💾 일괄 결과 TXT 저장</button>
    </div>

    <div id="batchHint" style="margin-top:8px; font-size:12px; opacity:0.75;">
      ※ 카테고리/말투는 위 선택값을 공통 적용. (원하면 다음에 주제별 설정도 가능)
    </div>
  `;

  card.appendChild(wrap);

  $("btnBatchRun").addEventListener("click", () => {
    const raw = $("batchTopics").value || "";
    const topics = raw.split("\n").map(t => t.trim()).filter(Boolean);
    if (topics.length === 0) {
      alert("주제를 한 줄에 하나씩 입력해줘!");
      return;
    }

    const category = $("category").value;
    const tone = $("tone").value;

    let out = `##### 일괄 생성 결과 (총 ${topics.length}개) #####\n`;
    topics.forEach((t, idx) => {
      out += `\n\n==============================\n`;
      out += `### ${idx + 1}. 주제: ${t}\n`;
      out += `==============================\n\n`;
      out += buildFullSet(t, category, tone);
    });

    $("result").value = out;
  });

  $("btnBatchDownload").addEventListener("click", () => {
    const text = $("result").value || "";
    if (!text.trim()) {
      alert("저장할 결과가 없어! 먼저 생성 버튼부터 눌러줘.");
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "batch_scripts.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
function injectSendToMakeButton() {
  const topicInput = document.getElementById("topic");
  if (!topicInput) return;
  const card = topicInput.closest(".card");
  if (!card) return;

  

  const btn = document.createElement("button");

  btn.textContent = "📤 Make로 보내서 자동 영상 만들기";
  btn.style.marginTop = "10px";

  btn.addEventListener("click", async () => {
    const topic = document.getElementById("topic").value || "오늘의 이야기";
    const category = document.getElementById("category").value;
    const tone = document.getElementById("tone").value;

    // 네 사이트가 이미 만들어주는 결과를 Make로 보낼 payload
    // (풀 생성 로직을 쓰고 싶으면 runFullPipeline() 먼저 실행해도 됨)
    const payload = { topic, category, tone, created_at: new Date().toISOString() };

    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Webhook failed");
      alert("✅ Make로 전송 완료! (자동 영상 생성 시작)");
    } catch (e) {
      alert("❌ 전송 실패: Make 웹훅 URL 확인해줘!");
    }
  });

  card.appendChild(btn);
}

function injectSendToMakeButton() {
  const topicInput = document.getElementById("topic");
  if (!topicInput) return;
  const card = topicInput.closest(".card");
  if (!card) return;

  if (document.getElementById("btnSendToMake")) return;

  const btn = document.createElement("button");
 
  btn.textContent = "📤 Make로 보내서 자동 영상 만들기";
  btn.style.marginTop = "10px";

  btn.addEventListener("click", async () => {
    const topic = document.getElementById("topic").value || "오늘의 이야기";
    const category = document.getElementById("category").value;
    const tone = document.getElementById("tone").value;

    // 네 사이트가 이미 만들어주는 결과를 Make로 보낼 payload
    // (풀 생성 로직을 쓰고 싶으면 runFullPipeline() 먼저 실행해도 됨)
    const payload = { topic, category, tone, created_at: new Date().toISOString() };

    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Webhook failed");
      alert("✅ Make로 전송 완료! (자동 영상 생성 시작)");
    } catch (e) {
      alert("❌ 전송 실패: Make 웹훅 URL 확인해줘!");
    }
  });

  card.appendChild(btn);
}
// ---- Make로 보내기 버튼 추가 ----
const btnMake = document.createElement("button");

btnMake.textContent = "📤 Make로 보내서 자동화 시작";
btnMake.style.marginTop = "10px";

btnMake.addEventListener("click", async () => {
  const topic = $("topic").value || "오늘의 이야기";
  const category = $("category").value;
  const tone = $("tone").value;

  const payload = { topic, category, tone, created_at: new Date().toISOString() };

  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Webhook failed");
    alert("✅ Make로 전송 완료! (이제 Make에서 받는지 확인)");
  } catch (e) {
    alert("❌ 전송 실패: MAKE_WEBHOOK_URL 확인해줘!");
  }
});

card.appendChild(btnMake);

function injectSendToMakeButton() {
  const topicInput = document.getElementById("topic");
  if (!topicInput) return;
  const card = topicInput.closest(".card");
  if (!card) return;



  const btn = document.createElement("button");
  btn.id = "btnSendToMake";
  btn.textContent = "📤 Make로 보내서 자동 영상 만들기";
  btn.style.marginTop = "10px";

  btn.addEventListener("click", async () => {
    const topic = document.getElementById("topic").value || "오늘의 이야기";
    const category = document.getElementById("category").value;
    const tone = document.getElementById("tone").value;

    // 네 사이트가 이미 만들어주는 결과를 Make로 보낼 payload
    // (풀 생성 로직을 쓰고 싶으면 runFullPipeline() 먼저 실행해도 됨)
    const payload = { topic, category, tone, created_at: new Date().toISOString() };

    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Webhook failed");
      alert("✅ Make로 전송 완료! (자동 영상 생성 시작)");
    } catch (e) {
      alert("❌ 전송 실패: Make 웹훅 URL 확인해줘!");
    }
  });

  card.appendChild(btn);
}

document.addEventListener("DOMContentLoaded", injectSendToMakeButton);
function injectSendToMakeButton() {
  const topicInput = document.getElementById("topic");
  if (!topicInput) return;

  const card = topicInput.closest(".card");
  if (!card) return;

  if (document.getElementById("btnSendToMake")) return;

  const btn = document.createElement("button");
  btn.id = "btnSendToMake";
  btn.textContent = "📤 Make로 보내서 자동 영상 만들기";
  btn.style.marginTop = "10px";

  btn.addEventListener("click", async () => {
    const topic = document.getElementById("topic").value || "오늘의 이야기";
    const category = document.getElementById("category").value;
    const tone = document.getElementById("tone").value;

    const payload = { topic, category, tone, created_at: new Date().toISOString() };

    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Webhook failed");
      alert("✅ Make로 전송 완료! Make에서 숫자 1 확인");
    } catch (e) {
      alert("❌ 전송 실패: MAKE_WEBHOOK_URL 확인해줘!");
    }
  });

  card.appendChild(btn);
}

document.addEventListener("DOMContentLoaded", injectSendToMakeButton);
setTimeout(injectSendToMakeButton, 1000);
