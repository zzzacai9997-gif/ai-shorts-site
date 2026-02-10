// 🔴 네 Make 웹훅 주소만 여기 넣어
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/여기에_네_웹훅";

const topic = document.getElementById("topicInput");
const category = document.getElementById("categorySelect");
const tone = document.getElementById("toneSelect");
const result = document.getElementById("resultArea");
const btnOne = document.getElementById("btnOne");
const btnBatch = document.getElementById("btnBatch");
const makeArea = document.getElementById("makeArea");
const uiStatus = document.getElementById("uiStatus");
const genStatus = document.getElementById("genStatus");

console.log("✅ script.js 로드됨");

// Make 버튼 생성
const makeBtn = document.createElement("button");
makeBtn.textContent = "Make로 보내기";
makeArea.appendChild(makeBtn);

makeBtn.onclick = async () => {
  if (!topic.value.trim()) {
    uiStatus.textContent = "❌ 주제를 입력하세요.";
    return;
  }
  uiStatus.textContent = "⏳ Make로 전송중…";

  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topic.value,
        category: category.value,
        tone: tone.value,
        script: result.value
      })
    });
    if (!res.ok) throw new Error();
    uiStatus.textContent = "✅ Make 전송 완료!";
  } catch {
    uiStatus.textContent = "❌ Make 전송 실패";
  }
};

// 아주 단순한 대본 생성
btnOne.onclick = () => {
  if (!topic.value.trim()) {
    genStatus.textContent = "❌ 주제를 입력하세요.";
    return;
  }
  result.value = `오늘의 주제: ${topic.value}\n\n이건 테스트 대본입니다.`;
  genStatus.textContent = "✅ 생성 완료";
};

btnBatch.onclick = () => {
  if (!topic.value.trim()) {
    genStatus.textContent = "❌ 주제를 입력하세요.";
    return;
  }
  let out = "";
  for (let i = 1; i <= 30; i++) {
    out += `#${i}\n오늘의 주제: ${topic.value}\n\n`;
  }
  result.value = out;
  genStatus.textContent = "✅ 30개 생성 완료";
};
