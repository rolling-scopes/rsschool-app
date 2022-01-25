import type { UrlObject } from 'url';

export const getMentorStudentsRoute = (course: string): UrlObject => {
  return {
    pathname: `/course/mentor/students`,
    query: { course },
  };
};
