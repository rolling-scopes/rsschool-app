import { isInterviewRegistrationInProgess, isInterviewStarted } from './interview';

describe('interview', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2023-01-01')));

  afterAll(() => jest.useRealTimers());

  describe('isInterviewRegistrationInProgess', () => {
    test('should return false if interview period starts more than in 2 weeks from now', () => {
      const isInProgress = isInterviewRegistrationInProgess('2023-02-01');

      expect(isInProgress).toBe(false);
    });

    test('should return false if interview period already started', () => {
      const isInProgress = isInterviewRegistrationInProgess('2022-11-25');

      expect(isInProgress).toBe(false);
    });

    test('should return true if interview period starts less than in 2 weeks', () => {
      const isInProgress = isInterviewRegistrationInProgess('2023-01-10');

      expect(isInProgress).toBe(true);
    });
  });

  describe('isInterviewStarted', () => {
    test('should return false if interview starts in future', () => {
      const isStarted = isInterviewStarted('2023-02-01');

      expect(isStarted).toBe(false);
    });

    test('should return true if current date is after interview start date', () => {
      const isStarted = isInterviewStarted('2022-12-01');

      expect(isStarted).toBe(true);
    });
  });
});
