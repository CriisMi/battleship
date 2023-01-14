import { game } from "./game";
import { gameboard } from "./gameboard";
import { player } from "./player";
import PubSub from "pubsub-js";

function createBoard(field) {
  for (let j = 0; j < 10; j++) {
    let row = document.createElement("div");
    row.className = "row";
    for (let i = 0; i < 10; i++) {
      let cell = document.createElement("div");
      cell.className = "cell";
      row.appendChild(cell);
    }

    field.appendChild(row);
  }
}

function displayBoard(gameBoard, field, player = 0) {
  let board = gameBoard.getBoard();
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      let cell = row.children[j];
      if (board[i][j] === undefined) {
        cell.style.backgroundColor = "white";
      } else if (board[i][j] === -1) {
        cell.style.backgroundColor = "grey";
      } else if (board[i][j] === -2) {
        cell.style.backgroundColor = "red";
      } else {
        if (player === 0) {
          cell.style.backgroundColor = "black";
        }
      }
    }
  }
}

function activateBoard(gameBoard, field) {
  let board = gameBoard.getBoard();
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      let cell = row.children[j];
      if (board[i][j] !== -1 && board[i][j] !== -2) {
        cell.addEventListener("click", () => {
          gameBoard.receiveAttack(i, j);
          displayBoard(gameBoard, field, 1);
          if (gameBoard.getBoard()[i][j] === -1) {
            PubSub.publish("missed_shot1");
          } else if (gameBoard.getBoard()[i][j] === -2) {
            PubSub.publish("hit_shot1");
          }
        });
      }
    }
  }
}

function deactivateBoard(gameBoard, field, player) {
  while (field.firstChild) {
    field.removeChild(field.lastChild);
  }
  createBoard(field);
  displayBoard(gameBoard, field, player);
}

function playTurn(player1, player2, gameboard1, gameboard2, field1, field2) {
  if (player1.isTurn()) {
    deactivateBoard(gameboard2, field2, 1);
    activateBoard(gameboard2, field2);
  } else {
    setTimeout(() => {
      deactivateBoard(gameboard2, field2, 1);
      let hit = player2.hit(gameboard1);
      gameboard1.receiveAttack(hit[0], hit[1]);
      displayBoard(gameboard1, field1);
      if (gameboard1.getBoard()[hit[0]][hit[1]] === -1) {
        PubSub.publish("missed_shot2");
      } else if (gameboard1.getBoard()[hit[0]][hit[1]] === -2) {
        PubSub.publish("hit_shot2");
      }
    }, 500);
  }
}

function addShipDisplay() {
  let container = document.querySelector(".display");
  for (let i = 0; i < 49; i++) {
    let cell = document.createElement("div");
    container.appendChild(cell);
  }
  container.addEventListener("click", () => {
    PubSub.publish("change_direction");
  });
  let rules = document.querySelector(".ship");
  let list = document.createElement("ol");
  let first = document.createElement("li");
  first.textContent = "Click the board on the left to change ship orientation.";
  list.appendChild(first);
  let second = document.createElement("li");
  second.textContent = "Click the board under to add your ship.";
  list.appendChild(second);
  rules.appendChild(list);
}

function changeShipDirection(direction) {
  let dir = direction.toString();
  if (dir === "0,1") {
    direction = [1, 0];
  } else if (dir === "1,0") {
    direction = [0, -1];
  } else if (dir === "0,-1") {
    direction = [-1, 0];
  } else {
    direction = [0, 1];
  }

  return direction;
}

function displayShipToAdd(length, direction) {
  let container = document.querySelector(".display");
  for (let i = 0; i < 49; i++) {
    container.children[i].style.backgroundColor = "white";
  }
  for (let i = 0; i < length; i++) {
    container.children[
      24 - direction[1] * i * 7 + direction[0] * i
    ].style.backgroundColor = "black";
  }
  container.children[24].style.backgroundColor = "red";
  if (length === 0) {
    container.children[24].style.backgroundColor = "white";
  }
}

function addShipOnField(gameBoard, field, length, direction) {
  deactivateBoard(gameBoard, field, 0);

  activateBoard1(gameBoard, field, length, direction);
}

function activateBoard1(gameBoard, field, length, direction) {
  let board = gameBoard.getBoard();
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      let cell = row.children[j];
      if (board[i][j] === undefined) {
        cell.addEventListener("click", () => {
          if (checkIfShipFits(gameBoard, length, direction, i, j)) {
            gameBoard.addShip(length, i, j, direction);
            displayBoard(gameBoard, field);
            PubSub.publish("ship_added");
          }
        });
      }
    }
  }
}

function checkIfShipFits(gameBoard, length, direction, i, j) {
  let board = gameBoard.getBoard();
  let rowRange = [0, 10];
  let cellRange = [0, 10];

  if (direction[1] === 1) {
    rowRange = [length - 1, 10];
  } else if (direction[1] === -1) {
    rowRange = [0, 10 - length + 1];
  }
  if (direction[0] === 1) {
    cellRange = [0, 10 - length + 1];
  } else if (direction[0] === -1) {
    cellRange = [length - 1, 10];
  }
  if (
    i < rowRange[0] ||
    i >= rowRange[1] ||
    j < cellRange[0] ||
    j >= cellRange[1]
  ) {
    return false;
  }

  for (let k = 0; k < length; k++) {
    if (board[i - direction[1] * k][j + direction[0] * k] !== undefined) {
      return false;
    }
  }

  return true;
}

function addShipOnField2(gameBoard) {
  for (let i = 0; i < 10; i++) {
    let direction = generateRandomDir();
    let length = returnShipLength(i);
    let point = generateShipBase(gameBoard);

    do {
      point = generateShipBase(gameBoard);
    } while (
      !checkIfShipFits(gameBoard, length, direction, point[0], point[1])
    );

    gameBoard.addShip(length, point[0], point[1], direction);
  }
}

function returnShipLength(shipCount) {
  let shipLength = 4;
  if (shipCount > 5) {
    shipLength = 1;
  } else if (shipCount > 2) {
    shipLength = 2;
  } else if (shipCount > 0) {
    shipLength = 3;
  }
  return shipLength;
}

function generateRandomDir() {
  let x = Math.floor(Math.random() * 4);
  if (x === 0) {
    return [0, 1];
  } else if (x === 1) {
    return [1, 0];
  } else if (x === 2) {
    return [0, -1];
  } else if (x === 3) {
    return [-1, 0];
  }
}

function generateShipBase(board) {
  let b = board.getBoard();
  let i;
  let j;
  do {
    i = Math.floor(Math.random() * 10);
    j = Math.floor(Math.random() * 10);
  } while (b[i][j] !== undefined);
  return [i, j];
}

function endGame(player) {
  let display = document.querySelector(".ship");
  let message = "";
  if (player === 1) {
    message = "You win!";
  } else {
    message = "Computer won";
  }
  display.textContent = message;
}

export {
  endGame,
  createBoard,
  displayBoard,
  playTurn,
  activateBoard,
  addShipDisplay,
  displayShipToAdd,
  changeShipDirection,
  addShipOnField,
  deactivateBoard,
  returnShipLength,
  addShipOnField2,
};
