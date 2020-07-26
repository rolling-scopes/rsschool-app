export const checkIsProfileOwner = (githubId: string, requestedGithubId: string): boolean => {
  return githubId === requestedGithubId;
};
