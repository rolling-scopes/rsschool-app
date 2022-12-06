export function getAttemptsLeftMessage(attempts: number, strictAttemptsMode?: boolean) {
  if (attempts === 1) {
    return `Only 1 attempt left. Be careful, It's your last attempt!`;
  }

  if (attempts > 1) {
    return `${attempts} attempts left.`;
  }

  if (strictAttemptsMode) {
    return 'You have no more attempts.';
  }

  return 'Limit of "free" attempts is over. Now you can get only half of a score.';
}
