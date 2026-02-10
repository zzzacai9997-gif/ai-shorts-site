const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/gnctl4nvovig2iil4gmt9r63fkx0896t";

function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else fn();
}

ready(() => {
  const topic = document.getElementById("topicInput");
  const category = document.getElementById("categorySelect");
  const tone = document.getElementById("toneSelect");
  const result = document.getElementById("resultArea");
  const btnOne = document.getElementById("btnOne");
  const btnBatch = document.getElementById("btnBatch");
  const makeArea = document.getElementById("makeArea");
  const uiStatus = document.getElementById("uiStatus");
  const genStatus = document.getElementById("genStatus");

  // ✅ Make 버튼 만들기 (항상 보이게)
  makeArea.innerHTML = "";
  const makeBtn = document.createElement("button");
  makeBtn.textContent = "Make로 보내기";
  makeArea.appendChild(makeBtn);

  // ✅ 대본 하나 만들기
  btnOne.onclick = () => {
    const t = (topic.value || "").trim();
    if (!t) { genStatus.textContent = "❌ 주제를 입력하세요."; return; }
    result.value =
      `오늘의 주제: ${t}\n` +
      `카테고리: ${category.value}\n` +
      `말투: ${tone.value}\n\n` +
      `(테스트 대본)\n- 훅 1문장\n- 핵심 3포인트\n- 마무리 1문장`;
    genStatus.textContent = "✅ 생성 완료";
  };

  // ✅ 30개 생성
  btnBatch.onclick = () => {
    const t = (topic.value || "").trim();
    if (!t) { genStatus.textContent = "❌ 주제를 입력하세요."; return; }
    let out = "";
    for (let i = 1; i <= 30; i++) {
      out += `===== #${String(i).padStart(2, "0")} =====\n`;
      out += `주제: ${t}\n카테고리: ${category.value}\n말투: ${tone.value}\n`;
      out += `대본: ${t} (${i}번째)\n\n`;
    }
    result.value = out;
    genStatus.textContent = "✅ 30개 생성 완료";
  };

  // ✅ Make로 보내기 (sendBeacon 우선)
makeBtn.onclick = () => {
  const t = (topic.value || "").trim();
  if (!t) { uiStatus.textContent = "❌ 주제를 입력하세요."; return; }

  const payload = {
    topic: t,
    category: category.value,
    tone: tone.value,
    script: result.value || "",
    sentAt: new Date().toISOString()
  };

  uiStatus.textContent = "⏳ Make로 전송중…";

  try {
    // ✅ 1) sendBeacon (가장 안정적)
    const ok = navigator.sendBeacon(MAKE_WEBHOOK_URL, JSON.stringify(payload));
    if (ok) {
      uiStatus.textContent = "✅ 전송 요청 보냄 (beacon)";
      return;
    }
  } catch (e) {
    // 무시하고 fetch로 fallback
  }

  // ✅ 2) fetch fallback: headers 제거 (프리플라이트 최소화)
 fetch(MAKE_WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});



    try {
      // ✅ CORS 안정 옵션
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // 만약 여기서 막히면 no-cors로 바꾸면 됨(아래 참고)
      if (!res.ok) throw new Error("HTTP " + res.status);

      uiStatus.textContent = "✅ Make 전송 완료!";
    } catch (e) {
      console.error(e);

      // 🔥 최후의 확실한 전송(no-cors) — Make는 보통 수신됨
      try {
        await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        uiStatus.textContent = "✅ 전송 요청 보냄 (no-cors)";
      } catch (e2) {
        console.error(e2);
        uiStatus.textContent = "❌ 전송 실패 (네트워크/URL 확인)";
      }
    }
  };
});
// ===============================
// Make로 보내기 버튼 (핵심)
// ===============================
ready(() => {
  const btnMake = document.getElementById("btnMake");

  if (!btnMake) {
    console.error("❌ btnMake 버튼 못 찾음");
    return;
  }

  btnMake.addEventListener("click", async () => {
    console.log("🚀 Make로 보내기 클릭됨");

    const payload = {
      topic: topic.value,
      category: category.value,
      tone: tone.value,
      result: result.value,
      createdAt: new Date().toISOString()
    };

    console.log("📦 전송 데이터:", payload);

    try {
      await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors", // Make 웹훅 필수
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      uiStatus.innerText = "✅ Make로 전송 완료";
      console.log("✅ Make 전송 성공");
    } catch (err) {
      console.error("❌ Make 전송 실패", err);
      uiStatus.innerText = "❌ Make 전송 실패";
    }
  });
});
