/* ================================
   AI 쇼츠/롱폼 생성기 + Make 전송 (완성본)
   - UI: index.html의 id들을 정확히 사용
   - Make 버튼: 주제 입력칸 바로 아래 자동 생성
================================ */

// ✅ 여기만 네 Make 웹훅으로 바꾸기
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/여기에_네_웹훅_주소";

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
    (t) => `"${t}"\n오늘은 작게, 하지만 확실하게.\n\n1) 5분만 시작해.\n2) 완벽 말고 ‘진행’이야.\n3
