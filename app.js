let playerOne, playerTwo, gameMode, originalBoard;

const cells = document.querySelectorAll(".cell");

const menu = document.getElementById("menu");

menu.onclick = () => {
  document.querySelector(".modal").style.display = "block";
  document.querySelector(".modal-content-2-cpu").style.display = "none";
  document.querySelector(".modal-content-2-p2").style.display = "none";
  playerOneScore = 0;
  playerTwoScore = 0;
  aiScore = 0;
  document.getElementById("pOneScore").innerText = playerOneScore;
  document.getElementById("pTwoScore").innerText = playerTwoScore;
  document.getElementById("aiScore").innerText = aiScore;
};

const back = document.querySelector(".back");

back.onclick = () => {
  document.querySelector(".modal-content-2-cpu").style.display = "none";
  document.querySelector(".modal-content-2-p2").style.display = "none";
};

const cpuButton = document.getElementById("cpu");
const startCpu = document.getElementById("startCpu");

cpuButton.onclick = () => {
  document.querySelector(".modal-content-2-cpu").style.display = "flex";
};

startCpu.onclick = e => {
  e.preventDefault();
  document.querySelector(".modal").style.display = "none";
  const form = document.querySelector(".modal-content-2-cpu form");
  const name = form.p1.value;
  playerOne = Player(name, "X");
  document.querySelector(".pOne p").innerText = playerOne.name;
  gameMode = "CPU";
  form.p1.value = "";
  game.start();
};

const twoPlayersButton = document.getElementById("twoP");
const start2P = document.getElementById("start2P");

twoPlayersButton.onclick = () => {
  document.querySelector(".modal-content-2-p2").style.display = "flex";
};

start2P.onclick = e => {
  e.preventDefault();
  document.querySelector(".modal").style.display = "none";
  const form = document.querySelector(".modal-content-2-p2 form");
  const name = form.p1.value;
  playerOne = Player(name, "X");
  const name2 = form.p2.value;
  playerTwo = Player(name2, "O");
  document.querySelector(".pOne p").innerText = playerOne.name;
  document.querySelector(".pTwo p").innerText = playerTwo.name;
  gameMode = "P1vsP2";
  form.p1.value = "";
  form.p2.value = "";
  game.start();
};

const game = (() => {
  let isWon = null,
    activeTurn = 0,
    playerOneScore = 0,
    playerTwoScore = 0,
    aiScore = 0,
    players;

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

    const pTwo = document.querySelector("div.pTwo");
    const ai = document.querySelector("div.ai");

    if (gameMode === "CPU") {
      pTwo.style.display = "none";
      ai.style.display = "block";
    } else {
      pTwo.style.display = "block";
      ai.style.display = "none";
      players = [playerOne, playerTwo];
    }

    document.querySelector(".whoseTurn").innerText = `${
      players[activeTurn].name
    }'s turn`;
  };

  const togglePlayer = () => {
    activeTurn = activeTurn === 0 ? 1 : 0;
  };

  const turnClick = cell => {
    if (typeof originalBoard[cell.target.id] === "number") {
      if (gameMode === "CPU") {
        turn(cell.target.id, playerOne.marker);
        if (isWon === null && !checkForTieGame()) {
          setTimeout(() => {
            turn(bestSpot(), aiPlayer.marker);
          }, 100);
        }
      } else {
        players[activeTurn].placeMarker(cell.target.id);
        isWon = checkForWinner(originalBoard, players[activeTurn].marker);
        if (isWon) gameOver(isWon);
        if (isWon === null && !checkForTieGame()) {
          togglePlayer();
          document.querySelector(".whoseTurn").innerText = `${
            players[activeTurn].name
          }'s turn`;
        }
      }
    }
  };

  // only for CPU game mode
  const turn = (cellId, player) => {
    originalBoard[cellId] = player;
    document.getElementById(cellId).innerText = player;
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

  return { start, bestSpot };
})();

const Player = (name, marker) => {
  const placeMarker = cell => {
    originalBoard[cell] = marker;
    document.getElementById(cell).innerText = marker;
  };
  return { name, marker, placeMarker };
};

const aiPlayer = Player("Computer", "O");
