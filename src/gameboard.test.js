import { gameboard } from "./gameboard";

let board;

beforeAll(() => {
  board = gameboard();
});

test("creates 10x10 gameboard", () => {
  expect(board.getBoard()[5][0]).toBe(undefined);
});

test("places ship at specific coordinates", () => {
  board.addShip(3, 4, 3, 9);
  expect(board.getCoordinateStatus(4, 3)).toBe(0);
  expect(board.getCoordinateStatus(4, 2)).toBe(0);
  expect(board.getCoordinateStatus(4, 1)).toBe(0);
});

test("recieve attack will add one hit to the ship if hit", () => {
  board.receiveAttack(4, 2);
  expect(board.getShip(0).getHits()).toBe(1);
});

test("recieve attack will change record coordinates of missed shot", () => {
  board.receiveAttack(4, 0);
  expect(board.getBoard()[4][0]).toBe(-1);
});
