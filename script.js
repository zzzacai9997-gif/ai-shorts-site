/* ================================
   AI 쇼츠/롱폼 생성기 + Make 전송 (완성본)
   - UI: index.html의 id들을 정확히 사용
   - Make 버튼: 주제 입력칸 바로 아래 자동 생성
================================ */

// ✅ 여기만 네 Make 웹훅으로 바꾸기
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/np7g2x9566v8tqg4w383m2f3jdhik3or;

// DOM
const elTopic = document.getElementById("topicInput");
const elCategory = document.getElementById("categorySelect");
const elTone = document.getElementById("toneSelect");
const elResult = document.getElementById("resultArea");
const elUiStatus = document.getElementById("uiStatus");
const elGenStatus = document.getElementById("genStatus");
const btnOne = document.getElementById("btnOne");
const btnBatch = document.getElementById("btnBatch");

// ✅ 페이지 로드 확인 (캐시 여부 판별용)
console.log("✅ script.js 로드됨", new Date().toISOString());

/* --------------------------------
   1) 대본 생성(로컬 템플릿)
   - 지금은 무료/오프라인 버전
   - 나중에 API 붙이려면 여기만 갈아끼우면 됨
-------------------------------- */

const TEMPLATES = {
  "힐링/감성": [
    (t) => `괜찮은 척했지만, 사실은 많이 흔들렸어요.\n\n오늘 주제는 "${t}".\n\n1) 숨을 3번만 천천히 쉬어봐요.\n2) 시선을 발끝에 두면 생각이 덜 요동쳐요.\n3) ‘지금은 지나가는 중’이라고 속으로 한 번만 말해요.\n\n오늘도 버틴 당신, 충분히 잘했어요.\n댓글에 “나도”라고 남겨줘요.`,
    (t) => `누구나 가끔은 마음이 무너질 때가 있죠.\n\n"${t}"를 이야기해볼게요.\n\n- 내 감정을 ‘사실’이 아니라 ‘날씨’처럼 봐요.\n- 지금 힘든 건 내가 약해서가 아니라, 너무 열심히 살아서예요.\n\n당신의 오늘이 조금 가벼워졌으면 좋겠어요.\n저장해두고 필요할 때 다시 봐요.`
  ],
  "생활꿀팁": [
    (t) => `이거 모르고 살면 은근 손해예요.\n"${t}" 핵심만 3가지!\n1) 가장 먼저 해야 할 것\n2) 절대 하지 말아야 할 것\n3) 10초로 끝내는 방법\n\n유용했으면 저장! 댓글로 “다음팁” 남겨줘요.`,
  ],
  "공포": [
    (t) => `문이… 분명 닫혀 있었거든.\n그런데 방금, 손잡이가 “딸깍” 했어.\n\n"${t}" — 너도 이 경험, 있지?\n\n뒤돌아보지 마.\n진짜로…\n\n(속삭이듯) 댓글에 “봤다”라고 쓰면, 다음이 보여.`,
  ],
  "동기부여": [
    (t) => `"${t}"\n오늘은 작게, 하지만 확실하게.\n\n1) 5분만 시작해.\n2) 완벽 말고 ‘진행’이야.\n3) 오늘의 너는 어제의 너보다 한 칸 앞이야.\n\n저장하고 내일 다시 보기.\n할 수 있어.`,
  ],
  "시니어/지원금": [
    (t) => `"${t}"\n헷갈리기 쉬운 포인트만 딱 정리해요.\n\n1) 대상 조건: 누구에게 해당?\n2) 신청 방법: 온라인/오프라인 어디서?\n3) 주의사항: 사기 문자/링크 조심!\n\n원하는 지역/조건 댓글로 남기면 더 구체적으로 알려드릴게요.`,
  ]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateScript({ topic, category, tone }) {
  const cat = TEMPLATES[category] ? category : "힐링/감성";
  const base = pick(TEMPLATES[cat])(topic);

  // 말투 살짝만 가공
  if (tone === "담백") return base;
  if (tone === "따뜻") return base.replaceAll("댓글", "댓글").replaceAll("저장", "저장");
  if (tone === "유머") return base + "\n\n(농담 반 진담 반) 오늘도 살아남은 우리, 박수~ 👏";
  if (tone === "음습체") return base.replaceAll("괜찮", "괜찮").replaceAll("오늘", "오늘…");
  return base;
}

/* --------------------------------
   2) ✅ Make로 보내기 버튼 (주제 입력칸 바로 아래)
-------------------------------- */
function injectSendToMakeButton() {
  if (document.getElementById("sendToMakeBtn")) return;

  const btn = document.createElement("button");
  btn.id = "sendToMakeBtn";
  btn.className = "btn";
  btn.textContent = "Make로 보내기";

  const status = document.createElement("div");
  status.id = "sendToMakeStatus";
  status.className = "status";

  // 주제 입력칸 아래에 삽입
  elTopic.insertAdjacentElement("afterend", status);
  elTopic.insertAdjacentElement("afterend", btn);

  btn.addEventListener("click", async () => {
    const topic = (elTopic.value || "").trim();
    const category = elCategory.value;
    const tone = elTone.value;
    const script = (elResult.value || "").trim();

    if (!topic) {
      status.textContent = "❌ 주제를 먼저 입력해줘.";
      return;
    }
    if (!MAKE_WEBHOOK_URL || MAKE_WEBHOOK_URL.includes("여기에_네_웹훅")) {
      status.textContent = "❌ script.js 상단 MAKE_WEBHOOK_URL에 Make 웹훅을 넣어줘.";
      return;
    }

    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = "전송중…";
    status.textContent = "⏳ Make로 전송중…";

    try {
      const payload = { topic, category, tone, script, sentAt: new Date().toISOString() };
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);

      status.textContent = "✅ Make로 전송 완료!";
    } catch (e) {
      console.error(e);
      status.textContent = "❌ 전송 실패 (Make 시나리오/URL/네트워크 확인)";
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  });

  elUiStatus.textContent = "✅ Make 버튼 준비 완료";
}

/* --------------------------------
   3) 버튼 동작: 생성
-------------------------------- */
btnOne.addEventListener("click", () => {
  const topic = (elTopic.value || "").trim();
  if (!topic) {
    elGenStatus.textContent = "❌ 주제를 입력하세요.";
    return;
  }
  const script = generateScript({
    topic,
    category: elCategory.value,
    tone: elTone.value
  });
  elResult.value = script;
  elGenStatus.textContent = "✅ 생성 완료";
});

btnBatch.addEventListener("click", () => {
  const topic = (elTopic.value || "").trim();
  if (!topic) {
    elGenStatus.textContent = "❌ 주제를 입력하세요.";
    return;
  }

  const category = elCategory.value;
  const tone = elTone.value;

  const out = [];
  for (let i = 1; i <= 30; i++) {
    out.push(`===== #${String(i).padStart(2, "0")} =====\n` + generateScript({ topic, category, tone }));
  }
  elResult.value = out.join("\n\n");
  elGenStatus.textContent = "✅ 30개 생성 완료";
});

/* --------------------------------
   4) 시작 시 Make 버튼 주입
-------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  injectSendToMakeButton();
});

// Pages 캐시/지연 대비
setTimeout(() => injectSendToMakeButton(), 800);
