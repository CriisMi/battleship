const player = () => {
  let isCurrent = false;
  const isTurn = () => isCurrent;

  const changeStatus = () => {
    isCurrent = !isCurrent;
  };

  const hit = (board) => {
    let b = board.getBoard();
    let i;
    let j;
    let options = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (b[i][j] != -1 && b[i][j] != -2) {
          options.push([i, j]);
        }
      }
    }
    let x = Math.floor(Math.random() * options.length);
    return options[x];
  };

  return { isTurn, changeStatus, hit };
};

export { player };
