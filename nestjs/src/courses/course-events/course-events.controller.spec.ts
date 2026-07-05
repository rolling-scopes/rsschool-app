import { Test, TestingModule } from '@nestjs/testing';
import { CourseEvent } from '@entities/courseEvent';
import { CourseEventsController } from './course-events.controller';
import { CourseEventsService } from './course-events.service';

// Fixtures mirrored from server/src/routes/course/__test__/events.test.ts to prove business-logic equivalence
const mockCourseId = 7;

const mockOrganizer = {
  id: 10,
  firstName: 'John',
  lastName: 'Doe',
  githubId: 'john-doe',
};

const mockCourseEvents = [
  {
    id: 101,
    eventId: 1,
    courseId: mockCourseId,
    event: {
      id: 1,
      name: 'Intro Lecture',
      type: 'lecture_online',
      description: 'Course introduction',
      descriptionUrl: 'https://example.com/intro',
      disciplineId: 3,
    },
    organizer: mockOrganizer,
    organizerId: mockOrganizer.id,
    dateTime: new Date('2026-01-10T10:00:00.000Z'),
    endTime: new Date('2026-01-10T12:00:00.000Z'),
    place: 'Online',
    comment: 'Bring questions',
    special: 'registration',
  },
  {
    id: 102,
    eventId: 2,
    courseId: mockCourseId,
    event: {
      id: 2,
      name: 'Final Workshop',
      type: 'workshop',
      description: null,
      descriptionUrl: null,
      disciplineId: null,
    },
    organizer: null,
    organizerId: null,
    dateTime: null,
    endTime: null,
    place: null,
    comment: null,
    special: '',
  },
] as unknown as CourseEvent[];

const mockGetCourseEvents = vi.fn();

const mockCourseEventsServiceFactory = vi.fn(() => ({
  getCourseEvents: mockGetCourseEvents,
}));

describe('CourseEventsController', () => {
  let controller: CourseEventsController;

  beforeEach(async () => {
    mockGetCourseEvents.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseEventsController],
      providers: [{ provide: CourseEventsService, useFactory: mockCourseEventsServiceFactory }],
    }).compile();

    controller = module.get(CourseEventsController);
  });

  describe('getCourseEvents', () => {
    it('requests events for courseId from route params', async () => {
      mockGetCourseEvents.mockResolvedValue(mockCourseEvents);

      await controller.getCourseEvents(mockCourseId);

      expect(mockGetCourseEvents).toHaveBeenCalledTimes(1);
      expect(mockGetCourseEvents).toHaveBeenCalledWith(mockCourseId);
    });

    it('returns service result with data values identical to the legacy response', async () => {
      mockGetCourseEvents.mockResolvedValue(mockCourseEvents);

      const result = await controller.getCourseEvents(mockCourseId);

      // Same data as legacy `{ data: CourseEvent[] }`, flattened per nestjs DTO conventions
      expect(result).toEqual([
        {
          id: 101,
          eventId: 1,
          name: 'Intro Lecture',
          type: 'lecture_online',
          description: 'Course introduction',
          descriptionUrl: 'https://example.com/intro',
          dateTime: '2026-01-10T10:00:00.000Z',
          endTime: '2026-01-10T12:00:00.000Z',
          place: 'Online',
          comment: 'Bring questions',
          special: 'registration',
          disciplineId: 3,
          organizer: { id: 10, name: 'John Doe', githubId: 'john-doe' },
        },
        {
          id: 102,
          eventId: 2,
          name: 'Final Workshop',
          type: 'workshop',
          description: null,
          descriptionUrl: null,
          dateTime: null,
          endTime: null,
          place: null,
          comment: null,
          special: '',
          disciplineId: null,
          organizer: null,
        },
      ]);
    });

    it('returns an empty list when course has no events', async () => {
      mockGetCourseEvents.mockResolvedValue([]);

      const result = await controller.getCourseEvents(mockCourseId);

      expect(result).toEqual([]);
    });
  });
});
