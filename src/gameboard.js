import { ship } from "./ship";

const gameboard = () => {
  let board = [];
  let shipCount = 0;
  let ships = [];
  for (let i = 0; i < 10; i++) {
    board[i] = [];
    for (let j = 0; j < 10; j++) {
      board[i][j] = undefined;
    }
  }

  /* ship direction dir = 0: 12 o'clck
  dir = 3: 3 o'clock
  dir = 6: 6 o'clock 
  dir = 9: 9 0'clock*/
  const addShip = (length, i, j, dir = 0) => {
    ships[shipCount] = ship(length);

    if (dir === 0) {
      for (let k = 0; k < length; k++) {
        board[i - k][j] = shipCount;
      }
    } else if (dir === 3) {
      for (let k = 0; k < length; k++) {
        board[i][j + k] = shipCount;
      }
    } else if (dir === 6) {
      for (let k = 0; k < length; k++) {
        board[i + k][j] = shipCount;
      }
    } else if (dir === 9) {
      for (let k = 0; k < length; k++) {
        board[i][j - k] = shipCount;
      }
    }

    shipCount++;
  };

  const receiveAttack = (i, j) => {
    /* if missed shot cell value will change to -1 
    if hit cell value will change to -2*/
    if (board[i][j] === undefined) {
      board[i][j] = -1;
    } else {
      let ship = board[i][j];
      ships[ship].hit();
      board[i][j] = -2;
    }
  };

  const getCoordinateStatus = (i, j) => {
    return board[i][j];
  };

  const getBoard = () => board;

  const getShip = (n) => ships[n];

  return { getBoard, addShip, getCoordinateStatus, receiveAttack, getShip };
};

export { gameboard };
