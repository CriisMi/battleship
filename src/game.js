import { gameboard } from "./gameboard";
import { createBoard } from "./interface";
import { player } from "./player";

const game = () => {
  let player1 = player();
  let gameboard1 = gameboard();
  let player2 = player();
  let gameboard2 = gameboard();

  let field1 = document.querySelector(".gameboards").children[0];
  createBoard(field1);
  let field2 = document.querySelector(".gameboards").children[1];
  createBoard(field2);
};

export { game };
