function createBoard(field) {
  for (let i = 0; i < 100; i++) {
    let cell = document.createElement("div");
    cell.className = "cell";
    field.appendChild(cell);
  }
}

export { createBoard };
