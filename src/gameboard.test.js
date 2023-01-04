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
  expect(board.getCoordinateStatus(4, 3)).toBe(3);
  expect(board.getCoordinateStatus(4, 2)).toBe(3);
  expect(board.getCoordinateStatus(4, 1)).toBe(3);
});
