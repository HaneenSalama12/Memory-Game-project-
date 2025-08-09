const settings = JSON.parse(localStorage.getItem("memoryGameSettings"));
const board = document.getElementById("gameBoard");
const message = document.getElementById("gameMessage");
const timerDiv = document.getElementById("timer");
const playerTurnDiv = document.getElementById("playerTurn");

const emojis = ['🍕', '🍔', '🍟', '🌭', '🍿', '🥤', '🍩', '🍪', '🍫', '🍓', '🍉', '🍇', '🍍', '🍎', '🥝'];
let levelConfig = {
  easy: { count: 6, time: 30 },
  medium: { count: 10, time: 45 },
  hard: { count: 16, time: 60 },
  extreme: { count: 26, time: 90 }
};

let flipped = [], matched = [];
let timeLeft = levelConfig[settings.level].time;
let currentPlayer = 0;
let players = [settings.player1, settings.player2].filter(Boolean);
let timer;

function startGame() {
  const totalCards = levelConfig[settings.level].count;
  let cards = emojis.slice(0, totalCards / 2);
  cards = [...cards, ...cards].sort(() => 0.5 - Math.random());

  board.innerHTML = "";
  setGrid(totalCards);

  cards.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.emoji = emoji;
    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });

  if (players.length === 2) updateTurn();
  timer = setInterval(updateTimer, 1000);
}

function setGrid(count) {
  let cols = Math.ceil(Math.sqrt(count));
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

function flipCard() {
  if (this.classList.contains("flipped") || flipped.length === 2) return;

  this.textContent = this.dataset.emoji;
  this.classList.add("flipped");
  flipped.push(this);

  if (flipped.length === 2) {
    const [first, second] = flipped;
    if (first.dataset.emoji === second.dataset.emoji) {
      matched.push(first, second);
      flipped = [];
      if (matched.length === levelConfig[settings.level].count) endGame(true);
    } else {
      setTimeout(() => {
        first.textContent = "";
        second.textContent = "";
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        flipped = [];
        if (players.length === 2) switchPlayer();
      }, 800);
    }
  }
}

function updateTimer() {
  timeLeft--;
  timerDiv.textContent = `Time: ${timeLeft}s`;
  if (timeLeft === 0) endGame(false);
}

function updateTurn() {
  playerTurnDiv.textContent = `Turn: ${players[currentPlayer]}`;
}

function switchPlayer() {
  currentPlayer = 1 - currentPlayer;
  updateTurn();
}

function endGame(win) {
  clearInterval(timer);
  const outcome = win ? `${players[currentPlayer] || "Player"} wins!` : "Game Over";
  message.textContent = outcome;
  message.classList.remove("hidden");

  const savedResults = JSON.parse(localStorage.getItem("memoryGameResults")) || [];
  savedResults.push({
    players: players.join(" vs ") || "1 Player",
    level: settings.level,
    time: levelConfig[settings.level].time - timeLeft,
    outcome: win ? "Win" : "Lose"
  });
  localStorage.setItem("memoryGameResults", JSON.stringify(savedResults));

  const retryBtn = document.createElement("button");
  retryBtn.textContent = "Try Again";
  retryBtn.className = "btn";
  retryBtn.onclick = () => location.href = "index.html";
  message.appendChild(document.createElement("br"));
  message.appendChild(retryBtn);
}

startGame();
