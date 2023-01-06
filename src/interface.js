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

function displayBoard(board, field) {
  /* for(let i = 0; i < 100; i++) */
}

export { createBoard, displayBoard };
