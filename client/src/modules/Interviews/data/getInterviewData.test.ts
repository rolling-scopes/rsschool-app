import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInterviewData } from './getInterviewData';

const { getInterviews } = vi.hoisted(() => ({ getInterviews: vi.fn() }));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesInterviewsApi: function CoursesInterviewsApi() {
    return { getInterviews };
  },
}));

describe('getInterviewData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the matching interview task id, type and githubId from the query', async () => {
    getInterviews.mockResolvedValue({
      data: [
        { id: 11, attributes: { template: 'react' } },
        { id: 22, attributes: { template: 'shortTrackScreening' } },
      ],
    });

    const result = await getInterviewData({
      query: { githubId: 'student-1', type: 'shortTrackScreening' },
      courseId: 42,
    });

    expect(getInterviews).toHaveBeenCalledWith(42, false);
    expect(result).toEqual({
      interviewTaskId: 22,
      type: 'shortTrackScreening',
      githubId: 'student-1',
    });
  });

  it('throws "Interview not found" when no interview matches the requested template', async () => {
    getInterviews.mockResolvedValue({
      data: [{ id: 11, attributes: { template: 'react' } }],
    });

    await expect(getInterviewData({ query: { githubId: 'student-1', type: 'angular' }, courseId: 42 })).rejects.toThrow(
      'Interview not found',
    );
  });

  it('throws when an interview has no attributes at all', async () => {
    getInterviews.mockResolvedValue({ data: [{ id: 11 }] });

    await expect(getInterviewData({ query: { githubId: 'x', type: 'react' }, courseId: 1 })).rejects.toThrow(
      'Interview not found',
    );
  });
});
