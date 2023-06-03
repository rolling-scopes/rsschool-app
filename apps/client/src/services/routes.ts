import type { UrlObject } from 'url';

export const getMentorStudentsRoute = (course: string): UrlObject => {
  return {
    pathname: `/course/mentor/students`,
    query: { course },
  };
};

export const getStudentFeedbackRoute = (course: string, studentId: number): UrlObject => {
  return {
    pathname: `/course/mentor/feedback`,
    query: {
      course,
      studentId,
    },
  };
};

export const getExpelRoute = (course: string): UrlObject => {
  return {
    pathname: `/course/mentor/expel-student`,
    query: {
      course,
    },
  };
};

export const getAutoTestTaskRoute = (course: string, courseTaskId: number): UrlObject => ({
  pathname: '/course/student/auto-test/task',
  query: {
    course,
    courseTaskId,
  },
});

export const getAutoTestRoute = (alias: string): string => `/course/student/auto-test?course=${alias}`;
