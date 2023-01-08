import { game } from "./game";
import { gameboard } from "./gameboard";

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
      if (board[i][j] === undefined) {
        cell.addEventListener("click", () => {
          gameBoard.receiveAttack(i, j);
          displayBoard(gameBoard, field, 1);
        });
      }
    }
  }
}

function deactivateBoard(gameBoard, field) {
  while (field.firstChild) {
    field.removeChild(field.lastChild);
  }
  createBoard(field);
  displayBoard(gameBoard, field);
}

function playTurn(player1, player2, gameboard1, gameboard2, field1, field2) {
  if (player1.isTurn()) {
    activateBoard(gameboard2, field2);
  } else {
    deactivateBoard(gameboard2, field2);
    let hit = player2.hit(gameboard1);
    gameboard1.receiveAttack(hit[0], hit[1]);
    setTimeout(() => {
      displayBoard(gameboard1, field1);
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
}

function addShipOnField(gameBoard, field, length, direction) {
  deactivateBoard(gameBoard, field);
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
  activateBoard1(gameBoard, field, rowRange, cellRange, length, direction);
}

function activateBoard1(
  gameBoard,
  field,
  rowRange,
  cellRange,
  length,
  direction
) {
  let board = gameBoard.getBoard();
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      let cell = row.children[j];
      if (board[i][j] === undefined) {
        cell.addEventListener("click", () => {
          console.log(rowRange);
          console.log(cellRange);
          if (
            i >= rowRange[0] &&
            i < rowRange[1] &&
            j >= cellRange[0] &&
            j < cellRange[1]
          ) {
            console.log([i, j]);
            gameBoard.addShip(length, i, j, direction);
            displayBoard(gameBoard, field);
          }
        });
      }
    }
  }
}

export {
  createBoard,
  displayBoard,
  playTurn,
  activateBoard,
  addShipDisplay,
  displayShipToAdd,
  changeShipDirection,
  addShipOnField,
};
