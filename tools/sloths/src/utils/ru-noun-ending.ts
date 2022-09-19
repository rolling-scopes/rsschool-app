export const ruNounEnding = (num: number, string1: string, string2: string, stringN: string): string => {
  const n = num % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) {
    return stringN;
  }
  if (n1 > 1 && n1 < 5) {
    return string2;
  }
  if (n1 === 1) {
    return string1;
  }
  return stringN;
};

export default ruNounEnding;
