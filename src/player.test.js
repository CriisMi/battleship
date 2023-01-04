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
  board1.addShip(2, 2, 3, 3);
  board1.receiveAttack(2, 4);
  expect(player2.isTurn()).toBe(true);
});
