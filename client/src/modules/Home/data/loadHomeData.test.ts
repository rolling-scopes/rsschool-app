import { loadHomeData } from './loadHomeData';

const { getStudentSummary, getCourseTasks, CourseServiceCtor } = vi.hoisted(() => ({
  getStudentSummary: vi.fn(),
  getCourseTasks: vi.fn(),
  CourseServiceCtor: vi.fn(),
}));

vi.mock('@client/services/course', () => ({
  CourseService: function CourseService(courseId: number) {
    CourseServiceCtor(courseId);
    return { getStudentSummary };
  },
}));

vi.mock('@client/api', () => ({
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasks };
  },
}));

describe('loadHomeData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads the student summary and trims course tasks to ids only', async () => {
    const summary = { totalScore: 42, results: [], isActive: true, mentor: null, rank: 1 };
    getStudentSummary.mockResolvedValue(summary);
    getCourseTasks.mockResolvedValue({
      data: [
        { id: 1, name: 'A', maxScore: 100 },
        { id: 2, name: 'B', maxScore: 50 },
      ],
    });

    const result = await loadHomeData(7, 'octocat');

    expect(CourseServiceCtor).toHaveBeenCalledWith(7);
    expect(getStudentSummary).toHaveBeenCalledWith('octocat');
    expect(getCourseTasks).toHaveBeenCalledWith(7);
    expect(result).toEqual({
      studentSummary: summary,
      courseTasks: [{ id: 1 }, { id: 2 }],
    });
  });

  it('returns an empty task list when the course has no tasks', async () => {
    getStudentSummary.mockResolvedValue(null);
    getCourseTasks.mockResolvedValue({ data: [] });

    const result = await loadHomeData(1, 'user');

    expect(result.courseTasks).toEqual([]);
    expect(result.studentSummary).toBeNull();
  });
});
