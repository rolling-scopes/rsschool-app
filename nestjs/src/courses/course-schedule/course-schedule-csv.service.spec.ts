import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseScheduleService } from './course-schedule.service';

const fixtureCourseTasks = [
  {
    id: 21,
    taskId: 5,
    type: 'jstask',
    studentStartDate: '2024-03-01T10:00:00.000Z',
    studentEndDate: '2024-03-08T23:59:00.000Z',
    checker: 'mentor',
    pairsCount: null,
    task: { name: 'JS Task', descriptionUrl: 'https://example.com/js', type: 'jstask' },
    taskOwner: { githubId: 'task-owner' },
  },
  {
    id: 22,
    taskId: 6,
    type: null,
    studentStartDate: '2024-01-10T08:00:00.000Z',
    studentEndDate: '2024-01-20T20:00:00.000Z',
    checker: 'auto-test',
    pairsCount: 4,
    task: { name: 'Test Task', descriptionUrl: 'https://example.com/test', type: 'selfeducation' },
    taskOwner: null,
  },
];

const fixtureCourseEvents = [
  {
    id: 31,
    eventId: 7,
    dateTime: new Date('2024-02-15T08:30:00.000Z'),
    special: 'urgent',
    place: 'Discord',
    event: { name: 'Kickoff', descriptionUrl: 'https://example.com/kickoff', type: 'lecture' },
    organizer: { githubId: 'org-anna' },
  },
  {
    id: 32,
    eventId: 8,
    dateTime: null,
    special: '',
    place: null,
    event: { name: 'TBD Event', descriptionUrl: 'https://example.com/tbd', type: 'meetup' },
    organizer: null,
  },
];

const expectedRows = [
  {
    entityType: 'task',
    templateId: 6,
    id: 22,
    startDate: '2024-01-10 11:00',
    endDate: '2024-01-20 23:00',
    type: 'selfeducation',
    name: 'Test Task',
    descriptionUrl: 'https://example.com/test',
    githubId: null,
    place: null,
    checker: 'auto-test',
    pairsCount: 4,
  },
  {
    entityType: 'event',
    templateId: 7,
    id: 31,
    startDate: '2024-02-15 11:30',
    type: 'lecture',
    special: 'urgent',
    name: 'Kickoff',
    descriptionUrl: 'https://example.com/kickoff',
    githubId: 'org-anna',
    place: 'Discord',
    checker: null,
    pairsCount: null,
  },
  {
    entityType: 'task',
    templateId: 5,
    id: 21,
    startDate: '2024-03-01 13:00',
    endDate: '2024-03-09 02:59',
    type: 'jstask',
    name: 'JS Task',
    descriptionUrl: 'https://example.com/js',
    githubId: 'task-owner',
    place: null,
    checker: 'mentor',
    pairsCount: null,
  },
  {
    entityType: 'event',
    templateId: 8,
    id: 32,
    startDate: '',
    type: 'meetup',
    special: '',
    name: 'TBD Event',
    descriptionUrl: 'https://example.com/tbd',
    githubId: null,
    place: null,
    checker: null,
    pairsCount: null,
  },
];

function createFakeQueryBuilder(content: unknown[], methods: string[]) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of methods) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getMany = vi.fn(async () => content);
  return { qb, calls };
}

describe('CourseScheduleService.getScheduleAsCsvRows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup() {
    const { qb: taskQb, calls: taskCalls } = createFakeQueryBuilder(fixtureCourseTasks, [
      'innerJoinAndSelect',
      'leftJoin',
      'addSelect',
      'where',
      'andWhere',
    ]);
    const { qb: eventQb, calls: eventCalls } = createFakeQueryBuilder(fixtureCourseEvents, [
      'innerJoinAndSelect',
      'leftJoin',
      'addSelect',
      'where',
      'orderBy',
    ]);

    const service = new CourseScheduleService(
      {} as never,
      { createQueryBuilder: vi.fn(() => taskQb) } as never,
      { createQueryBuilder: vi.fn(() => eventQb) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    return { service, taskCalls, eventCalls };
  }

  it('builds the same queries as the legacy getCourseTasksWithOwner/getEvents', async () => {
    const { service, taskCalls, eventCalls } = setup();

    await service.getScheduleAsCsvRows(11, 'Europe/Minsk');

    expect(taskCalls.innerJoinAndSelect).toEqual([['courseTask.task', 'task']]);
    expect(taskCalls.leftJoin).toEqual([['courseTask.taskOwner', 'taskOwner']]);
    expect(taskCalls.addSelect).toEqual([
      [['taskOwner.githubId', 'taskOwner.id', 'taskOwner.firstName', 'taskOwner.lastName']],
    ]);
    expect(taskCalls.where).toEqual([['courseTask.courseId = :courseId', { courseId: 11 }]]);
    expect(taskCalls.andWhere).toEqual([['courseTask.disabled = :disabled', { disabled: false }]]);

    expect(eventCalls.innerJoinAndSelect).toEqual([['courseEvent.event', 'event']]);
    expect(eventCalls.leftJoin).toEqual([['courseEvent.organizer', 'organizer']]);
    expect(eventCalls.addSelect).toEqual([
      [['organizer.id', 'organizer.firstName', 'organizer.lastName', 'organizer.githubId']],
    ]);
    expect(eventCalls.where).toEqual([['courseEvent.courseId = :courseId', { courseId: 11 }]]);
    expect(eventCalls.orderBy).toEqual([['courseEvent.dateTime']]);
  });

  it('maps tasks and events to csv rows sorted by start date', async () => {
    const { service } = setup();

    const rows = await service.getScheduleAsCsvRows(11, 'Europe/Minsk');

    expect(rows).toEqual(expectedRows);
  });

  it('formats dates in the requested timezone', async () => {
    const { service } = setup();

    const rows = await service.getScheduleAsCsvRows(11, 'America/New_York');

    expect(rows.map(({ startDate }) => startDate)).toEqual([
      '2024-01-10 03:00',
      '2024-02-15 03:30',
      '2024-03-01 05:00',
      '',
    ]);
  });
});
