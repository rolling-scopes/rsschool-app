import { renderHook, waitFor } from '@testing-library/react';
import { useStudentSummary } from './useStudentSummary';
import { Session } from '@client/components/withSession';
import { Course } from '@client/services/models';
import { loadHomeData } from '@client/modules/Home/data/loadHomeData';
import { isStudent } from '@client/domain/user';

vi.mock('@client/modules/Home/data/loadHomeData', () => ({
  loadHomeData: vi.fn(),
}));

vi.mock('@client/domain/user', () => ({
  isStudent: vi.fn(),
}));

const session = { id: 1, githubId: 'octocat', isAdmin: false, isHirer: false, courses: {} } as Session;
const course = { id: 10, name: 'Course', alias: 'c1' } as Course;

describe('useStudentSummary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty defaults when there is no active course', async () => {
    const { result } = renderHook(() => useStudentSummary(session, null));
    expect(result.current.studentSummary).toBeNull();
    expect(result.current.courseTasks).toEqual([]);
    expect(loadHomeData).not.toHaveBeenCalled();
  });

  it('does not load data when the user is not a student in the course', async () => {
    vi.mocked(isStudent).mockReturnValue(false);
    const { result } = renderHook(() => useStudentSummary(session, course));
    await waitFor(() => expect(isStudent).toHaveBeenCalledWith(session, 10));
    expect(loadHomeData).not.toHaveBeenCalled();
    expect(result.current.studentSummary).toBeNull();
  });

  it('loads and exposes the summary and tasks for a student', async () => {
    vi.mocked(isStudent).mockReturnValue(true);
    const summary = { totalScore: 5, results: [], isActive: true, mentor: null, rank: 1 };
    vi.mocked(loadHomeData).mockResolvedValue({
      studentSummary: summary as any,
      courseTasks: [{ id: 1 }, { id: 2 }],
    });

    const { result } = renderHook(() => useStudentSummary(session, course));

    await waitFor(() => expect(result.current.studentSummary).toEqual(summary));
    expect(loadHomeData).toHaveBeenCalledWith(10, 'octocat');
    expect(result.current.courseTasks).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
