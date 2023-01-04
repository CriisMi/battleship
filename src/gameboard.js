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
    shipCount++;
    if (dir === 0) {
      for (let k = 0; k < length; k++) {
        board[i - k][j] = length;
      }
    } else if (dir === 3) {
      for (let k = 0; k < length; k++) {
        board[i][j + k] = length;
      }
    } else if (dir === 6) {
      for (let k = 0; k < length; k++) {
        board[i + k][j] = length;
      }
    } else if (dir === 9) {
      for (let k = 0; k < length; k++) {
        board[i][j - k] = length;
      }
    }
  };

  const getCoordinateStatus = (i, j) => {
    return board[i][j];
  };

  const getBoard = () => board;

  return { getBoard, addShip, getCoordinateStatus };
};

export { gameboard };
