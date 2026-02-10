/* ================================
   AI 쇼츠 사이트 - script.js (FULL)
   - 주제 입력칸 아래 "Make로 보내기" 버튼 자동 생성
   - Make 웹훅으로 POST(JSON) 전송
================================ */

// ✅ Make 웹훅 URL (여기만 네 주소로!)
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/np7g2x9566v8tqg4w383m2f3jdhik3or";

/* --------------------------------
   0) 페이지 로드 시 UI 주입
-------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  try {
    injectBatchUI();
  } catch (e) {
    console.warn("injectBatchUI가 아직 없거나 오류:", e);
  }

  // 버튼 주입 시도
  window.injectSendToMakeButton?.();
});

// ✅ GitHub Pages 캐시/지연 대비 (중요)
setTimeout(() => {
  try {
    injectBatchUI();
  } catch (e) {}

  window.injectSendToMakeButton?.();
}, 1000);

/* --------------------------------
   1) (선택) 배치 UI 주입: 없으면 그냥 넘어감
   - 너가 기존에 쓰던 함수가 있으면 유지
-------------------------------- */
function injectBatchUI() {
  // 이 함수는 네가 이미 만들어둔 UI가 있으면 여기에 두고,
  // 없으면 비워도 됨. (에러 안나게 최소 구현)
  // console.log("injectBatchUI 실행");
}

/* --------------------------------
   2) ✅ Make로 보내는 버튼 주입 (주제 입력칸 바로 아래)
-------------------------------- */
window.injectSendToMakeButton = function injectSendToMakeButton() {
  try {
    // 중복 생성 방지
    if (document.getElementById("sendToMakeBtn")) return;

    // 1) "주제 입력칸" 찾기 (우선순위: #topic → placeholder에 주제 → 첫 textarea → 첫 text input)
    const topicEl =
      document.querySelector("#topic") ||
      document.querySelector('input[placeholder*="주제"], textarea[placeholder*="주제"]') ||
      document.querySelector("textarea") ||
      document.querySelector('input[type="text"]');

    if (!topicEl) {
      console.warn("❌ 주제 입력칸을 못 찾았어요. (topicEl 없음)");
      return;
    }

    // 2) "대본 결과" 찾기 (없으면 빈 값 전송)
    const scriptEl =
      document.querySelector("#script") ||
      document.querySelector("#result") ||
      document.querySelector('textarea[placeholder*="대본"], textarea[placeholder*="자막"]') ||
      null;

    // 3) 버튼 생성
    const btn = document.createElement("button");
    btn.id = "sendToMakeBtn";
    btn.type = "button";
    btn.textContent = "Make로 보내기";

    // 스타일(간단)
    btn.style.marginTop = "10px";
    btn.style.padding = "10px 14px";
    btn.style.borderRadius = "10px";
    btn.style.border = "1px solid rgba(255,255,255,0.2)";
    btn.style.cursor = "pointer";

    // 상태 메시지
    const status = document.createElement("div");
    status.id = "sendToMakeStatus";
    status.style.marginTop = "8px";
    status.style.fontSize = "14px";
    status.style.opacity = "0.9";

    // 4) 클릭 이벤트: Make로 전송
    btn.addEventListener("click", async () => {
      const topic = (topicEl.value || "").trim();
      const script = (scriptEl?.value || scriptEl?.textContent || "").trim();

      if (!topic) {
        status.textContent = "❌ 주제를 먼저 입력해줘.";
        return;
      }

      const makeUrl =
        (typeof MAKE_WEBHOOK_URL !== "undefined" && MAKE_WEBHOOK_URL) ||
        null;

      if (!makeUrl || String(makeUrl).includes("여기에_네_웹훅_주소_넣기")) {
        status.textContent = "❌ Make 웹훅 URL을 script.js 상단에 넣어줘!";
        return;
      }

      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = "전송중…";
      status.textContent = "⏳ Make로 전송중…";

      try {
        const payload = {
          topic,
          script,
          sentAt: new Date().toISOString(),
          source: "ai-shorts-site"
        };

        const res = await fetch(makeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        status.textContent = "✅ Make로 전송 완료!";
      } catch (e) {
        console.error(e);
        status.textContent = "❌ 전송 실패 (URL/네트워크/Make 시나리오 확인)";
      } finally {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    });

    // 5) 주제 입력칸 바로 아래에 붙이기
    topicEl.insertAdjacentElement("afterend", status);
    topicEl.insertAdjacentElement("afterend", btn);

    console.log("✅ Make 버튼 주입 완료");
  } catch (err) {
    console.error("injectSendToMakeButton 오류:", err);
  }
};

/* --------------------------------
   3) (디버그) 로드 확인 로그
-------------------------------- */
console.log("✅ script.js 로드됨", {
  injectSendToMakeButton: typeof window.injectSendToMakeButton,
  MAKE_WEBHOOK_URL: typeof MAKE_WEBHOOK_URL !== "undefined" ? "SET" : "MISSING"
});
