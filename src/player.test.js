import { gameboard } from "./gameboard";
import { player } from "./player";

let board1;
let board2;
let player1;
let player2;

beforeAll(() => {
  board1 = gameboard();
  board2 = gameboard();
  player1 = player();
  player2 = player();
  player1.changeStatus();
});

test("change player when shot and miss", () => {
  board2.receiveAttack(2, 4);
  expect(player2.isTurn()).toBe(true);
});

test("do not change player when shot and hit", () => {
  board1.addShip(4, 0, 0, 6);
  board1.receiveAttack(3, 0);
  expect(player2.isTurn()).toBe(true);
});

test("player hit retruns coordinate that are not marked as hit or miss", () => {
  const boardtest = () => {
    const getBoard = () => [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [undefined, -1, -1, -1, -1, -2, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -2, -1, -2, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -2, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -2, -1, -1, -1],
      [-1, -1, -2, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ];

    return { getBoard };
  };
  let boardt = boardtest();
  expect(player2.hit(boardt)).toStrictEqual([2, 0]);
});
