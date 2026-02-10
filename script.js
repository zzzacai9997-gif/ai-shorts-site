// ✅ 네 Make 웹훅 주소만 여기 넣기
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/np7g2x9566v8tqg4w383m2f3jdhik3or";

// ===============================
// 0) 안전하게 DOM 준비 후 실행
// ===============================
function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

ready(() => {
  console.log("✅ script.js 실행 시작");

  // ===============================
  // 1) 요소 찾기 (id가 없으면 바로 알려줌)
  // ===============================
  const topic = document.getElementById("topicInput");
  const category = document.getElementById("categorySelect");
  const tone = document.getElementById("toneSelect");
  const result = document.getElementById("resultArea");
  const btnOne = document.getElementById("btnOne");
  const btnBatch = document.getElementById("btnBatch");
  const makeArea = document.getElementById("makeArea");
  const uiStatus = document.getElementById("uiStatus");
  const genStatus = document.getElementById("genStatus");

  const missing = [];
  if (!topic) missing.push("topicInput");
  if (!category) missing.push("categorySelect");
  if (!tone) missing.push("toneSelect");
  if (!result) missing.push("resultArea");
  if (!btnOne) missing.push("btnOne");
  if (!btnBatch) missing.push("btnBatch");
  if (!makeArea) missing.push("makeArea");
  if (!uiStatus) missing.push("uiStatus");
  if (!genStatus) missing.push("genStatus");

  if (missing.length) {
    console.error("❌ HTML에서 아래 id를 못 찾음:", missing.join(", "));
    // 화면에 보이게 표시
    const box = document.createElement("div");
    box.style.padding = "12px";
    box.style.marginTop = "10px";
    box.style.borderRadius = "10px";
    box.style.background = "rgba(255,0,0,0.12)";
    box.style.border = "1px solid rgba(255,0,0,0.25)";
    box.textContent = "❌ 페이지 요소(id) 누락: " + missing.join(", ");
    document.body.prepend(box);
    return;
  }

  // ===============================
  // 2) Make 버튼 생성 (항상 보이게)
  // ===============================
  makeArea.innerHTML = ""; // 중복 방지
  const makeBtn = document.createElement("button");
  makeBtn.textContent = "Make로 보내기";
  makeArea.appendChild(makeBtn);

  makeBtn.addEventListener("click", async () => {
    const t = (topic.value || "").trim();
    if (!t) {
      uiStatus.textContent = "❌ 주제를 입력하세요.";
      return;
    }
    if (!MAKE_WEBHOOK_URL || MAKE_WEBHOOK_URL.includes("여기에_네_웹훅")) {
      uiStatus.textContent = "❌ MAKE_WEBHOOK_URL에 Make 웹훅 주소를 넣어줘.";
      return;
    }

    uiStatus.textContent = "⏳ Make로 전송중…";

    try {
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: t,
          category: category.value,
          tone: tone.value,
          script: result.value || "",
          sentAt: new Date().toISOString()
        })
      });

      if (!res.ok) throw new Error("HTTP " + res.status);
      uiStatus.textContent = "✅ Make 전송 완료!";
    } catch (e) {
      console.error(e);
      uiStatus.textContent = "❌ Make 전송 실패 (Make에서 '한 번 실행' 눌렀는지 확인)";
    }
  });

  // ===============================
  // 3) 생성 버튼 동작 (무조건 결과 칸 채움)
  // ===============================
  btnOne.addEventListener("click", () => {
    const t = (topic.value || "").trim();
    if (!t) {
      genStatus.textContent = "❌ 주제를 입력하세요.";
      return;
    }

    const text =
      `오늘의 주제: ${t}\n` +
      `카테고리: ${category.value}\n` +
      `말투: ${tone.value}\n\n` +
      `(테스트 대본)\n` +
      `- 1문장 훅\n- 핵심 3포인트\n- 마무리 1문장\n`;

    result.value = text;
    genStatus.textContent = "✅ 생성 완료";
    result.focus();
  });

  btnBatch.addEventListener("click", () => {
    const t = (topic.value || "").trim();
    if (!t) {
      genStatus.textContent = "❌ 주제를 입력하세요.";
      return;
    }

    let out = "";
    for (let i = 1; i <= 30; i++) {
      out += `===== #${String(i).padStart(2, "0")} =====\n`;
      out += `주제: ${t}\n카테고리: ${category.value}\n말투: ${tone.value}\n`;
      out += `대본(테스트): ${t}에 대한 ${i}번째 버전\n\n`;
    }
    result.value = out;
    genStatus.textContent = "✅ 30개 생성 완료";
    result.focus();
  });

  console.log("✅ 이벤트 바인딩 완료");
});
