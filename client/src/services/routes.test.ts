import { getStudentFeedbackRoute, getExpelRoute, getAutoTestTaskRoute, getAutoTestRoute } from './routes';

describe('routes', () => {
  describe('getStudentFeedbackRoute', () => {
    it('builds the mentor feedback url object with course and studentId', () => {
      expect(getStudentFeedbackRoute('rs-2023', 42)).toEqual({
        pathname: '/course/mentor/feedback',
        query: { course: 'rs-2023', studentId: 42 },
      });
    });
  });

  describe('getExpelRoute', () => {
    it('builds the expel-student url object with the course', () => {
      expect(getExpelRoute('rs-2023')).toEqual({
        pathname: '/course/mentor/expel-student',
        query: { course: 'rs-2023' },
      });
    });
  });

  describe('getAutoTestTaskRoute', () => {
    it('builds the auto-test task url object with course and courseTaskId', () => {
      expect(getAutoTestTaskRoute('rs-2023', 7)).toEqual({
        pathname: '/course/student/auto-test/task',
        query: { course: 'rs-2023', courseTaskId: 7 },
      });
    });
  });

  describe('getAutoTestRoute', () => {
    it('builds the auto-test url string with the alias query param', () => {
      expect(getAutoTestRoute('rs-2023')).toBe('/course/student/auto-test?course=rs-2023');
    });
  });
});
