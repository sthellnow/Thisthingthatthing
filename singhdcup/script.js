let videos = [];
let allCompetitors = [];
let currentRound = [];
let nextRound = [];
let index = 0;
let round = 16;
let eliminated = [];
let roundMap = new Map();

// Fisher–Yates Shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// JSON 불러오기
async function loadVideos() {
  try {
    const response = await fetch("videos.json");
    videos = await response.json();
    startGame(); // 바로 16강 시작
  } catch (err) {
    console.error("영상 데이터를 불러오는 중 오류 발생:", err);
  }
}

function startGame() {
  if (videos.length < 16) {
    alert("영상 개수가 부족합니다! 최소 16개 필요");
    return;
  }

  document.getElementById("game-container").style.display = "flex";
  document.getElementById("results").innerHTML = "";

  allCompetitors = shuffle([...videos]).slice(0, 16);

  currentRound = [...allCompetitors];
  nextRound = [];
  eliminated = [];
  index = 0;
  round = 16;
  roundMap.clear();

  showMatch();
}

function showMatch() {
  const roundInfo = document.getElementById("round-info");

  if (currentRound.length <= 1) {
    showResults();
    return;
  }

  if (index >= currentRound.length) {
    currentRound = [...nextRound];
    nextRound = [];
    index = 0;
    round = currentRound.length;
    showMatch();
    return;
  }

  roundInfo.textContent = `${round}강 - ${index / 2 + 1}번째 경기`;

  const video1 = currentRound[index];
  const video2 = currentRound[index + 1];

  document.getElementById("video1").innerHTML = `
    <iframe src="https://www.youtube.com/embed/${video1.id}"
      frameborder="0" allowfullscreen></iframe>
    <p>${video1.name}</p>
  `;

  document.getElementById("video2").innerHTML = `
    <iframe src="https://www.youtube.com/embed/${video2.id}"
      frameborder="0" allowfullscreen></iframe>
    <p>${video2.name}</p>
  `;

  document.getElementById("btn1").onclick = () => pickWinner(video1, video2);
  document.getElementById("btn2").onclick = () => pickWinner(video2, video1);
}

function pickWinner(winner, loser) {
  nextRound.push(winner);
  roundMap.set(loser.id, round);
  eliminated.push(loser);
  index += 2;
  showMatch();
}

function showResults() {
  const winner = currentRound[0];
  const runnerUp = eliminated[eliminated.length - 1];

  document.getElementById("game-container").style.display = "none";
  document.getElementById("round-info").textContent = "🏆 최종 결과";

  let html = `
    <h2>최종 순위</h2>
    <div style="display:flex; justify-content:center; gap:50px; margin-bottom:40px; flex-wrap:wrap;">
      <div style="flex:1; min-width:320px; text-align:center;">
        <h3>🥇 우승</h3>
        <img src="https://img.youtube.com/vi/${winner.id}/hqdefault.jpg" 
             style="width:320px; height:180px; border-radius:10px; border:4px solid gold; object-fit:cover;">
        <p style="font-size:24px; font-weight:bold; color:gold;">${winner.name}</p>
      </div>
      <div style="flex:1; min-width:320px; text-align:center;">
        <h3>🥈 준우승</h3>
        <img src="https://img.youtube.com/vi/${runnerUp.id}/hqdefault.jpg" 
             style="width:320px; height:180px; border-radius:10px; border:4px solid silver; object-fit:cover;">
        <p style="font-size:24px; font-weight:bold; color:silver;">${runnerUp.name}</p>
      </div>
    </div>
    <h3 style="margin-top:40px;">📌 라운드별 탈락자</h3>
  `;

  const grouped = {};
  eliminated.slice(0, -1).forEach(v => {
    const r = roundMap.get(v.id);
    if (!grouped[r]) grouped[r] = [];
    grouped[r].push(v);
  });

  Object.keys(grouped).sort((a, b) => b - a).forEach(r => {
    html += `<h4>${r}강 탈락</h4>`;
    html += `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:20px; width:90%; margin:20px auto;">`;
    grouped[r].forEach(v => {
      html += `
        <div style="background:#2e2e3a; padding:12px; border-radius:10px; text-align:center;">
          <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg"
               style="width:100%; aspect-ratio:16/9; border-radius:8px; object-fit:cover;">
          <p style="margin:8px 0; font-weight:bold;">${v.name}</p>
        </div>
      `;
    });
    html += `</div>`;
  });

  document.getElementById("results").innerHTML = html;
}

loadVideos();