import { ship } from "./ship";

let testShip;

beforeEach(() => {
  testShip = ship(3);
});

test("ship takes a hit and adds 2 to total hits", () => {
  testShip.hit();
  testShip.hit();
  expect(testShip.getHits()).toBe(2);
});

test("ship doesn't sink if hit length - 1 times", () => {
  testShip.hit();
  expect(testShip.isSunk()).toBe(false);
});

test("ship sinks if hit enough times", () => {
  testShip.hit();
  testShip.hit();
  testShip.hit();
  expect(testShip.isSunk()).toBe(true);
});
