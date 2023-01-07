import { gameboard } from "./gameboard";
import PubSub from "pubsub-js";
import {
  activateBoard,
  addShipDisplay,
  changeShipDirection,
  createBoard,
  displayBoard,
  displayShipToAdd,
  playTurn,
} from "./interface";
import { player } from "./player";

const game = () => {
  addShipDisplay();
  let shipDirection = 3;
  let shipCount = 0;
  displayShipToAdd(3, shipDirection);
  PubSub.subscribe("change_direction", () => {
    shipDirection = changeShipDirection(shipDirection);
    displayShipToAdd(3, shipDirection);
  });

  let player1 = player();
  player1.changeStatus();
  let gameboard1 = gameboard();
  let player2 = player();
  let gameboard2 = gameboard();

  let field1 = document.querySelector(".gameboards").children[0];
  createBoard(field1);
  let field2 = document.querySelector(".gameboards").children[1];
  createBoard(field2);

  displayBoard(gameboard1, field1);
  displayBoard(gameboard2, field2, 1);
  activateBoard(gameboard2, field2);

  PubSub.subscribe("missed_shot", () => {
    playTurn(player1, player2, gameboard1, gameboard2, field1, field2);
  });
};

export { game };
