import { chain } from 'lodash';

export const filterLogin = (login: string) => {
  if (!login) {
    return login;
  }

  return chain(login)
    .trim(' ')
    .thru((str: string) => {
      const questionMarkPosition = login.lastIndexOf('?');
      if (questionMarkPosition === -1) {
        return str;
      }
      return str.slice(0, questionMarkPosition);
    })
    .trimEnd('/')
    .thru((str: string) => {
      const slashPosition = str.lastIndexOf('/');
      if (slashPosition === -1) {
        return str;
      }
      return str.slice(slashPosition + 1);
    })
    .thru((str: string) => {
      if (str === 'github.com') {
        return '';
      }
      return str;
    })
    .value();
};
