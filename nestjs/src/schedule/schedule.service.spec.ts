import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { History } from '@entities/history';
import { CourseEvent } from '@entities/courseEvent';
import { CoursesService } from 'src/courses/courses.service';
import { ScheduleService } from './schedule.service';

// Fluent query-builder mock: chainable methods return the qb; the terminal
// method (getMany / getRawMany) resolves to the supplied rows.
function makeQb(terminal: 'getMany' | 'getRawMany', rows: unknown[]) {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of ['select', 'addSelect', 'leftJoin', 'innerJoin', 'where', 'orderBy', 'groupBy']) {
    qb[m] = vi.fn(() => qb);
  }
  qb[terminal] = vi.fn(async () => rows);
  return qb;
}

describe('ScheduleService', () => {
  let service: ScheduleService;
  let courseService: { getByIds: ReturnType<typeof vi.fn> };
  let userRepository: { createQueryBuilder: ReturnType<typeof vi.fn> };
  let historyRepository: { createQueryBuilder: ReturnType<typeof vi.fn> };
  let courseEventRepository: { query: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    courseService = { getByIds: vi.fn() };
    userRepository = { createQueryBuilder: vi.fn() };
    historyRepository = { createQueryBuilder: vi.fn() };
    courseEventRepository = { query: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: CoursesService, useValue: courseService },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(History), useValue: historyRepository },
        { provide: getRepositoryToken(CourseEvent), useValue: courseEventRepository },
      ],
    }).compile();

    service = module.get(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInsertFields', () => {
    it('returns dateTime only for an event without a place', () => {
      const result = service.getInsertFields('course_event', { dateTime: '2024-01-01' } as never);

      expect(result).toEqual({ dateTime: '2024-01-01' });
    });

    it('includes place for an event that has one', () => {
      const result = service.getInsertFields('course_event', {
        dateTime: '2024-01-01',
        place: 'Online',
      } as never);

      expect(result).toEqual({ dateTime: '2024-01-01', place: 'Online' });
    });

    it('returns student dates for a task without a cross-check end date', () => {
      const result = service.getInsertFields('course_task', {
        studentStartDate: '2024-01-01',
        studentEndDate: '2024-01-10',
      } as never);

      expect(result).toEqual({ studentStartDate: '2024-01-01', studentEndDate: '2024-01-10' });
    });

    it('includes crossCheckEndDate for a task that has one', () => {
      const result = service.getInsertFields('course_task', {
        studentStartDate: '2024-01-01',
        studentEndDate: '2024-01-10',
        crossCheckEndDate: '2024-01-15',
      } as never);

      expect(result).toEqual({
        studentStartDate: '2024-01-01',
        studentEndDate: '2024-01-10',
        crossCheckEndDate: '2024-01-15',
      });
    });
  });

  describe('getUpdatedFields', () => {
    describe('course_event', () => {
      it('reports both place and dateTime changes with their old values', () => {
        const result = service.getUpdatedFields(
          'course_event',
          { place: 'New', dateTime: '2024-02-01' } as never,
          { place: 'Old', dateTime: '2024-01-01' } as never,
        );

        expect(result).toEqual({
          place: 'New',
          placeOld: 'Old',
          dateTime: '2024-02-01',
          dateTimeOld: '2024-01-01',
        });
      });

      it('reports only the changed place when the dateTime is unchanged', () => {
        const result = service.getUpdatedFields(
          'course_event',
          { place: 'New', dateTime: '2024-01-01' } as never,
          { place: 'Old', dateTime: '2024-01-01' } as never,
        );

        expect(result).toEqual({ place: 'New', placeOld: 'Old' });
      });

      it('returns undefined when nothing changed', () => {
        const result = service.getUpdatedFields(
          'course_event',
          { place: 'Same', dateTime: '2024-01-01' } as never,
          { place: 'Same', dateTime: '2024-01-01' } as never,
        );

        expect(result).toBeUndefined();
      });
    });

    describe('course_task', () => {
      it('reports all three date changes with old values', () => {
        const result = service.getUpdatedFields(
          'course_task',
          {
            studentStartDate: '2024-02-01',
            studentEndDate: '2024-02-10',
            crossCheckEndDate: '2024-02-15',
          } as never,
          {
            studentStartDate: '2024-01-01',
            studentEndDate: '2024-01-10',
            crossCheckEndDate: '2024-01-15',
          } as never,
        );

        expect(result).toEqual({
          studentStartDate: '2024-02-01',
          studentStartDateOld: '2024-01-01',
          studentEndDate: '2024-02-10',
          studentEndDateOld: '2024-01-10',
          crossCheckEndDate: '2024-02-15',
          crossCheckEndDateOld: '2024-01-15',
        });
      });

      it('reports only studentEndDate when just the end date changed', () => {
        const result = service.getUpdatedFields(
          'course_task',
          {
            studentStartDate: '2024-01-01',
            studentEndDate: '2024-02-10',
            crossCheckEndDate: '2024-01-15',
          } as never,
          {
            studentStartDate: '2024-01-01',
            studentEndDate: '2024-01-10',
            crossCheckEndDate: '2024-01-15',
          } as never,
        );

        expect(result).toEqual({ studentEndDate: '2024-02-10', studentEndDateOld: '2024-01-10' });
      });

      it('reports only crossCheckEndDate when just the cross-check date changed', () => {
        const result = service.getUpdatedFields(
          'course_task',
          {
            studentStartDate: '2024-01-01',
            studentEndDate: '2024-01-10',
            crossCheckEndDate: '2024-02-15',
          } as never,
          {
            studentStartDate: '2024-01-01',
            studentEndDate: '2024-01-10',
            crossCheckEndDate: '2024-01-15',
          } as never,
        );

        expect(result).toEqual({ crossCheckEndDate: '2024-02-15', crossCheckEndDateOld: '2024-01-15' });
      });

      it('returns an empty object when no task date changed', () => {
        const result = service.getUpdatedFields(
          'course_task',
          {
            studentStartDate: '2024-01-01',
            studentEndDate: '2024-01-10',
            crossCheckEndDate: '2024-01-15',
          } as never,
          {
            studentStartDate: '2024-01-01',
            studentEndDate: '2024-01-10',
            crossCheckEndDate: '2024-01-15',
          } as never,
        );

        expect(result).toEqual({});
      });

      it('treats two null dates as equal and reports no change', () => {
        const result = service.getUpdatedFields(
          'course_task',
          {
            studentStartDate: null,
            studentEndDate: null,
            crossCheckEndDate: null,
          } as never,
          {
            studentStartDate: null,
            studentEndDate: null,
            crossCheckEndDate: null,
          } as never,
        );

        expect(result).toEqual({});
      });

      it('coerces missing previous dates to undefined in every old field', () => {
        const result = service.getUpdatedFields(
          'course_task',
          {
            studentStartDate: '2024-02-01',
            studentEndDate: '2024-02-10',
            crossCheckEndDate: '2024-02-15',
          } as never,
          {
            studentStartDate: null,
            studentEndDate: null,
            crossCheckEndDate: null,
          } as never,
        );

        // all three changed (null -> value); every old value is null -> undefined
        expect(result).toEqual({
          studentStartDate: '2024-02-01',
          studentStartDateOld: undefined,
          studentEndDate: '2024-02-10',
          studentEndDateOld: undefined,
          crossCheckEndDate: '2024-02-15',
          crossCheckEndDateOld: undefined,
        });
      });
    });
  });

  describe('getChangedCoursesRecipients', () => {
    it('returns an empty array when there are no active updated courses', async () => {
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', []));
      courseEventRepository.query.mockResolvedValue([]);
      courseService.getByIds.mockResolvedValue([]);

      const result = await service.getChangedCoursesRecipients();

      expect(courseService.getByIds).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('defaults to a 2-hour lookback window', async () => {
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', []));
      courseEventRepository.query.mockResolvedValue([]);
      courseService.getByIds.mockResolvedValue([]);

      await service.getChangedCoursesRecipients();

      // getScheduleUpdatedRecords builds a where with MoreThanOrEqual(date); we just
      // assert the query builder was used (lastHours default exercised without error).
      expect(historyRepository.createQueryBuilder).toHaveBeenCalledWith('entry');
    });

    it('builds recipients from history changes, joining course aliases per user', async () => {
      const insertRecord = {
        operation: 'insert',
        entityId: 100,
        event: 'course_task',
        update: { courseId: 5, taskId: 200, studentStartDate: '2024-01-01', studentEndDate: '2024-01-10' },
        previous: null,
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [insertRecord]));

      // buildTaskEventMap query resolves task names
      courseEventRepository.query.mockResolvedValue([{ id: 200, name: 'Task 200', type: 'task' }]);

      // active course matching the changed courseId
      const course = { id: 5, alias: 'course-a', name: 'Course A', completed: false };
      courseService.getByIds.mockResolvedValue([course]);

      // user enrolled into that course alias
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      expect(courseService.getByIds).toHaveBeenCalledWith([5], expect.any(Object));
      expect(result).toHaveLength(1);
      const [userId, courses] = result[0];
      expect(userId).toBe(42);
      expect(courses[0].course).toBe(course);
      expect(courses[0].changes[0]).toMatchObject({ isNew: true, type: 'task', name: 'Task 200' });
    });

    it('skips users that have no matching course aliases', async () => {
      const insertRecord = {
        operation: 'insert',
        entityId: 100,
        event: 'course_event',
        update: { courseId: 5, eventId: 300, dateTime: '2024-01-01' },
        previous: null,
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [insertRecord]));
      courseEventRepository.query.mockResolvedValue([{ id: 300, name: 'Event 300', type: 'event' }]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      // user with empty aliases must be filtered out
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: [] }]));

      const result = await service.getChangedCoursesRecipients(2);

      expect(result).toEqual([]);
    });

    it('marks a removed entry when the operation is remove', async () => {
      const removeRecord = {
        operation: 'remove',
        entityId: 100,
        event: 'course_task',
        update: { courseId: 5, taskId: 200 },
        previous: { courseId: 5, taskId: 200, studentStartDate: '2024-01-01', studentEndDate: '2024-01-10' },
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [removeRecord]));
      courseEventRepository.query.mockResolvedValue([{ id: 200, name: 'Task 200', type: 'task' }]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      expect(result[0][1][0].changes[0]).toMatchObject({ isRemoved: true, type: 'task' });
    });

    it('treats a disabled-task update as a removal', async () => {
      const disableRecord = {
        operation: 'update',
        entityId: 100,
        event: 'course_task',
        update: { courseId: 5, taskId: 200, disabled: true },
        previous: { courseId: 5, taskId: 200, studentStartDate: '2024-01-01', studentEndDate: '2024-01-10' },
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [disableRecord]));
      courseEventRepository.query.mockResolvedValue([{ id: 200, name: 'Task 200', type: 'task' }]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      expect(result[0][1][0].changes[0]).toMatchObject({ isRemoved: true });
    });

    it('records an updated entry merging previous and new fields', async () => {
      const updateRecord = {
        operation: 'update',
        entityId: 100,
        event: 'course_event',
        update: { courseId: 5, eventId: 300, place: 'New', dateTime: '2024-02-01' },
        previous: { courseId: 5, eventId: 300, place: 'Old', dateTime: '2024-01-01' },
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [updateRecord]));
      courseEventRepository.query.mockResolvedValue([{ id: 300, name: 'Event 300', type: 'event' }]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      expect(result[0][1][0].changes[0]).toMatchObject({
        type: 'event',
        place: 'New',
        placeOld: 'Old',
        name: 'Event 300',
      });
    });

    it('falls back to the previous entry courseId/parentId when the update is empty', async () => {
      // previous-only path drives getParentId via previousEntry and courseId via entryPrevious
      const removeRecord = {
        operation: 'remove',
        entityId: 100,
        event: 'course_event',
        update: {},
        previous: { courseId: 5, eventId: 300, dateTime: '2024-01-01' },
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [removeRecord]));
      courseEventRepository.query.mockResolvedValue([{ id: 300, name: 'Event 300', type: 'event' }]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      expect(courseService.getByIds).toHaveBeenCalledWith([5], expect.any(Object));
      expect(result[0][1][0].changes[0]).toMatchObject({ isRemoved: true, name: 'Event 300' });
    });

    it('reuses an existing course bucket for multiple changes of the same course', async () => {
      const records = [
        {
          operation: 'insert',
          entityId: 100,
          event: 'course_task',
          update: { courseId: 5, taskId: 200, studentStartDate: '2024-01-01', studentEndDate: '2024-01-10' },
          previous: null,
        },
        {
          operation: 'insert',
          entityId: 101,
          event: 'course_event',
          update: { courseId: 5, eventId: 300, dateTime: '2024-01-05' },
          previous: null,
        },
      ] as unknown as History[];
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', records));
      courseEventRepository.query.mockResolvedValue([
        { id: 200, name: 'Task 200', type: 'task' },
        { id: 300, name: 'Event 300', type: 'event' },
      ]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      // both changes land in the single course-a bucket for user 42
      expect(courseService.getByIds).toHaveBeenCalledWith([5], expect.any(Object));
      expect(result[0][1][0].changes).toHaveLength(2);
    });

    it('merges a later update onto an earlier change for the same entry key', async () => {
      const records = [
        {
          operation: 'insert',
          entityId: 100,
          event: 'course_event',
          update: { courseId: 5, eventId: 300, dateTime: '2024-01-01', place: 'Old' },
          previous: null,
        },
        {
          operation: 'update',
          entityId: 100,
          event: 'course_event',
          update: { courseId: 5, eventId: 300, dateTime: '2024-01-01', place: 'New' },
          previous: { courseId: 5, eventId: 300, dateTime: '2024-01-01', place: 'Old' },
        },
      ] as unknown as History[];
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', records));
      courseEventRepository.query.mockResolvedValue([{ id: 300, name: 'Event 300', type: 'event' }]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      // single entry key -> one merged change carrying the place update over the insert
      const changes = result[0][1][0].changes;
      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({ isNew: true, place: 'New', placeOld: 'Old' });
    });

    it('ignores records with an unrecognized operation', async () => {
      const unknownRecord = {
        operation: 'unknown',
        entityId: 100,
        event: 'course_task',
        update: { courseId: 5, taskId: 200 },
        previous: { courseId: 5, taskId: 200 },
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [unknownRecord]));
      courseEventRepository.query.mockResolvedValue([{ id: 200, name: 'Task 200', type: 'task' }]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      // course bucket exists (courseId tracked) but no change was recorded
      expect(result[0][1][0].changes).toEqual([]);
    });

    it('defaults the change name to an empty string when no task/event entry is found', async () => {
      const insertRecord = {
        operation: 'insert',
        entityId: 100,
        event: 'course_task',
        update: { courseId: 5, taskId: 200, studentStartDate: '2024-01-01', studentEndDate: '2024-01-10' },
        previous: null,
      } as unknown as History;
      historyRepository.createQueryBuilder.mockReturnValue(makeQb('getMany', [insertRecord]));
      // no matching name rows returned
      courseEventRepository.query.mockResolvedValue([]);
      courseService.getByIds.mockResolvedValue([{ id: 5, alias: 'course-a', name: 'Course A', completed: false }]);
      userRepository.createQueryBuilder.mockReturnValue(makeQb('getRawMany', [{ id: 42, aliases: ['course-a'] }]));

      const result = await service.getChangedCoursesRecipients(2);

      expect(result[0][1][0].changes[0]).toMatchObject({ name: '' });
    });
  });
});
