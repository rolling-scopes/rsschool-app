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
});
