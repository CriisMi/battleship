import PubSub from "pubsub-js";

const player = () => {
  let isCurrent = false;
  const isTurn = () => isCurrent;

  const changeStatus = () => (isCurrent = !isCurrent);
  PubSub.subscribe("missed_shot", changeStatus());

  const hit = (board) => {
    let b = board.getBoard();
    let i;
    let j;
    do {
      i = Math.floor(Math.random() * 10);
      j = Math.floor(Math.random() * 10);
    } while (b[i][j] === -1 || b[i][j] === -2);
    return [i, j];
  };

  return { isTurn, changeStatus, hit };
};

export { player };
