// 1) 여기만 네 n8n Webhook URL로 바꿔!
// 예시: https://YOUR-N8N-DOMAIN/webhook/ai-shorts
const WEBHOOK_URL = "PASTE_YOUR_N8N_WEBHOOK_URL_HERE";

const $ = (id) => document.getElementById(id);

function setStatus(text) {
  $("status").textContent = text;
}

function pretty(obj) {
  try { return JSON.stringify(obj, null, 2); }
  catch { return String(obj); }
}

async function callN8N(payload) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR")) {
    throw new Error("WEBHOOK_URL을 먼저 script.js에 붙여넣어야 합니다.");
  }

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // n8n이 200이 아닌 코드로 응답하면 여기서 잡힘
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(`n8n 응답 오류: ${msg}`);
  }

  return data;
}

$("btnGenerate").addEventListener("click", async () => {
  const topic = $("topic").value.trim();
  const tone = $("tone").value;
  const lang = $("lang").value;

  if (!topic) {
    setStatus("주제를 입력해줘!");
    $("topic").focus();
    return;
  }

  const payload = {
    topic,
    tone,
    lang,
    source: "github-pages",
    ts: new Date().toISOString(),
  };

  setStatus("n8n 호출 중…");
  $("result").textContent = "{}";
  $("script").value = "";

  try {
    const data = await callN8N(payload);
    $("result").textContent = pretty(data);

    // n8n에서 script 필드로 내려주면 자동으로 textarea에 채워줌
    if (typeof data?.script === "string") {
      $("script").value = data.script;
    } else if (typeof data?.data?.script === "string") {
      $("script").value = data.data.script;
    }

    setStatus("완료 ✅");
  } catch (e) {
    setStatus("실패 ❌ (콘솔 확인)");
    console.error(e);
    $("result").textContent = pretty({ error: String(e.message || e) });
  }
});

$("btnClear").addEventListener("click", () => {
  $("topic").value = "";
  $("script").value = "";
  $("result").textContent = "{}";
  setStatus("대기 중");
});

$("btnCopy").addEventListener("click", async () => {
  const text = $("script").value.trim();
  if (!text) return setStatus("복사할 대본이 없어요");
  try {
    await navigator.clipboard.writeText(text);
    setStatus("대본 복사됨 ✅");
  } catch {
    setStatus("복사 실패 ❌");
  }
});

$("openN8N").addEventListener("click", (e) => {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_YOUR")) {
    e.preventDefault();
    setStatus("WEBHOOK_URL 먼저 넣어줘!");
  } else {
    $("openN8N").href = WEBHOOK_URL;
  }
});
