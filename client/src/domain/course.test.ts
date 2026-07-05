import { CourseTaskDto } from '@client/api';
import { getTasksTotalScore } from './course';

describe('getTasksTotalScore', () => {
  test('should calculate total score', () => {
    expect(
      getTasksTotalScore([
        {
          maxScore: 100,
          scoreWeight: 1,
        },
        {
          maxScore: 100,
          scoreWeight: 0.5,
        },
      ] as CourseTaskDto[]),
    ).toBe(100 + 50);
  });

  test('treats a missing maxScore as zero', () => {
    expect(
      getTasksTotalScore([
        { maxScore: null, scoreWeight: 1 },
        { maxScore: undefined, scoreWeight: 2 },
        { maxScore: 40, scoreWeight: 0.5 },
      ] as unknown as CourseTaskDto[]),
    ).toBe(20);
  });

  test('returns 0 for an empty task list', () => {
    expect(getTasksTotalScore([])).toBe(0);
  });
});
