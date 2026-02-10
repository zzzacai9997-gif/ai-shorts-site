window.injectSendToMakeButton = function () {
  try {
    if (document.getElementById("sendToMakeBtn")) return;

    // ✅ 주제 입력칸 (placeholder 기준)
    const topicEl = document.querySelector('input[placeholder^="예:"]');
    if (!topicEl) {
      console.warn("❌ 주제 입력칸 못 찾음");
      return;
    }

    // ✅ 결과 대본 (textarea 하나뿐)
    const scriptEl = document.querySelector("textarea");

    // 버튼
    const btn = document.createElement("button");
    btn.id = "sendToMakeBtn";
    btn.textContent = "Make로 보내기";
    btn.style.marginTop = "12px";
    btn.style.padding = "12px";
    btn.style.borderRadius = "10px";
    btn.style.width = "100%";
    btn.style.background = "linear-gradient(90deg,#7b7cff,#a855f7)";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "16px";

    // 상태 텍스트
    const status = document.createElement("div");
    status.style.marginTop = "8px";
    status.style.fontSize = "14px";

    btn.onclick = async () => {
      const topic = topicEl.value.trim();
      const script = scriptEl?.value?.trim() || "";

      if (!topic) {
        status.textContent = "❌ 주제를 입력하세요.";
        return;
      }

      btn.disabled = true;
      btn.textContent = "전송중…";
      status.textContent = "⏳ Make로 전송중…";

      try {
        const res = await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            script,
            source: "ai-shorts-site"
          })
        });

        if (!res.ok) throw new Error();

        status.textContent = "✅ Make로 전송 완료!";
      } catch {
        status.textContent = "❌ 전송 실패 (Make 확인)";
      } finally {
        btn.disabled = false;
        btn.textContent = "Make로 보내기";
      }
    };

    // ✅ 주제 입력칸 바로 아래 삽입
    topicEl.parentElement.appendChild(btn);
    topicEl.parentElement.appendChild(status);

    console.log("✅ Make 버튼 정상 삽입 완료");
  } catch (e) {
    console.error(e);
  }
};
// ❌ 기존
// topicEl.parentElement.appendChild(btn);
// topicEl.parentElement.appendChild(status);

// ✅ 교체 (카드 안에 정확히 삽입)
const card = topicEl.closest("div");
card.appendChild(btn);
card.appendChild(status);
