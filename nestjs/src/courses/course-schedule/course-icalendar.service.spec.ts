import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { User } from '@entities/user';
import { CourseICalendarService } from './course-icalendar.service';
import {
  CourseScheduleDataSource,
  CourseScheduleItem,
  CourseScheduleItemStatus,
  CourseScheduleItemTag,
} from './course-schedule.service';

const userRepository = { findOneByOrFail: vi.fn() };

function makeItem(overrides: Partial<CourseScheduleItem> = {}): CourseScheduleItem {
  return {
    id: 1,
    courseId: 333,
    name: 'Sample Task',
    startDate: new Date('2022-03-22T09:00:00.000Z'),
    endDate: new Date('2022-03-22T11:00:00.000Z'),
    status: CourseScheduleItemStatus.Available,
    tag: CourseScheduleItemTag.Coding,
    type: CourseScheduleDataSource.CourseTask,
    ...overrides,
  } as CourseScheduleItem;
}

describe('CourseICalendarService', () => {
  let service: CourseICalendarService;

  beforeEach(async () => {
    Object.values(userRepository).forEach(fn => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseICalendarService, { provide: getRepositoryToken(User), useValue: userRepository }],
    }).compile();

    service = module.get<CourseICalendarService>(CourseICalendarService);
  });

  describe('validateUserCourse', () => {
    it('returns true when the payload course matches and the user exists', async () => {
      userRepository.findOneByOrFail.mockResolvedValue({ id: 1, githubId: 'john-doe' });

      const result = await service.validateUserCourse(11, { githubId: 'john-doe', courseId: 11 });

      expect(result).toBe(true);
      expect(userRepository.findOneByOrFail).toHaveBeenCalledWith({ githubId: 'john-doe' });
    });

    it('coerces a stringified payload course id before comparison', async () => {
      userRepository.findOneByOrFail.mockResolvedValue({ id: 1, githubId: 'john-doe' });

      const result = await service.validateUserCourse(11, {
        githubId: 'john-doe',
        courseId: '11' as unknown as number,
      });

      expect(result).toBe(true);
    });

    it('throws BadRequestException when the course id does not match', async () => {
      await expect(service.validateUserCourse(11, { githubId: 'john-doe', courseId: 99 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(userRepository.findOneByOrFail).not.toHaveBeenCalled();
    });

    it('propagates the rejection when the user cannot be found', async () => {
      userRepository.findOneByOrFail.mockRejectedValue(new Error('user not found'));

      await expect(service.validateUserCourse(11, { githubId: 'ghost', courseId: 11 })).rejects.toThrow(
        'user not found',
      );
    });
  });

  describe('getICalendar', () => {
    it('produces a VCALENDAR with calendar name and the timezone', async () => {
      const ics = await service.getICalendar([makeItem()], 'RS Course', 'Europe/London');

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('X-WR-CALNAME:RS Course');
      expect(ics).toContain('Europe/London');
    });

    it('creates one VEVENT per schedule item', async () => {
      const items = [makeItem({ id: 1 }), makeItem({ id: 2, name: 'Second' })];

      const ics = await service.getICalendar(items, 'RS Course', 'Europe/London');

      const eventCount = ics.split('BEGIN:VEVENT').length - 1;
      expect(eventCount).toBe(2);
      expect(ics).toContain('SUMMARY:Sample Task');
      expect(ics).toContain('SUMMARY:Second');
    });

    it('suffixes the id for cross-check review events to keep ids unique', async () => {
      const items = [
        makeItem({ id: 5, tag: CourseScheduleItemTag.CrossCheckSubmit }),
        makeItem({ id: 5, tag: CourseScheduleItemTag.CrossCheckReview }),
      ];

      const ics = await service.getICalendar(items, 'RS Course', 'Europe/London');

      expect(ics).toContain('UID:5');
      expect(ics).toContain('UID:5-1');
    });

    it('defaults the end date to one hour after the start when endDate is missing', async () => {
      const item = makeItem({
        startDate: new Date('2022-03-22T09:00:00.000Z'),
        endDate: undefined as unknown as Date,
      });

      const ics = await service.getICalendar([item], 'UTC', 'UTC');

      // The default endDate is start + 1h. With the suite pinned to TZ=UTC and a
      // UTC calendar, the instants are emitted faithfully: 09:00Z start, 10:00Z end.
      expect(ics).toContain('DTSTART:20220322T090000Z');
      expect(ics).toContain('DTEND:20220322T100000Z');
    });

    it('formats start/end in the requested timezone', async () => {
      const item = makeItem({
        startDate: new Date('2022-03-22T09:00:00.000Z'),
        endDate: new Date('2022-03-22T11:00:00.000Z'),
      });

      const ics = await service.getICalendar([item], 'RS Course', 'America/New_York');

      // New York is UTC-4 in March (DST) -> 05:00 / 07:00 (emitted as floating
      // local time tied to the calendar's America/New_York VTIMEZONE).
      expect(ics).toContain('DTSTART:20220322T050000');
      expect(ics).toContain('DTEND:20220322T070000');
    });

    it('includes an organizer when present', async () => {
      const item = makeItem({
        organizer: { id: 9, name: 'Jane Roe', githubId: 'jane' },
      });

      const ics = await service.getICalendar([item], 'RS Course', 'UTC');

      expect(ics).toContain('ORGANIZER');
      expect(ics).toContain('Jane Roe');
      expect(ics).toContain('user@example.com');
    });

    it('omits the organizer line when there is no organizer', async () => {
      const ics = await service.getICalendar([makeItem({ organizer: undefined })], 'RS Course', 'UTC');

      expect(ics).not.toContain('ORGANIZER');
    });

    it('throws when an organizer is present but its name is empty', async () => {
      // The source uses `item.organizer?.name ?? ''`, but ical-generator rejects an
      // empty organizer name, so the `?? ''` fallback surfaces as a thrown error.
      // In practice PersonDto.getName never returns '' (it yields '(Empty)'), so this
      // path is unreachable from real callers; we still pin the current behaviour.
      const item = makeItem({
        organizer: { id: 9, name: '' as unknown as string, githubId: 'jane' },
      });

      await expect(service.getICalendar([item], 'RS Course', 'UTC')).rejects.toThrow('`organizer.name` is empty');
    });

    it('adds a url when descriptionUrl is provided', async () => {
      const item = makeItem({ descriptionUrl: 'https://example.com/task' });

      const ics = await service.getICalendar([item], 'RS Course', 'UTC');

      expect(ics).toContain('URL');
      expect(ics).toContain('https://example.com/task');
    });

    it('handles an empty schedule by producing a calendar with no events', async () => {
      const ics = await service.getICalendar([], 'Empty Course', 'UTC');

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics.split('BEGIN:VEVENT').length - 1).toBe(0);
    });
  });

  describe('getICalendar description', () => {
    it('includes organizer, max score and score weight lines when all present', async () => {
      const item = makeItem({
        organizer: { id: 9, name: 'Jane Roe', githubId: 'jane' },
        maxScore: 100,
        scoreWeight: 2,
      });

      const ics = await service.getICalendar([item], 'RS Course', 'UTC');

      // ICS escapes the comma/newline; assert the human-readable fragments survive.
      expect(ics).toContain('Organizer: Jane Roe (@jane)');
      expect(ics).toContain('Max Score: 100');
      expect(ics).toContain('Score Weight: 2');
    });

    it('omits the max score and score weight lines when those fields are falsy', async () => {
      const item = makeItem({
        organizer: undefined,
        maxScore: 0,
        scoreWeight: 0,
      });

      const ics = await service.getICalendar([item], 'RS Course', 'UTC');

      expect(ics).not.toContain('Max Score');
      expect(ics).not.toContain('Score Weight');
      expect(ics).not.toContain('Organizer');
    });

    it('includes only the organizer line when scores are absent', async () => {
      const item = makeItem({
        organizer: { id: 9, name: 'Jane Roe', githubId: 'jane' },
        maxScore: undefined,
        scoreWeight: undefined,
      });

      const ics = await service.getICalendar([item], 'RS Course', 'UTC');

      expect(ics).toContain('Organizer: Jane Roe (@jane)');
      expect(ics).not.toContain('Max Score');
      expect(ics).not.toContain('Score Weight');
    });
  });
});
