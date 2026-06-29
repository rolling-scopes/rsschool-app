import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Course } from '@entities/course';
import { CoursesService } from 'src/courses/courses.service';
import { CourseTasksService } from 'src/courses';
import { TasksService } from './tasks.service';

// Minimal student shape used by the deadline aggregation. Only id/userId/isExpelled are read.
type StudentLike = { id: number; userId: number; isExpelled: boolean };

const makeStudent = (id: number, userId: number, isExpelled = false): StudentLike => ({ id, userId, isExpelled });

// Minimal course shape: students plus the rest of the course info that gets spread into the result.
const makeCourse = (id: number, students: StudentLike[]) =>
  ({ id, name: `course-${id}`, students }) as unknown as Course;

// Minimal course-task shape as returned by getTasksPendingDeadline (task + taskSolutions relations).
const makeCourseTask = (taskId: number, solutionStudentIds?: number[] | null) => ({
  task: { id: taskId, name: `task-${taskId}` },
  taskSolutions: solutionStudentIds == null ? solutionStudentIds : solutionStudentIds.map(studentId => ({ studentId })),
});

describe('TasksService', () => {
  let service: TasksService;
  let coursesService: Mocked<Pick<CoursesService, 'getActiveCourses'>>;
  let courseTasksService: Mocked<Pick<CourseTasksService, 'getTasksPendingDeadline'>>;

  beforeEach(async () => {
    const mockCoursesService = { getActiveCourses: vi.fn() } as Partial<CoursesService> as CoursesService;
    const mockCourseTasksService = {
      getTasksPendingDeadline: vi.fn(),
    } as Partial<CourseTasksService> as CourseTasksService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: CourseTasksService, useValue: mockCourseTasksService },
      ],
    }).compile();

    service = module.get(TasksService);
    coursesService = module.get(CoursesService);
    courseTasksService = module.get(CourseTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPendingTasksDeadline', () => {
    it('requests active courses with the students relation', async () => {
      coursesService.getActiveCourses.mockResolvedValue([]);

      await service.getPendingTasksDeadline(24);

      expect(coursesService.getActiveCourses).toHaveBeenCalledWith(['students']);
    });

    it('returns an empty map when there are no active courses', async () => {
      coursesService.getActiveCourses.mockResolvedValue([]);

      const result = await service.getPendingTasksDeadline(24);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(courseTasksService.getTasksPendingDeadline).not.toHaveBeenCalled();
    });

    it('forwards courseId and deadlineWithinHours to the course-tasks service per course', async () => {
      coursesService.getActiveCourses.mockResolvedValue([makeCourse(7, [makeStudent(1, 100)])]);
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([]);

      await service.getPendingTasksDeadline(48);

      expect(courseTasksService.getTasksPendingDeadline).toHaveBeenCalledWith(7, { deadlineWithinHours: 48 });
    });

    it('maps a student missing a solution to a pending task keyed by userId', async () => {
      coursesService.getActiveCourses.mockResolvedValue([makeCourse(7, [makeStudent(1, 100)])]);
      // student 1 has no solution for task 10
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([makeCourseTask(10, [])] as never);

      const result = await service.getPendingTasksDeadline(24);

      expect(result.size).toBe(1);
      const pending = result.get(100);
      expect(pending).toHaveLength(1);
      // result entries carry course (without students) and task, but NOT studentHasSolution
      expect(pending?.[0]).toEqual({
        course: expect.objectContaining({ id: 7, name: 'course-7' }),
        task: expect.objectContaining({ id: 10 }),
      });
      expect(pending?.[0]).not.toHaveProperty('studentHasSolution');
      expect(pending?.[0].course).not.toHaveProperty('students');
    });

    it('excludes a student who already has a solution for the task', async () => {
      coursesService.getActiveCourses.mockResolvedValue([makeCourse(7, [makeStudent(1, 100)])]);
      // student 1 already submitted a solution for task 10
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([makeCourseTask(10, [1])] as never);

      const result = await service.getPendingTasksDeadline(24);

      expect(result.size).toBe(0);
    });

    it('skips expelled students entirely', async () => {
      coursesService.getActiveCourses.mockResolvedValue([
        makeCourse(7, [makeStudent(1, 100, true), makeStudent(2, 200)]),
      ]);
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([makeCourseTask(10, [])] as never);

      const result = await service.getPendingTasksDeadline(24);

      // only the non-expelled student 2 (userId 200) is recorded
      expect(result.size).toBe(1);
      expect(result.has(100)).toBe(false);
      expect(result.get(200)).toHaveLength(1);
    });

    it('treats a course task with null taskSolutions as "no one has a solution"', async () => {
      coursesService.getActiveCourses.mockResolvedValue([makeCourse(7, [makeStudent(1, 100)])]);
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([makeCourseTask(10, null)] as never);

      const result = await service.getPendingTasksDeadline(24);

      expect(result.get(100)).toHaveLength(1);
    });

    it('accumulates multiple pending tasks under the same student userId', async () => {
      coursesService.getActiveCourses.mockResolvedValue([makeCourse(7, [makeStudent(1, 100)])]);
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([
        makeCourseTask(10, []),
        makeCourseTask(11, []),
      ] as never);

      const result = await service.getPendingTasksDeadline(24);

      const pending = result.get(100);
      expect(pending).toHaveLength(2);
      expect(pending?.map(p => p.task.id)).toEqual([10, 11]);
    });

    it('records only the tasks a student is missing when they already solved one', async () => {
      coursesService.getActiveCourses.mockResolvedValue([makeCourse(7, [makeStudent(1, 100)])]);
      // solution exists for task 10 but not task 11
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([
        makeCourseTask(10, [1]),
        makeCourseTask(11, []),
      ] as never);

      const result = await service.getPendingTasksDeadline(24);

      const pending = result.get(100);
      expect(pending).toHaveLength(1);
      expect(pending?.[0].task.id).toBe(11);
    });

    it('aggregates pending tasks for the same userId across multiple courses', async () => {
      coursesService.getActiveCourses.mockResolvedValue([
        makeCourse(7, [makeStudent(1, 100)]),
        makeCourse(8, [makeStudent(2, 100)]),
      ]);
      courseTasksService.getTasksPendingDeadline
        .mockResolvedValueOnce([makeCourseTask(10, [])] as never)
        .mockResolvedValueOnce([makeCourseTask(20, [])] as never);

      const result = await service.getPendingTasksDeadline(24);

      // the same userId 100 belongs to a student in each course -> entries merge
      expect(result.size).toBe(1);
      const pending = result.get(100);
      expect(pending).toHaveLength(2);
      expect(pending?.map(p => p.task.id).sort()).toEqual([10, 20]);
      expect(pending?.map(p => p.course.id).sort()).toEqual([7, 8]);
    });

    it('produces no entries when a course has tasks but no students', async () => {
      coursesService.getActiveCourses.mockResolvedValue([makeCourse(7, [])]);
      courseTasksService.getTasksPendingDeadline.mockResolvedValue([makeCourseTask(10, [])] as never);

      const result = await service.getPendingTasksDeadline(24);

      expect(result.size).toBe(0);
    });
  });
});
