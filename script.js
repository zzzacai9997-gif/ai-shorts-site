// ===============================
// ✅ 설정: 너의 Make(또는 n8n) Webhook URL 넣는 곳
// ===============================
// 예) "https://hook.eu1.make.com/xxxxx"
// 주의: URL은 반드시 https:// 로 시작해야 함
const WEBHOOK_URL = "https://hook.eu1.make.com/np7g2x9566v8tqg4w383m2f3jdhik3or";

// ===============================
// 공통 유틸: 안전하게 응답 텍스트/JSON 처리
// ===============================
async function parseResponseAsTextOrJson(res) {
  const text = await res.text(); // 무조건 text로 먼저 받기
  console.log("RAW RESPONSE:", text);

  // 비어있는 응답 방지
  if (!text || !text.trim()) {
    return { ok: res.ok, status: res.status, raw: "", data: null };
  }

  // JSON이면 파싱
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  return { ok: res.ok, status: res.status, raw: text, data };
}

function pickBestOutput(parsed) {
  const { data, raw } = parsed;

  // 서버가 JSON으로 주는 경우 흔한 키들 우선순위
  const out =
    data?.result ??
    data?.text ??
    data?.output ??
    data?.message ??
    data?.data ??
    raw;

  // 객체면 보기 좋게
  if (typeof out === "object") {
    try {
      return JSON.stringify(out, null, 2);
    } catch {
      return String(out);
    }
  }
  return String(out ?? "");
}

function getInputs() {
  const topic = document.getElementById("topic")?.value?.trim() || "";
  const category = document.getElementById("category")?.value || "";
  const tone = document.getElementById("tone")?.value || "";

  return { topic, category, tone };
}

function setResult(msg) {
  const resultBox = document.getElementById("result");
  if (resultBox) resultBox.value = msg;
}

function appendResult(msg) {
  const resultBox = document.getElementById("result");
  if (!resultBox) return;
  if (!resultBox.value) resultBox.value = msg;
  else resultBox.value += "\n\n" + msg;
}

function setBusy(isBusy) {
  const oneBtn = document.getElementById("generateOneBtn");
  const batchBtn = document.getElementById("generateBatchBtn");

  if (oneBtn) oneBtn.disabled = isBusy;
  if (batchBtn) batchBtn.disabled = isBusy;
}

// ===============================
// ✅ 1개 생성
// ===============================
async function generateOne() {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("여기에_너의_WEBHOOK_URL")) {
    setResult("❌ WEBHOOK_URL을 먼저 넣어줘! (script.js 상단)");
    return;
  }

  const { topic, category, tone } = getInputs();

  if (!topic) {
    setResult("❌ 주제를 입력해줘.");
    return;
  }

  setBusy(true);
  setResult("⏳ 생성 중...");

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Make/n8n 쪽에서 받기 쉬운 형태
      body: JSON.stringify({ topic, category, tone, count: 1 }),
    });

    const parsed = await parseResponseAsTextOrJson(res);

    // HTTP 에러면 상태/원문 같이 보여주기
    if (!parsed.ok) {
      setResult(
        `❌ 요청 실패 (HTTP ${parsed.status})\n\n${pickBestOutput(parsed)}`
      );
      return;
    }

    const out = pickBestOutput(parsed).trim();
    setResult(out || "❌ 응답은 왔지만 내용이 비어 있음");
  } catch (e) {
    console.error(e);
    setResult("❌ 요청 실패: " + (e?.message || e));
  } finally {
    setBusy(false);
  }
}

// ===============================
// ✅ 30개 생성 (한 번에 받거나, 여러 번 호출 둘 다 지원)
// - 서버가 한 번에 30개를 주면 그대로 출력
// - 서버가 1개만 주는 구조면, 30번 반복 호출하는 모드로도 가능(옵션)
// ===============================

// 🔁 옵션: 서버가 "한 번에 30개" 지원하면 false 그대로 두기
// 서버가 1개만 주면 true로 바꿔서 30번 반복 호출
const BATCH_AS_MULTI_CALLS = false;

// 30개 구분선
const SEP = "\n\n===== 구분선 =====\n\n";

async function generateBatch30() {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("여기에_너의_WEBHOOK_URL")) {
    setResult("❌ WEBHOOK_URL을 먼저 넣어줘! (script.js 상단)");
    return;
  }

  const { topic, category, tone } = getInputs();

  if (!topic) {
    setResult("❌ 주제를 입력해줘.");
    return;
  }

  setBusy(true);
  setResult("⏳ 30개 생성 중...");

  try {
    if (!BATCH_AS_MULTI_CALLS) {
      // ✅ 1번 호출로 30개 받는 방식
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category, tone, count: 30 }),
      });

      const parsed = await parseResponseAsTextOrJson(res);

      if (!parsed.ok) {
        setResult(
          `❌ 요청 실패 (HTTP ${parsed.status})\n\n${pickBestOutput(parsed)}`
        );
        return;
      }

      const out = pickBestOutput(parsed).trim();
      setResult(out || "❌ 응답은 왔지만 내용이 비어 있음");
    } else {
      // ✅ 30번 반복 호출 방식
      setResult(""); // 결과창 비우고 누적
      for (let i = 0; i < 30; i++) {
        appendResult(`⏳ (${i + 1}/30) 생성 중...`);
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, category, tone, count: 1 }),
        });

        const parsed = await parseResponseAsTextOrJson(res);
        if (!parsed.ok) {
          appendResult(
            `❌ (${i + 1}/30) 실패 (HTTP ${parsed.status})\n${pickBestOutput(parsed)}`
          );
          continue;
        }

        const out = pickBestOutput(parsed).trim();
        appendResult(out || "❌ 비어있는 응답");
        if (i !== 29) appendResult("===== 구분선 =====");
      }
    }
  } catch (e) {
    console.error(e);
    setResult("❌ 요청 실패: " + (e?.message || e));
  } finally {
    setBusy(false);
  }
}

// ===============================
// ✅ 버튼 연결 (HTML id가 있어야 함)
// - generateOneBtn
// - generateBatchBtn
// ===============================
document.getElementById("generateOneBtn")?.addEventListener("click", generateOne);
document
  .getElementById("generateBatchBtn")
  ?.addEventListener("click", generateBatch30);
