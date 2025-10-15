const BOARD_FILES = {
  "Main Board": "MainBoard.json",
  "Category Extensions": "CategoryExtensions.json",
  "Elusive Targets": "ElusiveTargets.json",
  "Escalations": "Escalations.json",
};

let currentRuns = [];
let currentBoard = "Main Board";

const runsCount = document.getElementById("runsCount");
const fgCount = document.getElementById("fgCount");
const ilCount = document.getElementById("ilCount");
const ilMsCount = document.getElementById("ilMsCount");
const ilNoMsCount = document.getElementById("ilNoMsCount");
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
  const ilMs = currentRuns.filter(
    (r) => r.run_type === "IL" && r.MS === "Completed"
  ).length;
  const ilNoMs = currentRuns.filter(
    (r) => r.run_type === "IL" && r.MS === "Unconverted"
  ).length;

  runsCount.textContent = totalRuns;
  fgCount.textContent = fg;
  ilCount.textContent = il;
  ilMsCount.textContent = ilMs;
  ilNoMsCount.textContent = ilNoMs;
}

function pickRandomUnconverted() {
  const pool = currentRuns.filter(
    (r) => r.run_type === "IL" && r.MS === "Unconverted"
  );
  const pick = pool[Math.floor(Math.random() * pool.length)];
  result.innerHTML = "";
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
