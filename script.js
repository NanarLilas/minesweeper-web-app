// ============================
// Game Setup
// ============================

// Initialize game variables
let board = [];
let mineCount = 0;
let revealCellCount = 0;
let timer = null;
let timeElapsed = 0;
let boardSize = 0;
let finalScore = 0;
let level = '';
let playerName = '';
let isTimerRunning = false;
let minesPlaced = false;
let flagsPlaced = 0;
let gameOver = false;

// ============================
// Event Listeners
// ============================

// Function to initialize event listeners once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Display all top scores immediately when the page loads
  displayAllTopScores();

  // Event listener for submitting player name
  document.getElementById("submitName").addEventListener("click", function() {
    let inputName = document.getElementById("playername").value.trim();

    if (inputName === '') {
      alert("Please enter your name to continue");
    } else {
      document.getElementById("nameDisplay").textContent = ` ${inputName}, Welcome to the game!`;
      document.getElementById("playername").style.display = "none";
      document.getElementById("submitName").style.display = "none";
      playerName = inputName;

      // After submitting the name, display top scores for all levels
      displayAllTopScores();
    }
  });

  // Event listener for Main Menu button (attached once)
  document.getElementById('Main_Menu').addEventListener("click", function() {
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("score").classList.add("hidden");
    document.getElementById("mineCounter").classList.add("hidden");
    document.getElementById("replay_button").classList.add("hidden");
    document.getElementById("Main_Menu").classList.add("hidden");
    document.getElementById("board").classList.add("hidden"); // Hide the board
    document.querySelector('.buttons').classList.remove('hidden');
  });

  // Add listeners for visibility and focus changes to pause and resume timer
  document.addEventListener('visibilitychange', handleVisibilityAndFocus);
  window.addEventListener("blur", handleVisibilityAndFocus);
  window.addEventListener("focus", handleVisibilityAndFocus);
});

// ============================
// Timer Functions
// ============================

// Function to handle visibility and focus changes
function handleVisibilityAndFocus() {
  if (document.hidden || !document.hasFocus()) {
    pauseTimer();
  } else {
    resumeTimer();
  }
}

// Function to start the timer
function startTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    timer = setInterval(() => {
      timeElapsed++;
      document.getElementById("timer").textContent = `Time: ${timeElapsed}s`;
    }, 1000);
  }
}

// Function to stop the timer
function stopTimer() {
  if (timer) { 
    clearInterval(timer);
    timer = null;
  }
  isTimerRunning = false;
}

// Function to pause the timer
function pauseTimer() {
  if (!gameOver && isTimerRunning) {
    stopTimer(); // Stop the timer
  }
}

// Function to resume the timer
function resumeTimer() {
  if (!gameOver && !isTimerRunning) {
    startTimer(); // Resume the timer
  }
}

// ============================
// Game Mechanics
// ============================

// Function to start the game based on selected level
function startGame(selectedLevel) {
  if (!playerName) {
    alert("Please enter your name before starting the game.");
    return;
  }

  level = selectedLevel;
  document.querySelector('.buttons').classList.add('hidden');

  // Set board size and mine count based on level
  switch (level) {
    case 'beginner':
      boardSize = 10;
      mineCount = 10;
      break;
    case 'intermediate':
      boardSize = 16;
      mineCount = 40;
      break;
    case 'advanced':
      boardSize = 20;
      mineCount = 99;
      break;
    default:
      console.error("Invalid game level selected.");
      return;
  }

  resetGame();
  createBoard(boardSize);
  startTimer();
}

// Function to reset the game state
function resetGame() {
  stopTimer();
  timeElapsed = 0;
  revealCellCount = 0;
  flagsPlaced = 0;
  document.getElementById("score").textContent = "";
  document.getElementById("timer").textContent = "Time = 0s";
  document.getElementById("mineCounter").textContent = `Mines: ${mineCount}`;
  document.getElementById("board").innerHTML = "";
  minesPlaced = false;
  gameOver = false;
  
}

// Function to create the game board
function createBoard(size) {
  // Get the 'board' div
  const boardElement = document.getElementById('board');

  // Clear existing content
  boardElement.innerHTML = '';

  // Show the board by removing the 'hidden' class
  boardElement.classList.remove('hidden');

  // Add the 'board-grid' class to apply grid styles
  boardElement.classList.add('board-grid');

  // Set the CSS custom property '--grid-size' to the desired size
  boardElement.style.setProperty('--grid-size', size);

  // Initialize the board array
  board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );

  // Create grid cells
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;

    // Add event listeners for cell actions
    cell.addEventListener('click', () => revealCell(cell, size));
    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      toggleFlag(cell);
    });

    // Append cell to the board
    boardElement.appendChild(cell);
  }
  // Update mine counter and display elements
  document.getElementById("mineCounter").textContent = `Mines: ${mineCount}`;
  document.getElementById("timer").classList.remove("hidden");
  document.getElementById("score").classList.remove("hidden");
  document.getElementById("mineCounter").classList.remove("hidden");

  // Show the Main Menu and replay.
  document.getElementById('Main_Menu').classList.remove("hidden");
  const replayButton = document.getElementById('replay_button');
  replayButton.classList.remove("hidden");

  replayButton.onclick = () => {
    gameOver = false;
    resetGame();
    createBoard(boardSize);
    startTimer();
  };

}

// Function to place mines on the board
function placeMines(mineCount, size, firstRow, firstCol) {
  let placedMines = 0;

  // Reset mines
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      board[i][j].mine = false;
    }
  }

  // Randomly place mines
  while (placedMines < mineCount) {
    const index = Math.floor(Math.random() * size * size);
    const row = Math.floor(index / size);
    const column = index % size;

    // Ensure the first clicked cell is not a mine
    if (row === firstRow && column === firstCol) continue;

    if (!board[row][column].mine) {
      board[row][column].mine = true;
      placedMines++;
    }
  }
}

// Function to calculate numbers for each cell
function calculateNumbers(size) {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!board[i][j].mine) {
        board[i][j].count = countAdjacentMines(i, j, size);
      }
    }
  }
}

// Function to count adjacent mines
function countAdjacentMines(row, column, size) {
  let count = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const r = row + i;
      const c = column + j;

      if (r >= 0 && r < size && c >= 0 && c < size && board[r][c].mine) {
        count++;
      }
    }
  }

  return count;
}

// Function to reveal a cell
function revealCell(cell, size) {
  if (gameOver) return; // Prevent interaction if game is over

  const index = parseInt(cell.dataset.index);
  const row = Math.floor(index / size);
  const column = index % size;
  const cellData = board[row][column];

  if (!minesPlaced) {
    placeMines(mineCount, size, row, column);
    calculateNumbers(size);
    minesPlaced = true;
  }

  if (cellData.revealed || cellData.flagged) return;

  cellData.revealed = true;
  cell.classList.add('revealed');
  revealCellCount++;

  if (cellData.mine) {
    cell.classList.add('mine');
    endGame(false);
  } else {
    if (cellData.count > 0) {
      cell.textContent = cellData.count || '';
      cell.classList.add(`count-${cellData.count}`);
    }

    if (cellData.count === 0) {
      revealAdjacentCells(row, column, size);
    }

    if (revealCellCount === size * size - mineCount) {
      endGame(true);
    }
  }
}

// Function to reveal adjacent cells recursively
function revealAdjacentCells(row, column, size) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const r = row + i;
      const c = column + j;
      if (r >= 0 && r < size && c >= 0 && c < size) {
        const adjCell = document.querySelector(`[data-index="${r * size + c}"]`);
        const adjCellData = board[r][c];
        if (!adjCellData.revealed && !adjCellData.flagged) {
          revealCell(adjCell, size);
        }
      }
    }
  }
}

// Function to flag/unflag a cell
function toggleFlag(cell) {
  if (gameOver) return; // Prevent interaction if game is over

  const index = parseInt(cell.dataset.index);
  const row = Math.floor(index / boardSize);
  const column = index % boardSize;
  const cellData = board[row][column];

  // Prevent flagging a revealed cell
  if (cellData.revealed) return;

  // Toggle flag only if placing or removing within the limit
  if (!cellData.flagged && flagsPlaced < mineCount) {
    cellData.flagged = true;
    cell.classList.add('flagged');
    flagsPlaced++;
  } else if (cellData.flagged) {
    cellData.flagged = false;
    cell.classList.remove('flagged');
    flagsPlaced--;
  }

  // Update mine counter display
  document.getElementById("mineCounter").textContent = `Mines: ${mineCount - flagsPlaced}`;
}

// Function to end the game
function endGame(won) {
  // Stop the timer
  stopTimer();
  gameOver = true; // Prevent further interaction

  // Reveal all cells
  document.querySelectorAll('.cell').forEach((cell, i) => {
    const row = Math.floor(i / boardSize);
    const column = i % boardSize;
    const cellData = board[row][column];

    if (cellData.mine) {
      cell.classList.add('mine');
      cell.classList.remove('flagged');
    } else {
      cell.classList.add('revealed');
      cell.textContent = cellData.count > 0 ? cellData.count : '';
    }

    if (cellData.flagged && !cellData.mine) {
      cell.classList.remove('flagged');
      cell.textContent = '❌';
    }
  });

  // Calculate the score
  const score = won ? calculateScore() : 0;

  // Update the score display with both score and time
  document.getElementById("score").textContent = `Score: ${Math.round(score)} points`;

  // If the player won, save the score and display the top scores
  if (won) {
    saveScore(level, playerName, Math.round(score), timeElapsed); 
    displayAllTopScores();
  }

  setTimeout(() => {
    const message = won ? "You won! :)" : "Game Over :(";
    if (confirm(`${message} Score: ${score} points. Time: ${timeElapsed} seconds.\n\nClick OK to Replay or Cancel to end the game.`)) {
      // Replay the game
      gameOver = false;
      resetGame();
      createBoard(boardSize);
      startTimer();
    }
  }, 2000); 
}

// Function to reveal all mines 
function revealAllMines() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    const row = Math.floor(i / boardSize);
    const column = i % boardSize;
    const cellData = board[row][column];
    if (cellData.mine && !cellData.revealed) {
      cell.classList.add('mine');
    }
  });
}

// ============================
// Score Management
// ============================

// Function to calculate the score
function calculateScore() {
  let baseScore = 0;
  const timePenalty = timeElapsed * 0.5;

  switch (level) {
    case 'beginner':
      baseScore = 200;
      break;
    case 'intermediate':
      baseScore = 400;
      break;
    case 'advanced':
      baseScore = 600;
      break;
    default:
      console.error("Invalid game level for scoring.");
      break;
  }

  finalScore = baseScore - timePenalty;
  document.getElementById("score").textContent = `Score: ${Math.max(0, Math.round(finalScore))} points | Time: ${timeElapsed} seconds`;
  return finalScore;
}

// Function to display top scores for a specific level
function displayTopScores(selectedLevel) {
  const scores = JSON.parse(localStorage.getItem("topScores")) || {};
  const levelScores = scores[selectedLevel] || [];

  const scoreBoard = document.getElementById(`scoreBoard-${selectedLevel}`);

  // Clear existing content to prevent duplicates
  scoreBoard.innerHTML = '';

  if (levelScores.length === 0) {
    scoreBoard.innerHTML = `<li>No scores yet.</li>`;
    return;
  }

  levelScores.forEach((entry, index) => {
    const scoreElement = document.createElement("li");
    scoreElement.textContent = `${index + 1}. ${entry.name}: ${entry.score} points | Time: ${entry.time} s`;
    scoreBoard.appendChild(scoreElement);
  });
}

// Function to display top scores for all levels
function displayAllTopScores() {
  displayTopScores('beginner');
  displayTopScores('intermediate');
  displayTopScores('advanced');
}

// Function to save a score along with time
function saveScore(selectedLevel, playerName, score, time) {
  // Retrieve scores from localStorage or initialize if not available
  const scores = JSON.parse(localStorage.getItem("topScores")) || {};

  // If level scores are not present, initialize as an empty array
  if (!scores[selectedLevel]) {
    scores[selectedLevel] = [];
  }

  // Add the new score and time, then sort by highest score first, then lower time
  scores[selectedLevel].push({ name: playerName, score, time });
  scores[selectedLevel].sort((a, b) => {
    if (b.score === a.score) {
      return a.time - b.time; // If scores are equal, prefer lower time
    }
    return b.score - a.score; // Otherwise, higher score first
  });

  // Keep only top 3 scores
  if (scores[selectedLevel].length > 3) {
    scores[selectedLevel].pop(); // Remove the lowest score
  }

  // Save updated scores back to localStorage
  localStorage.setItem("topScores", JSON.stringify(scores));

  // Update the display
  displayTopScores(selectedLevel);
}
