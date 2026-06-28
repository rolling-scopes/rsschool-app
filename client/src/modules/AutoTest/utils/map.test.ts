import { CourseTaskDetailedDto } from '@client/api';
import { SelfEducationPublicAttributes, Verification } from '@client/services/course';
import { CourseTaskState, CourseTaskStatus } from '../types';
import { mapTo } from './map';

const PAST = '2000-01-01T00:00:00.000Z';
const FUTURE = '2999-01-01T00:00:00.000Z';

function task(overrides: Partial<CourseTaskDetailedDto> = {}): CourseTaskDetailedDto {
  return {
    id: 1,
    name: 'Task',
    studentEndDate: FUTURE,
    maxScore: 100,
    publicAttributes: {
      maxAttemptsNumber: 3,
      tresholdPercentage: 80,
      strictAttemptsMode: false,
    } as SelfEducationPublicAttributes,
    ...overrides,
  } as CourseTaskDetailedDto;
}

function verification(overrides: Partial<Verification> = {}): Verification {
  return { id: 1, courseTaskId: 1, score: 0, ...overrides } as Verification;
}

describe('mapTo', () => {
  it('keeps only verifications belonging to the given task', () => {
    const result = mapTo(task(), [
      verification({ id: 1, courseTaskId: 1, score: 10 }),
      verification({ id: 2, courseTaskId: 999, score: 20 }),
    ]);

    expect(result.verifications).toHaveLength(1);
    expect(result.verifications[0]?.id).toBe(1);
  });

  describe('state', () => {
    it('is Completed when a verification score reaches the threshold', () => {
      const result = mapTo(task(), [verification({ score: 90 })]);
      expect(result.state).toBe(CourseTaskState.Completed);
    });

    it('is Missed when the deadline passed with no attempts', () => {
      const result = mapTo(task({ studentEndDate: PAST }), []);
      expect(result.state).toBe(CourseTaskState.Missed);
    });

    it('is Uncompleted before the deadline with no passing attempt', () => {
      const result = mapTo(task(), [verification({ score: 10 })]);
      expect(result.state).toBe(CourseTaskState.Uncompleted);
    });

    it('is Uncompleted after the deadline if there were attempts but none passed', () => {
      const result = mapTo(task({ studentEndDate: PAST }), [verification({ score: 10 })]);
      expect(result.state).toBe(CourseTaskState.Uncompleted);
    });
  });

  describe('status', () => {
    it('is Missed when the deadline passed with no attempts', () => {
      const result = mapTo(task({ studentEndDate: PAST }), []);
      expect(result.status).toBe(CourseTaskStatus.Missed);
    });

    it('is Done in strict mode once the attempts limit is reached', () => {
      const strict = task({
        publicAttributes: {
          maxAttemptsNumber: 2,
          strictAttemptsMode: true,
          tresholdPercentage: 80,
        } as SelfEducationPublicAttributes,
      });
      const result = mapTo(strict, [verification({ id: 1, score: 10 }), verification({ id: 2, score: 10 })]);
      expect(result.status).toBe(CourseTaskStatus.Done);
    });

    it('is Done when the latest verification reaches the max score', () => {
      const result = mapTo(task(), [verification({ score: 100 })]);
      expect(result.status).toBe(CourseTaskStatus.Done);
    });

    it('is Done after the deadline when there were attempts', () => {
      const result = mapTo(task({ studentEndDate: PAST }), [verification({ score: 10 })]);
      expect(result.status).toBe(CourseTaskStatus.Done);
    });

    it('is Done when out of attempts and the latest score equals half the max', () => {
      const result = mapTo(
        task({ maxScore: 100, publicAttributes: { maxAttemptsNumber: 1 } as SelfEducationPublicAttributes }),
        [verification({ score: 50 })],
      );
      expect(result.status).toBe(CourseTaskStatus.Done);
    });

    it('is Available before the deadline with attempts left and no qualifying score', () => {
      const result = mapTo(task(), [verification({ score: 10 })]);
      expect(result.status).toBe(CourseTaskStatus.Available);
    });

    it('is Done when the task id is in the manually-done list, overriding the derived status', () => {
      const result = mapTo(task({ id: 7 }), [verification({ courseTaskId: 7, score: 10 })], [7]);
      expect(result.status).toBe(CourseTaskStatus.Done);
    });

    it('ignores manually-done ids that do not match the task', () => {
      const result = mapTo(task({ id: 1 }), [verification({ score: 10 })], [999]);
      expect(result.status).toBe(CourseTaskStatus.Available);
    });
  });
});
