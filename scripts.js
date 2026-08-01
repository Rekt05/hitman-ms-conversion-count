const BOARD_FILES = {
  "Main Board": "MainBoard.json",
  "Category Extensions": "CategoryExtensions.json",
  "Elusive Targets": "ElusiveTargets.json",
  "Escalations": "Escalations.json",
};

let currentRuns = [];
let currentBoard = "Main Board";

//main board runs with 0ms that scrape as unconverted — exclude from picker too
const ZERO_MS_RUNS = new Set([
  "https://www.speedrun.com/hitman_woa/runs/m3n3v3wy",
  "https://www.speedrun.com/hitman_woa/runs/zx6e50gz",
  "https://www.speedrun.com/hitman_woa/runs/m3ne2v6y",
  "https://www.speedrun.com/hitman_woa/runs/zxl98xqz",
  "https://www.speedrun.com/hitman_woa/runs/zp266jny",
  "https://www.speedrun.com/hitman_woa/runs/zq7wk21m",
  "https://www.speedrun.com/hitman_woa/runs/ywnod10y",
  "https://www.speedrun.com/hitman_woa/runs/zxxonq8z",
  "https://www.speedrun.com/hitman_woa/runs/zpk4wwvy",
  "https://www.speedrun.com/hitman_woa/runs/m3wx58gy",
  "https://www.speedrun.com/hitman_woa/runs/z56le65y",
  "https://www.speedrun.com/hitman_woa/runs/yl2n15rz",
]);
const MAIN_BOARD_MS_OFFSET = ZERO_MS_RUNS.size;

const runsCount = document.getElementById("runsCount");
const fgCount = document.getElementById("fgCount");
const ilCount = document.getElementById("ilCount");
const ilMsCount = document.getElementById("ilMsCount");
const ilNoMsCount = document.getElementById("ilNoMsCount");
const msOffsetNote = document.getElementById("msOffsetNote");
const result = document.getElementById("result");

async function loadBoard(boardName) {
  currentBoard = boardName;
  const file = BOARD_FILES[boardName];
  const res = await fetch(file);
  currentRuns = await res.json();
  updateStats();
  result.innerHTML = '<p class="hint">click the button ^</p>';
}

function updateStats() {
  const totalRuns = currentRuns.length;
  const fg = currentRuns.filter((r) => r.run_type === "FG").length;
  const il = currentRuns.filter((r) => r.run_type === "IL").length;
  let ilMs = currentRuns.filter(
    (r) => r.run_type === "IL" && r.MS === "Completed"
  ).length;
  let ilNoMs = currentRuns.filter(
    (r) => r.run_type === "IL" && r.MS === "Unconverted"
  ).length;

  const isMain = currentBoard === "Main Board";
  if (isMain) {
    ilMs += MAIN_BOARD_MS_OFFSET;
    ilNoMs -= MAIN_BOARD_MS_OFFSET;
  }
  msOffsetNote.hidden = !isMain;

  runsCount.textContent = totalRuns;
  fgCount.textContent = fg;
  ilCount.textContent = il;
  ilMsCount.textContent = ilMs;
  ilNoMsCount.textContent = ilNoMs;
}

function pickRandomUnconverted() {
  const pool = currentRuns.filter(
    (r) =>
      r.run_type === "IL" &&
      r.MS === "Unconverted" &&
      !ZERO_MS_RUNS.has(r.weblink)
  );
  result.innerHTML = "";
  if (!pool.length) {
    result.innerHTML = '<p class="hint">no unconverted runs left on this board</p>';
    return;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const a = document.createElement("a");
  a.href = pick.weblink;
  a.textContent = pick.weblink;
  a.target = "_blank";
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<p>Time: ${pick.time} <br/> Date: ${pick.submitted}</p>`;
  result.appendChild(a);
  result.appendChild(meta);
}

function setActiveButton(btn) {
  document
    .querySelectorAll(".board-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      setActiveButton(e.currentTarget);
      await loadBoard(e.currentTarget.textContent.trim());
    });
  });

  document
    .getElementById("pickRandom")
    .addEventListener("click", pickRandomUnconverted);

  loadBoard(currentBoard);
});
