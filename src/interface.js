function createBoard(field) {
  for (let j = 0; j < 10; j++) {
    let row = document.createElement("div");
    row.className = "row";
    for (let i = 0; i < 10; i++) {
      let cell = document.createElement("div");
      cell.className = "cell";
      row.appendChild(cell);
    }

    field.appendChild(row);
  }
}

function displayBoard(board, field, player = 0) {
  for (let i = 0; i < 10; i++) {
    let row = field.children[i];
    for (let j = 0; j < 10; j++) {
      if (board[i][j] === undefined) {
        row.children[j].style.backgroundColor = "white";
      } else if (board[i][j] === -1) {
        row.children[j].style.backgroundColor = "red";
      } else if (board[i][j] === -2) {
        row.children[j].style.backgroundColor = "grey";
      } else {
        if (player === 0) {
          row.children[j].style.backgroundColor = "black";
        }
      }
    }
  }
}

export { createBoard, displayBoard };
