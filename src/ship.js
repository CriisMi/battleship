const ship = (length) => {
  let hits = 0;
  let sunk = false;
  const hit = () => {
    hits++;
  };
  const isSunk = () => {
    if (hits >= length) {
      return true;
    } else {
      return false;
    }
  };
  const getHits = () => hits;
  return { length, getHits, isSunk, hit };
};

export { ship };
