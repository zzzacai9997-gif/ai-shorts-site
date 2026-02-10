<script>
function runFullPipeline() {
  const topic = document.getElementById("topic").value || "오늘의 이야기";
  const cat = document.getElementById("category").value;
  const tone = document.getElementById("tone").value;

  let output = "";

  // ===== 쇼츠 =====
  output += "===== 쇼츠 =====\n";
  output += "[오프닝]\n";
  output += topic + "… 이 얘기, 지금 꼭 해야 할 것 같았어요.\n\n";
  output += "[본문]\n";
  output += "많은 사람들이 이 순간에 흔들려요.\n";
  output += "괜찮은 척하지만, 사실은 다 느끼고 있어요.\n";
  output += "그래도 오늘은 여기까지 버텼다는 거.\n\n";
  output += "[마무리]\n";
  output += "이 영상, 필요할 때 다시 보세요.\n\n";

  // ===== 롱폼 =====
  output += "===== 롱폼 =====\n";
  output += "[도입]\n";
  output += topic + "에 대해 요즘 자주 생각하게 됩니다.\n";
  output += "이건 특별한 이야기가 아니라, 누구에게나 있는 순간이죠.\n\n";

  output += "[본론 1]\n";
  output += "왜 이런 감정이 반복될까요?\n";
  output += "우리는 늘 비슷한 상황에서 같은 방식으로 반응합니다.\n\n";

  output += "[본론 2]\n";
  output += "혹시 여러분도 이런 순간이 있었나요?\n";
  output += "그때 어떤 선택을 했는지 떠올려보세요.\n\n";

  output += "[본론 3]\n";
  output += "정답은 없지만, 한 가지는 분명해요.\n";
  output += "지금의 나를 무시하지 않는 것.\n\n";

  output += "[마무리]\n";
  output += "다음 영상에서는 이 이야기의 다른 면을 이어가볼게요.\n\n";

  // ===== 쇼츠 30개 =====
  output += "===== 쇼츠 30개 =====\n";
  for (let i = 1; i <= 30; i++) {
    output += "\n--- " + i + " ---\n";
    output += topic + "\n";
    output += "괜찮은 척했지만, 다 느끼고 있었어요.\n";
    output += "그래도 오늘을 버텼다는 것만으로 충분해요.\n";
  }

  document.getElementById("result").value = output;
}
</script>
