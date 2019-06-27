export function shuffleStudents(input: any[]): any[] {
  for (let i = input.length - 1; i >= 0; i--) {
    const randIndx = Math.random() % (i + 1);
    const itemAtIndx = input[randIndx];
    input[randIndx] = input[i];
    input[i] = itemAtIndx;
  }
  return input;
}
