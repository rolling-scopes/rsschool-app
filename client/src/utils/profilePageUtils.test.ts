import { StudentStats } from '@common/models';
import { getStudentCoreJSInterviews, checkIsProfileOwner } from './profilePageUtils';

describe('checkIsProfileOwner', () => {
  it('returns true when github ids match', () => {
    expect(checkIsProfileOwner('octocat', 'octocat')).toBe(true);
  });

  it('returns false when github ids differ', () => {
    expect(checkIsProfileOwner('octocat', 'someone-else')).toBe(false);
  });
});

describe('getStudentCoreJSInterviews', () => {
  it('returns undefined for undefined stats', () => {
    expect(getStudentCoreJSInterviews(undefined)).toBeUndefined();
  });

  it('returns undefined for an empty stats array', () => {
    expect(getStudentCoreJSInterviews([])).toBeUndefined();
  });

  it('maps only tasks that have interviewFormAnswers and reshapes the data', () => {
    const stats = [
      {
        courseFullName: 'RS Course Full',
        courseName: 'RS',
        locationName: 'Minsk',
        tasks: [
          {
            interviewFormAnswers: [{ questionText: 'q', answer: 'a' }],
            score: 42,
            comment: 'good',
            interviewer: { name: 'Mentor', githubId: 'mentor1' },
            name: 'CoreJS Interview',
            interviewDate: '2023-01-01',
          },
          {
            // no interviewFormAnswers -> excluded from interviews
            score: 10,
            comment: 'n/a',
            interviewer: { name: 'Other', githubId: 'other' },
            name: 'Regular Task',
            interviewDate: '2023-02-01',
          },
        ],
      },
    ] as unknown as StudentStats[];

    const result = getStudentCoreJSInterviews(stats);

    expect(result).toEqual([
      {
        courseFullName: 'RS Course Full',
        courseName: 'RS',
        locationName: 'Minsk',
        interviews: [
          {
            score: 42,
            comment: 'good',
            interviewer: { name: 'Mentor', githubId: 'mentor1' },
            answers: [{ questionText: 'q', answer: 'a' }],
            name: 'CoreJS Interview',
            interviewDate: '2023-01-01',
          },
        ],
      },
    ]);
  });

  it('filters out students whose tasks have no interview form answers', () => {
    const stats = [
      {
        courseFullName: 'Full',
        courseName: 'C',
        locationName: 'Loc',
        tasks: [{ score: 1, comment: '', name: 'task', interviewDate: '2023-01-01' }],
      },
    ] as unknown as StudentStats[];

    const result = getStudentCoreJSInterviews(stats);

    expect(result).toEqual([]);
  });
});
