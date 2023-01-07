import { gameboard } from "./gameboard";
import { createBoard, displayBoard, shootEvents } from "./interface";
import { player } from "./player";

const game = () => {
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
  shootEvents(gameboard2, field2);
};

export { game };
