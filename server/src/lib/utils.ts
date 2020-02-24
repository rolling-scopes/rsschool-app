export const getFullName = (firstName: string, lastName: string, githubId: string) =>
  [firstName, lastName].filter(Boolean).join(' ') || githubId;
