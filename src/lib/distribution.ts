function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffleStudents(input) {
  const copy = [...input];
  for (let i = copy.length - 1; i >= 0; i--) {
    const randIndx = getRandomInt(0, i + 1);
    const itemAtIndx = copy[randIndx];
    copy[randIndx] = copy[i];
    copy[i] = itemAtIndx;
  }
  return copy;
}
