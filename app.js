let originalBoard,
  isWon = null,
  playerOneScore = 0,
  playerTwoScore = 0,
  aiScore = 0;

const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const Player = (name, marker) => {
  return { name, marker };
};

const playerOne = Player("player 1", "X");
const playerTwo = Player("player 2", "O");
const aiPlayer = Player("computer", "O");
const gameMode = "CPU";

const cells = document.querySelectorAll(".cell");
const button = document.querySelector("button");

button.onclick = () => {
  game.start();
  button.innerText = "Reset";
  playerOneScore = 0;
  playerTwoScore = 0;
  aiScore = 0;
  document.getElementById("pOneScore").innerText = playerOneScore;
  document.getElementById("pTwoScore").innerText = playerTwoScore;
  document.getElementById("aiScore").innerText = aiScore;
};

const game = (() => {
  const start = () => {
    document.querySelector(".endgame").style.display = "none";
    originalBoard = Array.from(Array(9).keys());
    [...cells].forEach(cell => {
      cell.innerText = "";
      cell.addEventListener("click", enableClick, false);
      cell.style.color = "black";
    });
    const pTwo = document.querySelector("div.pTwo");
    const ai = document.querySelector("div.ai");
    if (gameMode === "CPU") {
      pTwo.style.display = "none";
      ai.style.display = "inherit";
    } else {
      pTwo.style.display = "inherit";
      ai.style.display = "none";
    }
  };

  const enableClick = cell => {
    if (typeof originalBoard[cell.target.id] === "number") {
      turn(cell.target.id, playerOne.marker);
      if (!checkForTieGame() && isWon === null) {
        setTimeout(() => {
          turn(bestSpot(), aiPlayer.marker);
        }, 300);
      }
    }
  };

  const turn = (cellId, player) => {
    originalBoard[cellId] = player;
    document.getElementById(cellId).innerText = player;
    isWon = checkForWinner(originalBoard, player);
    if (isWon) gameOver(isWon);
  };

  const checkForWinner = (board, player) => {
    let plays = board.reduce(
      (acc, el, index) => (el === player ? acc.concat(index) : acc),
      []
    );
    isWon = null;
    for (let [index, win] of winCombos.entries()) {
      if (win.every(el => plays.indexOf(el) > -1)) {
        isWon = { index, player };
        break;
      }
    }
    return isWon;
  };

  const gameOver = isWon => {
    for (let index of winCombos[isWon.index]) {
      document.getElementById(index).style.color =
        isWon.player === playerOne.marker ? "red" : "blue";
    }
    [...cells].forEach(cell => {
      cell.removeEventListener("click", enableClick, false);
    });
    if (isWon.player === playerOne.marker) {
      declareWinner(playerOne.name + " wins!");
      playerOneScore++;
      document.getElementById("pOneScore").innerText = playerOneScore;
    } else {
      if (gameMode === "CPU") {
        declareWinner(aiPlayer.name + " wins!");
        aiScore++;
        document.getElementById("aiScore").innerText = aiScore;
      } else {
        declareWinner(playerTwo.name + " wins!");
        playerTwoScore++;
        document.getElementById("pTwoScore").innerText = playerTwoScore;
      }
    }
  };

  const declareWinner = whoWins => {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = whoWins;
    setTimeout(() => {
      start();
    }, 2000);
  };

  const emptyCells = () => {
    return originalBoard.filter(el => typeof el === "number");
  };

  const bestSpot = () => {
    return emptyCells()[0];
  };

  const checkForTieGame = () => {
    if (emptyCells().length === 0 && isWon === null) {
      [...cells].forEach(cell => {
        cell.style.color = "lightgreen";
        cell.removeEventListener("click", enableClick, false);
      });
      declareWinner("Tie Game!");
      return true;
    }
    return false;
  };

  return { start };
})();
