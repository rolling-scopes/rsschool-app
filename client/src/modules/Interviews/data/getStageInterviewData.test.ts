import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskDtoTypeEnum } from '@client/api';
import { getStageInterviewData } from './getStageInterviewData';

const { getStudent, getCourseTasks, getCourseStats, getInterviewFeedback } = vi.hoisted(() => ({
  getStudent: vi.fn(),
  getCourseTasks: vi.fn(),
  getCourseStats: vi.fn(),
  getInterviewFeedback: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  StudentsApi: function StudentsApi() {
    return { getStudent };
  },
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasks };
  },
  CourseStatsApi: function CourseStatsApi() {
    return { getCourseStats };
  },
  CoursesInterviewsApi: function CoursesInterviewsApi() {
    return { getInterviewFeedback };
  },
}));

// getTasksTotalScore is part of the data computation; provide a deterministic stub.
vi.mock('@client/domain/course', () => ({
  getTasksTotalScore: (tasks: { maxScore?: number }[]) => tasks.reduce((sum, t) => sum + (t.maxScore ?? 0), 0),
}));

function setupHappyPath() {
  getStudent.mockResolvedValue({ data: { id: 5, githubId: 'stud' } });
  getCourseTasks.mockResolvedValue({ data: [{ maxScore: 100 }, { maxScore: 50 }] });
  getCourseStats.mockResolvedValue({ data: { activeStudentsCount: 30 } });
  getInterviewFeedback.mockResolvedValue({ data: { id: 9, json: {} } });
}

describe('getStageInterviewData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aggregates student, course summary and interview feedback for valid query params', async () => {
    setupHappyPath();

    const result = await getStageInterviewData({
      query: { studentId: '5', interviewId: '9' },
      courseId: 42,
    });

    expect(getStudent).toHaveBeenCalledWith(5);
    expect(getCourseTasks).toHaveBeenCalledWith(42);
    expect(getCourseStats).toHaveBeenCalledWith(42);
    expect(getInterviewFeedback).toHaveBeenCalledWith(42, 9, TaskDtoTypeEnum.StageInterview);

    expect(result).toEqual({
      interviewId: 9,
      student: { id: 5, githubId: 'stud' },
      courseSummary: { totalScore: 150, studentsCount: 30 },
      interviewFeedback: { id: 9, json: {} },
      type: TaskDtoTypeEnum.StageInterview,
    });
  });

  it('throws when the studentId param is missing', async () => {
    await expect(getStageInterviewData({ query: { interviewId: '9' }, courseId: 42 })).rejects.toThrow(
      'Parameter studentId is not defined',
    );
  });

  it('throws when the interviewId param is missing', async () => {
    await expect(getStageInterviewData({ query: { studentId: '5' }, courseId: 42 })).rejects.toThrow(
      'Parameter interviewId is not defined',
    );
  });

  it('throws "Student not found" when the student lookup returns nothing', async () => {
    setupHappyPath();
    getStudent.mockResolvedValue({ data: undefined });

    await expect(getStageInterviewData({ query: { studentId: '5', interviewId: '9' }, courseId: 42 })).rejects.toThrow(
      'Student not found',
    );
  });
});
