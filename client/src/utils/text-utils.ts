const githubIdMatch = '[a-z\\d](?:[a-z\\d]|-*(?=[a-z\\d])){0,38}';
const stringStartMatch = '(https?:\\/*\\/)?github.com(\\/)?|https?:\\/*\\/|^';

const LOGIN_FIND_REGEXP = new RegExp(`(${stringStartMatch})(${githubIdMatch})?`, 'i');

export const filterLogin = (login: string) => {
  const matches = login.trim().match(LOGIN_FIND_REGEXP) || [];
  const [foundLogin = ''] = matches.reverse();

  return foundLogin;
};

export const getFullName = (user: { firstName: string | null; lastName: string | null; githubId: string }) =>
  user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : `${user.githubId}`;
