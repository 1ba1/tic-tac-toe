const Player = (name, marker) => {
  return { name, marker };
};

let playerOne;
let playerTwo;
let gameMode;
const aiPlayer = Player("Computer", "O");

const cells = document.querySelectorAll(".cell");
const menu = document.getElementById("menu");

menu.onclick = () => {
  // game.start();
  // button.innerText = "Reset";
  // playerOneScore = 0;
  // playerTwoScore = 0;
  // aiScore = 0;
  // document.getElementById("pOneScore").innerText = playerOneScore;
  // document.getElementById("pTwoScore").innerText = playerTwoScore;
  // document.getElementById("aiScore").innerText = aiScore;
};

const cpuButton = document.getElementById("cpu");
const startCpu = document.getElementById("startCpu");

cpuButton.onclick = () => {
  document.querySelector(".modal-content-2-cpu").style.display = "flex";
};

startCpu.onclick = e => {
  e.preventDefault();
  const modals = (document.querySelector(".modal").style.display = "none");
  const name = document.querySelector('.modal-content-2-cpu [name="p1"]').value;
  console.log(name);
  playerOne = Player(name, "X");
  document.querySelector(".pOne p").innerText = playerOne.name;
  gameMode = "CPU";
  game.start();
};

const game = (() => {
  let originalBoard,
    isWon = null,
    activeTurn = 0,
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

  const start = () => {
    document.querySelector(".endgame").style.display = "none";
    originalBoard = Array.from(Array(9).keys());
    [...cells].forEach(cell => {
      cell.innerText = "";
      cell.addEventListener("click", turnClick, false);
      cell.style.color = "black";
    });
    const players =
      gameMode === "CPU" ? [playerOne, aiPlayer] : [playerOne, playerTwo];
    const pTwo = document.querySelector("div.pTwo");
    const ai = document.querySelector("div.ai");
    if (gameMode === "CPU") {
      pTwo.style.display = "none";
      ai.style.display = "block";
    } else {
      pTwo.style.display = "block";
      ai.style.display = "none";
    }
    document.querySelector(".whoseTurn").innerText = `${
      players[activeTurn].name
    }'s turn`;
  };

  const togglePlayer = () => {
    activeTurn = activeTurn === 0 ? 1 : 0;
  };

  const turnClick = cell => {
    if (gameMode === "CPU") {
      if (typeof originalBoard[cell.target.id] === "number") {
        turn(cell.target.id, playerOne.marker);
        if (!checkForTieGame() && isWon === null) {
          setTimeout(() => {
            turn(bestSpot(), aiPlayer.marker);
          }, 300);
        }
      }
    } else {
      if (typeof originalBoard[cell.target.id] === "number") {
        turn(cell.target.id, players[activeTurn].marker);
      }
    }
  };

  const turn = (cellId, player) => {
    originalBoard[cellId] = player;
    document.getElementById(cellId).innerText = player;
    if (gameMode !== "CPU") {
      togglePlayer();
      document.querySelector(".whoseTurn").innerText = `${
        players[activeTurn].name
      }'s turn`;
    }
    isWon = checkForWinner(originalBoard, player);
    if (isWon) gameOver(isWon);
    checkForTieGame();
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

  const emptyCells = () => {
    return originalBoard.filter(el => typeof el === "number");
  };

  const bestSpot = () => {
    return minimax(originalBoard, aiPlayer.marker).index;
  };

  const checkForTieGame = () => {
    if (emptyCells().length === 0 && isWon === null) {
      [...cells].forEach(cell => {
        cell.style.color = "green";
        cell.removeEventListener("click", turnClick, false);
      });
      declareWinner("Tie Game!");
      return true;
    }
    return false;
  };

  const gameOver = isWon => {
    for (let index of winCombos[isWon.index]) {
      document.getElementById(index).style.color =
        isWon.player === playerOne.marker ? "red" : "blue";
    }
    [...cells].forEach(cell => {
      cell.removeEventListener("click", turnClick, false);
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
    document.querySelector(".whoseTurn").innerText = "";
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = whoWins;
    setTimeout(() => {
      start();
    }, 2000);
  };

  const minimax = (newBoard, player) => {
    let availSpots = emptyCells(newBoard);

    if (checkForWinner(newBoard, playerOne.marker)) {
      return { score: -10 };
    } else if (checkForWinner(newBoard, aiPlayer.marker)) {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      let move = {};
      move.index = newBoard[availSpots[i]];
      newBoard[availSpots[i]] = player;

      if (player === aiPlayer.marker) {
        let result = minimax(newBoard, playerOne.marker);
        move.score = result.score;
      } else {
        let result = minimax(newBoard, aiPlayer.marker);
        move.score = result.score;
      }

      newBoard[availSpots[i]] = move.index;

      moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer.marker) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  return { start };
})();
