const colors = ['transparent', 'rgba(255, 0, 0, .05)', 'rgba(0, 255, 0, .05)', 'rgba(255, 255, 0, .05)'] as const;

export function getCriteriaStatusColor(score: number, maxScore?: number) {
  const [transparent, red, green, yellow] = colors;

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
