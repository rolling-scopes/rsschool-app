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

export const getAutoTestRoute = (course: string, courseTaskId: number): UrlObject => ({
  pathname: '/course/student/new-auto-test/task',
  query: {
    course,
    courseTaskId,
  },
});
