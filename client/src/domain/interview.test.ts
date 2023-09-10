import { getRating, isInterviewRegistrationInProgress, isInterviewStarted } from './interview';

describe('interview', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2023-01-01')));

  afterAll(() => jest.useRealTimers());

  describe('isInterviewRegistrationInProgess', () => {
    test('should return false if interview period starts more than in 2 weeks from now', () => {
      const isInProgress = isInterviewRegistrationInProgress('2023-02-01');

      expect(isInProgress).toBe(false);
    });

    test('should return false if interview period already started', () => {
      const isInProgress = isInterviewRegistrationInProgress('2022-11-25');

      expect(isInProgress).toBe(false);
    });

    test('should return true if interview period starts less than in 2 weeks', () => {
      const isInProgress = isInterviewRegistrationInProgress('2023-01-10');

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

  describe('getRating', () => {
    test.each([
      [5, 0.5],
      [30, 3],
      [50, 5],
      [100, 5],
    ])(`should calculate %s rating based on score %s for legacy feedback`, (score, expected) => {
      const rating = getRating(score, 100, 0);

      expect(rating).toBe(expected);
    });

    test.each([
      [5, 0.25],
      [30, 1.5],
      [50, 2.5],
      [90, 4.5],
      [100, 5],
    ])(`should calculate %s rating based on score %s`, (score, expected) => {
      const rating = getRating(score, 100, 1);

      expect(rating).toBe(expected);
    });
  });
});
