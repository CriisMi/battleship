import { game } from "./game";

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

function changeShipDirection(shipDirection) {
  if (shipDirection === 9) {
    shipDirection = 0;
  } else {
    shipDirection += 3;
  }

  return shipDirection;
}

function displayShipToAdd(length, direction) {
  let container = document.querySelector(".display");
  for (let i = 0; i < 49; i++) {
    container.children[i].style.backgroundColor = "white";
  }
  let ship = returnShipToAdd(length, direction);
  for (let i = 0; i < ship.length; i++) {
    container.children[ship[i]].style.backgroundColor = "black";
  }
  container.children[24].style.backgroundColor = "red";
}

function returnShipToAdd(length, direction) {
  let display = [];
  if (length === 1) {
    display = [24];
  } else if (length === 2) {
    if (direction === 0) {
      display = [24, 17];
    } else if (direction === 3) {
      display = [24, 25];
    } else if (direction === 6) {
      display = [24, 31];
    } else if (direction === 9) {
      display = [24, 23];
    }
  } else if (length === 3) {
    if (direction === 0) {
      display = [24, 17, 10];
    } else if (direction === 3) {
      display = [24, 25, 26];
    } else if (direction === 6) {
      display = [24, 31, 38];
    } else if (direction === 9) {
      display = [24, 23, 22];
    }
  } else if (length === 4) {
    if (direction === 0) {
      display = [24, 17, 10, 3];
    } else if (direction === 3) {
      display = [24, 25, 26, 27];
    } else if (direction === 6) {
      display = [24, 31, 38, 45];
    } else if (direction === 9) {
      display = [24, 23, 22, 21];
    }
  }
  return display;
}

export {
  createBoard,
  displayBoard,
  playTurn,
  activateBoard,
  addShipDisplay,
  displayShipToAdd,
  changeShipDirection,
};
