const colors = ['colorBgContainer', 'red1', 'yellow1', 'green1'] as const;

export function getCriteriaStatusColor(score: number, maxScore?: number) {
  const [transparent, red, yellow, green] = colors;

  if (!maxScore) {
    return transparent;
  }

  if (score === 0) {
    return red;
  }

  if (score < maxScore) {
    return yellow;
  }

  if (score === maxScore) {
    return green;
  }

  return transparent;
}
