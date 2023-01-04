import PubSub from "pubsub-js";

const player = () => {
  let isCurrent = false;
  const isTurn = () => isCurrent;

  const changeStatus = () => (isCurrent = !isCurrent);
  PubSub.subscribe("missed_shot", changeStatus());

  return { isTurn, changeStatus };
};

export { player };
