let countries = [];
let answered = new Set();
let timer = null;
let seconds = 0;

const startBtn = document.getElementById("startBtn");
const input   = document.getElementById("answerInput");
const remainingSpan = document.getElementById("remaining");
const clock   = document.getElementById("clock");
const msg     = document.getElementById("message");
const grid    = document.getElementById("answersGrid");

fetch("countries.json")
  .then(res => res.json())
  .then(data => {
    countries = data;
    renderGrid();
    remainingSpan.textContent = countries.length;
  })
  .catch(err => {
    console.error("Failed to load countries.json", err);
    msg.textContent = "Error loading country list.";
  });

function renderGrid() {
  grid.innerHTML = "";
  countries.forEach((name, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = index;

    const span = document.createElement("span");
    span.textContent = name;
    span.className = "answerText";

    cell.appendChild(span);
    grid.appendChild(cell);
  });
}

function startTimer() {
  stopTimer();
  seconds = 0;
  timer = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    clock.textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

startBtn.addEventListener("click", () => {
  if (startBtn.textContent === "Start") {

    answered.clear();
    document.querySelectorAll(".answerText").forEach(el => {
      el.classList.remove("correct");
    });
    remainingSpan.textContent = countries.length;
    msg.textContent = "";

    startBtn.textContent = "Give up";
    input.disabled = false;
    input.value = "";
    input.focus();
    startTimer();

  } else {
    stopTimer();
    input.disabled = true;
    startBtn.textContent = "Start";
    msg.textContent = `You got ${answered.size} / ${countries.length}.`;
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

function normalize(str) {
  return str.trim().toLowerCase();
}

function checkAnswer() {
  const raw = input.value;
  if (!raw.trim()) return;

  const typed = normalize(raw);

  let matchedIndex = -1;
  countries.forEach((name, idx) => {
    if (matchedIndex !== -1) return;
    if (normalize(name) === typed) {
      matchedIndex = idx;
    }
  });

  if (matchedIndex === -1) {
    msg.textContent = "No match. Try again.";
    input.value = "";
    return;
  }

  const countryName = countries[matchedIndex];
  if (answered.has(countryName)) {
    msg.textContent = "Already answered.";
    input.value = "";
    return;
  }

  answered.add(countryName);
  msg.textContent = `Correct: ${countryName}`;
  input.value = "";

  const cell = grid.querySelector(`.cell[data-index="${matchedIndex}"] .answerText`);
  if (cell) {
    cell.classList.add("correct");
  }

  remainingSpan.textContent = countries.length - answered.size;

  if (answered.size === countries.length) {
    stopTimer();
    input.disabled = true;
    startBtn.textContent = "Start";
    msg.textContent = `Complete! Time: ${clock.textContent}`;
  }
}
