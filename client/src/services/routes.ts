import type { UrlObject } from 'url';

export const getMentorStudentsRoute = (alias: string): UrlObject => {
  return {
    pathname: `/course/mentor/students`,
    query: { alias },
  };
};
