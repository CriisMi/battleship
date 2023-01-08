import { gameboard } from "./gameboard";
import PubSub from "pubsub-js";
import {
  activateBoard,
  addShipDisplay,
  addShipOnField,
  addShipOnField2,
  changeShipDirection,
  createBoard,
  deactivateBoard,
  displayBoard,
  displayShipToAdd,
  playTurn,
  returnShipLength,
} from "./interface";
import { player } from "./player";

const game = () => {
  addShipDisplay();
  let shipDirection = [0, 1];
  let shipCount = 0;
  let shipLength = 4;
  PubSub.subscribe("ship_added", () => {
    shipCount += 1;
    shipLength = returnShipLength(shipCount);
    if (shipCount >= 10) {
      displayShipToAdd(0, shipDirection);
      deactivateBoard(gameboard1, field1);
      activateBoard(gameboard2, field2);
      PubSub.subscribe("fired_shot", () => {
        playTurn(player1, player2, gameboard1, gameboard2, field1, field2);
      });
    } else {
      displayShipToAdd(shipLength, shipDirection);
      addShipOnField(gameboard1, field1, shipLength, shipDirection);
    }
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

  addShipOnField2(gameboard2);
  displayBoard(gameboard2, field2, 1);

  displayShipToAdd(shipLength, shipDirection);
  addShipOnField(gameboard1, field1, shipLength, shipDirection);
  PubSub.subscribe("change_direction", () => {
    shipDirection = changeShipDirection(shipDirection);
    displayShipToAdd(shipLength, shipDirection);
    addShipOnField(gameboard1, field1, shipLength, shipDirection);
  });
};

export { game };
